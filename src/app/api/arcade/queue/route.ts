import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { ensureMemoryArcadeMatch, ensureMemoryArtilleryMatch, getArcadeMemoryStore, pruneArcadeMemory } from "@/lib/arcade-memory";
import { ensureProfileForUserSafely } from "@/lib/profile";

const ONLINE_ARCADE_GAMES = new Set(["artillery", "checkers", "battleship", "aetheria"]);

// Unir a cola o comprobar estado de colas
export async function POST(req: Request) {
  try {
    const { gameKey, action = "join", guestId } = await req.json();

    if (!gameKey) {
      return NextResponse.json({ error: "Falta gameKey" }, { status: 400 });
    }
    if (!ONLINE_ARCADE_GAMES.has(gameKey)) {
      return NextResponse.json({ error: "Este minijuego no tiene modo online." }, { status: 400 });
    }

    let userId = "";
    let authUser: Awaited<ReturnType<ReturnType<typeof createClient>["auth"]["getUser"]>>["data"]["user"] | null = null;
    let hasSupabaseUser = false;
    try {
      const supabase = createClient(cookies());
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        authUser = user;
        userId = user.id;
        hasSupabaseUser = true;
      }
    } catch {
      hasSupabaseUser = false;
    }

    if (!userId) {
      userId = typeof guestId === "string" && guestId.length > 8 ? guestId : "";
    }

    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    if (hasSupabaseUser && authUser) {
      await ensureProfileForUserSafely(authUser);
    }

    if (!hasSupabaseUser) {
      pruneArcadeMemory();
      const store = getArcadeMemoryStore();

      if (action === "leave") {
        store.queue = store.queue.filter((entry) => entry.userId !== userId);
        return NextResponse.json({ success: true, status: "left", mode: "memory" });
      }

      const myExistingQueue = store.queue.find((entry) => entry.userId === userId && entry.gameKey === gameKey);
      if (myExistingQueue) {
        if (myExistingQueue.matched && myExistingQueue.matchId) {
          store.queue = store.queue.filter((entry) => entry !== myExistingQueue);
          return NextResponse.json({ matchId: myExistingQueue.matchId, matched: true, role: "player1", mode: "memory" });
        }
        return NextResponse.json({ status: "waiting", matched: false, mode: "memory" });
      }

      const opponent = store.queue.find((entry) => entry.gameKey === gameKey && entry.userId !== userId && !entry.matched);
      if (opponent) {
        const matchId = uuidv4();
        opponent.matched = true;
        opponent.matchId = matchId;
        ensureMemoryArcadeMatch(matchId, opponent.userId, userId, gameKey);
        if (gameKey === "artillery") ensureMemoryArtilleryMatch(matchId, opponent.userId, userId, gameKey);
        return NextResponse.json({ matchId, matched: true, role: "player2", mode: "memory" });
      }

      store.queue.push({ userId, gameKey, joinedAt: Date.now() });
      return NextResponse.json({ status: "waiting", matched: false, mode: "memory" });
    }

    // Purgar colas viejas (más de 2 minutos) para evitar partidas fantasma
    const twoMinutesAgo = new Date(Date.now() - 120000);
    await prisma.arcadeQueue.deleteMany({
      where: { joinedAt: { lt: twoMinutesAgo } }
    });

    // Limpiar colas viejas de este usuario o cancelar
    if (action === "leave") {
      await prisma.arcadeQueue.deleteMany({
        where: { userId }
      });
      return NextResponse.json({ success: true, status: "left" });
    }

    // Comprobar si ya estamos en cola
    const myExistingQueue = await prisma.arcadeQueue.findFirst({
      where: { userId, gameKey }
    });

    if (myExistingQueue) {
      if (myExistingQueue.matched) {
        // Fuimos emparejados! Borramos nuestra entrada porque ya entramos al juego
        await prisma.arcadeQueue.delete({ where: { id: myExistingQueue.id } });
        if (myExistingQueue.matchId) {
          ensureMemoryArcadeMatch(myExistingQueue.matchId, userId, "pending-player2", gameKey);
          if (gameKey === "artillery") ensureMemoryArtilleryMatch(myExistingQueue.matchId, userId, "pending-player2", gameKey);
        }
        return NextResponse.json({ matchId: myExistingQueue.matchId, matched: true, role: "player1" });
      } else {
        return NextResponse.json({ status: "waiting", matched: false });
      }
    }

    // Buscar a otro jugador esperando en este juego
    const opponent = await prisma.arcadeQueue.findFirst({
      where: { gameKey, matched: false, userId: { not: userId } },
      orderBy: { joinedAt: 'asc' }
    });

    if (opponent) {
      const matchId = uuidv4();
      
      // Emparejamos al oponente
      await prisma.arcadeQueue.update({
        where: { id: opponent.id },
        data: { matched: true, matchId }
      });
      await prisma.arcadeMatch.create({
        data: {
          id: matchId,
          gameKey,
          player1Id: opponent.userId,
          player2Id: userId,
        },
      });

      ensureMemoryArcadeMatch(matchId, opponent.userId, userId, gameKey);
      if (gameKey === "artillery") ensureMemoryArtilleryMatch(matchId, opponent.userId, userId, gameKey);
      return NextResponse.json({ matchId, matched: true, role: "player2" });
    } else {
      // Nos ponemos en la cola
      await prisma.arcadeQueue.create({
        data: {
          userId,
          gameKey,
          matched: false
        }
      });
      return NextResponse.json({ status: "waiting", matched: false });
    }

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
