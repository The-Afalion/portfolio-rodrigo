import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getArcadeMemoryStore, type MemoryArcadeSnapshot } from "@/lib/arcade-memory";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

type Identity = {
  userId: string;
  hasSupabaseUser: boolean;
};

function playerTurn(role: "player1" | "player2") {
  return role === "player1" ? 1 : 2;
}

function readTurn(snapshot: MemoryArcadeSnapshot | null | undefined) {
  if (!snapshot) return null;
  if (snapshot.turn === "player1") return 1;
  if (snapshot.turn === "player2") return 2;
  if (snapshot.turn === 1 || snapshot.turn === 2) return snapshot.turn;
  return null;
}

function resolveRole(userId: string, players: { player1: string; player2: string }) {
  if (players.player1 === userId) return "player1" as const;
  if (players.player2 === userId) return "player2" as const;
  return null;
}

async function resolveIdentity(req: Request): Promise<Identity> {
  let userId = "";
  let hasSupabaseUser = false;

  try {
    const supabase = createClient(cookies());
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.id) {
      userId = user.id;
      hasSupabaseUser = true;
    }
  } catch {
    hasSupabaseUser = false;
  }

  if (!userId) {
    const url = new URL(req.url);
    const queryGuest = url.searchParams.get("guestId");
    if (queryGuest && queryGuest.length > 8) userId = queryGuest;
  }

  return { userId, hasSupabaseUser };
}

export async function GET(req: Request, { params }: { params: { matchId: string } }) {
  const identity = await resolveIdentity(req);
  if (!identity.userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  if (identity.hasSupabaseUser) {
    const dbMatch = await prisma.arcadeMatch.findUnique({ where: { id: params.matchId } });
    if (dbMatch) {
      const role = resolveRole(identity.userId, { player1: dbMatch.player1Id, player2: dbMatch.player2Id });
      if (!role) return NextResponse.json({ error: "No perteneces a esta partida" }, { status: 403 });

      return NextResponse.json({
        matchId: dbMatch.id,
        gameKey: dbMatch.gameKey,
        role,
        snapshot: dbMatch.snapshot,
        status: dbMatch.status,
        version: dbMatch.version,
      });
    }
  }

  const match = getArcadeMemoryStore().arcadeMatches.get(params.matchId);
  if (!match) return NextResponse.json({ error: "Partida no encontrada" }, { status: 404 });

  const role = resolveRole(identity.userId, match.players);
  if (!role) return NextResponse.json({ error: "No perteneces a esta partida" }, { status: 403 });

  return NextResponse.json({
    matchId: match.id,
    gameKey: match.gameKey,
    role,
    snapshot: match.snapshot,
    status: match.status,
    version: match.version,
  });
}

export async function POST(req: Request, { params }: { params: { matchId: string } }) {
  const identity = await resolveIdentity(req);
  if (!identity.userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const snapshot = body?.snapshot as MemoryArcadeSnapshot | undefined;
  const incomingVersion = Number(body?.version ?? -1);

  if (!snapshot || typeof snapshot !== "object") {
    return NextResponse.json({ error: "Snapshot inválido" }, { status: 400 });
  }

  if (identity.hasSupabaseUser) {
    const dbMatch = await prisma.arcadeMatch.findUnique({ where: { id: params.matchId } });
    if (dbMatch) {
      const role = resolveRole(identity.userId, { player1: dbMatch.player1Id, player2: dbMatch.player2Id });
      if (!role) return NextResponse.json({ error: "No perteneces a esta partida" }, { status: 403 });

      const ownTurn = playerTurn(role);
      const currentSnapshot = (dbMatch.snapshot ?? null) as MemoryArcadeSnapshot | null;
      const currentTurn = readTurn(currentSnapshot);
      const firstTurn = readTurn(snapshot);

      if (!currentSnapshot && (role !== "player1" || firstTurn !== 1)) {
        return NextResponse.json({ error: "La partida debe inicializarla el jugador 1." }, { status: 409 });
      }
      if (currentSnapshot && currentTurn !== ownTurn) {
        return NextResponse.json({ error: "No es tu turno." }, { status: 409 });
      }
      if (incomingVersion >= 0 && incomingVersion !== dbMatch.version) {
        return NextResponse.json({ error: "La partida ya cambió. Sincronizando..." }, { status: 409 });
      }

      const nextStatus = typeof snapshot.status === "string" ? snapshot.status : dbMatch.status;
      const updated = await prisma.arcadeMatch.update({
        where: { id: params.matchId },
        data: {
          snapshot: snapshot as Prisma.InputJsonValue,
          status: nextStatus,
          version: { increment: 1 },
        },
      });

      return NextResponse.json({
        matchId: updated.id,
        gameKey: updated.gameKey,
        role,
        snapshot: updated.snapshot,
        status: updated.status,
        version: updated.version,
      });
    }
  }

  const match = getArcadeMemoryStore().arcadeMatches.get(params.matchId);
  if (!match) return NextResponse.json({ error: "Partida no encontrada" }, { status: 404 });

  const role = resolveRole(identity.userId, match.players);
  if (!role) return NextResponse.json({ error: "No perteneces a esta partida" }, { status: 403 });

  const ownTurn = playerTurn(role);
  const currentTurn = readTurn(match.snapshot);
  const firstTurn = readTurn(snapshot);

  if (!match.snapshot && (role !== "player1" || firstTurn !== 1)) {
    return NextResponse.json({ error: "La partida debe inicializarla el jugador 1." }, { status: 409 });
  }
  if (match.snapshot && currentTurn !== ownTurn) {
    return NextResponse.json({ error: "No es tu turno." }, { status: 409 });
  }
  if (incomingVersion >= 0 && incomingVersion !== match.version) {
    return NextResponse.json({ error: "La partida ya cambió. Sincronizando..." }, { status: 409 });
  }

  match.snapshot = snapshot;
  match.status = typeof snapshot.status === "string" ? snapshot.status : match.status;
  match.version += 1;
  match.updatedAt = Date.now();

  return NextResponse.json({
    matchId: match.id,
    gameKey: match.gameKey,
    role,
    snapshot: match.snapshot,
    status: match.status,
    version: match.version,
  });
}
