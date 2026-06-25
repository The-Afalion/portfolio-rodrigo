import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { getArcadeMemoryStore, pruneArcadeMemory, type MemoryArtillerySnapshot } from "@/lib/arcade-memory";

async function resolveUserId(req: Request) {
  try {
    const supabase = createClient(cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) return user.id;
  } catch {
    // Local/offline fallback below.
  }

  const url = new URL(req.url);
  const fromQuery = url.searchParams.get("guestId");
  if (fromQuery) return fromQuery;
  const fromHeader = req.headers.get("x-guest-id");
  if (fromHeader) return fromHeader;

  try {
    const body = await req.clone().json();
    if (typeof body.guestId === "string") return body.guestId;
  } catch {
    // GET requests usually do not have a body.
  }

  return "";
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
  const userId = await resolveUserId(req);
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

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
  const userId = await resolveUserId(req);
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const match = getArcadeMemoryStore().artilleryMatches.get(params.matchId);
  if (!match) return NextResponse.json({ error: "Partida no encontrada" }, { status: 404 });

  const role = roleFor(match, userId);
  if (!role) return NextResponse.json({ error: "No perteneces a esta partida" }, { status: 403 });

  const body = await req.json();
  const snapshot = body.snapshot as MemoryArtillerySnapshot | undefined;
  if (!snapshot?.game || !snapshot.wind || typeof snapshot.turn !== "number") {
    return NextResponse.json({ error: "Snapshot inválido" }, { status: 400 });
  }

  const ownTurn = role === "player1" ? 1 : 2;
  const currentTurn = match.snapshot?.turn ?? ownTurn;
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
