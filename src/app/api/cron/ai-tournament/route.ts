import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Esta es una versión simplificada. Un torneo real requeriría un estado más complejo.
// Por ahora, simula un torneo y declara un ganador aleatorio.
export async function GET() {
  try {
    const ias = await prisma.chessPlayer.findMany({ where: { isAI: true, NOT: { name: 'System' } } });
    if (ias.length < 2) throw new Error("Not enough AIs for a tournament");

    // Simulación simple: elegir un ganador aleatorio
    const winner = ias[Math.floor(Math.random() * ias.length)];

    // Registrar el torneo
    await prisma.aITournament.create({
      data: {
        winner: winner.name,
      },
    });

    // Actualizar las victorias del ganador
    await prisma.chessPlayer.update({
      where: { id: winner.id },
      data: {
        wins: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ success: true, tournament_winner: winner.name });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
