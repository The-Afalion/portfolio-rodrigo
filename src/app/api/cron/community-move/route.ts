import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { Chess } from 'chess.js';

export async function GET() {
  try {
    const game = await prisma.communityChessGame.findUnique({ where: { id: 'main_game' }, include: { votes: true } });
    if (!game) throw new Error("Game not found");

    // Si ya pasó la fecha, no hacer nada (esperar al próximo cron)
    if (new Date() < game.nextMoveDue) {
      return NextResponse.json({ message: "Not due yet" });
    }

    const chess = new Chess(game.fen);
    let moveToPlay: string | null = null;

    if (game.votes.length > 0) {
      const voteCounts = game.votes.reduce((acc, vote) => {
        acc[vote.move] = (acc[vote.move] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      moveToPlay = Object.keys(voteCounts).reduce((a, b) => voteCounts[a] > voteCounts[b] ? a : b);
    }

    if (moveToPlay) {
      chess.move(moveToPlay);
    } else {
      // Si no hay votos, la IA hace un movimiento por defecto
      const moves = chess.moves();
      moveToPlay = moves[Math.floor(Math.random() * moves.length)];
      chess.move(moveToPlay);
    }

    // Actualizar el juego
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    await prisma.communityChessGame.update({
      where: { id: 'main_game' },
      data: {
        fen: chess.fen(),
        nextMoveDue: threeDaysFromNow,
        lastMoveAt: new Date(),
      },
    });

    // Limpiar los votos para la siguiente ronda
    await prisma.communityVote.deleteMany({ where: { gameId: 'main_game' } });

    return NextResponse.json({ success: true, move: moveToPlay });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
