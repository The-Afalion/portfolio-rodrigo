import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

// Unir a cola o comprobar estado de colas
export async function POST(req: Request) {
  try {
    const supabase = createClient(cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { gameKey, action = "join" } = await req.json();

    if (!gameKey) {
      return NextResponse.json({ error: "Falta gameKey" }, { status: 400 });
    }

    // Limpiar colas viejas o cancelar
    if (action === "leave") {
      await prisma.arcadeQueue.deleteMany({
        where: { userId: user.id }
      });
      return NextResponse.json({ success: true, status: "left" });
    }

    // Comprobar si ya estamos en cola
    const myExistingQueue = await prisma.arcadeQueue.findFirst({
      where: { userId: user.id, gameKey }
    });

    if (myExistingQueue) {
      if (myExistingQueue.matched) {
        // Fuimos emparejados! Borramos nuestra entrada porque ya entramos al juego
        await prisma.arcadeQueue.delete({ where: { id: myExistingQueue.id } });
        return NextResponse.json({ matchId: myExistingQueue.matchId, matched: true, role: "player1" });
      } else {
        return NextResponse.json({ status: "waiting", matched: false });
      }
    }

    // Buscar a otro jugador esperando en este juego
    const opponent = await prisma.arcadeQueue.findFirst({
      where: { gameKey, matched: false, userId: { not: user.id } },
      orderBy: { joinedAt: 'asc' }
    });

    if (opponent) {
      const matchId = uuidv4();
      
      // Emparejamos al oponente
      await prisma.arcadeQueue.update({
        where: { id: opponent.id },
        data: { matched: true, matchId }
      });

      return NextResponse.json({ matchId, matched: true, role: "player2" });
    } else {
      // Nos ponemos en la cola
      await prisma.arcadeQueue.create({
        data: {
          userId: user.id,
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
