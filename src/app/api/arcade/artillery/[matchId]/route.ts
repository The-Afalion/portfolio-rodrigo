import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { getArcadeMemoryStore, pruneArcadeMemory, type MemoryArtillerySnapshot } from "@/lib/arcade-memory";

async function resolveIdentity(req: Request) {
  try {
    const supabase = createClient(cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) return { userId: user.id, hasSupabaseUser: true };
  } catch {
    // Local/offline fallback below.
  }

  const url = new URL(req.url);
  const fromQuery = url.searchParams.get("guestId");
  if (fromQuery) return { userId: fromQuery, hasSupabaseUser: false };
  const fromHeader = req.headers.get("x-guest-id");
  if (fromHeader) return { userId: fromHeader, hasSupabaseUser: false };

  try {
    const body = await req.clone().json();
    if (typeof body.guestId === "string") return { userId: body.guestId, hasSupabaseUser: false };
  } catch {
    // GET requests usually do not have a body.
  }

  return { userId: "", hasSupabaseUser: false };
}

function roleFor(match: ReturnType<typeof getArcadeMemoryStore>["artilleryMatches"] extends Map<string, infer T> ? T : never, userId: string) {
  if (match.players.player1 === userId) return "player1" as const;
  if (match.players.player2 === userId) return "player2" as const;
  if (match.players.player2 === "pending-player2") {
    match.players.player2 = userId;
    return "player2" as const;
  }
  return null;
}

export async function GET(req: Request, { params }: { params: { matchId: string } }) {
  pruneArcadeMemory();
  const { userId, hasSupabaseUser } = await resolveIdentity(req);
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  if (hasSupabaseUser) {
    const dbMatch = await prisma.arcadeMatch.findUnique({ where: { id: params.matchId } });
    if (dbMatch) {
      const role = dbMatch.player1Id === userId ? "player1" : dbMatch.player2Id === userId ? "player2" : null;
      if (!role) return NextResponse.json({ error: "No perteneces a esta partida" }, { status: 403 });

      return NextResponse.json({
        matchId: dbMatch.id,
        role,
        version: dbMatch.version,
        snapshot: dbMatch.snapshot,
      });
    }
  }

  const match = getArcadeMemoryStore().artilleryMatches.get(params.matchId);
  if (!match) return NextResponse.json({ error: "Partida no encontrada" }, { status: 404 });

  const role = roleFor(match, userId);
  if (!role) return NextResponse.json({ error: "No perteneces a esta partida" }, { status: 403 });

  match.updatedAt = Date.now();
  return NextResponse.json({
    matchId: match.id,
    role,
    version: match.version,
    snapshot: match.snapshot,
  });
}

export async function POST(req: Request, { params }: { params: { matchId: string } }) {
  pruneArcadeMemory();
  const { userId, hasSupabaseUser } = await resolveIdentity(req);
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const snapshot = body.snapshot as MemoryArtillerySnapshot | undefined;
  if (!snapshot?.game || !snapshot.wind || typeof snapshot.turn !== "number") {
    return NextResponse.json({ error: "Snapshot inválido" }, { status: 400 });
  }

  if (hasSupabaseUser) {
    const dbMatch = await prisma.arcadeMatch.findUnique({ where: { id: params.matchId } });
    if (dbMatch) {
      const role = dbMatch.player1Id === userId ? "player1" : dbMatch.player2Id === userId ? "player2" : null;
      if (!role) return NextResponse.json({ error: "No perteneces a esta partida" }, { status: 403 });

      const ownTurn = role === "player1" ? 1 : 2;
      const currentSnapshot = dbMatch.snapshot as MemoryArtillerySnapshot | null;
      const currentTurn = currentSnapshot?.turn ?? ownTurn;
      if (!currentSnapshot && snapshot.turn !== ownTurn) {
        return NextResponse.json({ error: "El primer estado debe crearlo el jugador inicial.", snapshot: dbMatch.snapshot, version: dbMatch.version }, { status: 409 });
      }
      if (currentTurn !== ownTurn) {
        return NextResponse.json({ error: "No es tu turno", snapshot: dbMatch.snapshot, version: dbMatch.version }, { status: 409 });
      }

      const updated = await prisma.arcadeMatch.update({
        where: { id: dbMatch.id },
        data: {
          snapshot: snapshot as any,
          version: { increment: 1 },
          status: snapshot.game && !(snapshot.game as any).p1?.alive || snapshot.game && !(snapshot.game as any).p2?.alive ? "COMPLETED" : dbMatch.status,
        },
      });

      return NextResponse.json({
        matchId: updated.id,
        role,
        version: updated.version,
        snapshot: updated.snapshot,
      });
    }
  }

  const match = getArcadeMemoryStore().artilleryMatches.get(params.matchId);
  if (!match) return NextResponse.json({ error: "Partida no encontrada" }, { status: 404 });

  const role = roleFor(match, userId);
  if (!role) return NextResponse.json({ error: "No perteneces a esta partida" }, { status: 403 });

  const ownTurn = role === "player1" ? 1 : 2;
  const currentTurn = match.snapshot?.turn ?? ownTurn;
  if (!match.snapshot && snapshot.turn !== ownTurn) {
    return NextResponse.json({ error: "El primer estado debe crearlo el jugador inicial.", snapshot: match.snapshot, version: match.version }, { status: 409 });
  }
  if (currentTurn !== ownTurn) {
    return NextResponse.json({ error: "No es tu turno", snapshot: match.snapshot, version: match.version }, { status: 409 });
  }

  match.snapshot = snapshot;
  match.version += 1;
  match.updatedAt = Date.now();

  return NextResponse.json({
    matchId: match.id,
    role,
    version: match.version,
    snapshot: match.snapshot,
  });
}
