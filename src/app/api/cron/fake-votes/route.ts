import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getRankedMoves } from '@/lib/chess-ai';

const FAKE_VOTES_PER_DAY = 50;
const FAKE_VOTES_PER_HOUR = Math.floor(FAKE_VOTES_PER_DAY / 24);

export async function GET() {
  try {
    const game = await prisma.communityChessGame.findUnique({ where: { id: 'main_game' } });
    if (!game) throw new Error("Game not found");

    const rankedMoves = getRankedMoves(game.fen, 2); // Profundidad baja para rapidez
    if (rankedMoves.length === 0) return NextResponse.json({ message: "No moves available" });

    const fakePlayer = await prisma.chessPlayer.findFirst({ where: { isAI: true, name: 'System' } });
    if (!fakePlayer) throw new Error("Fake player not found");

    const votesToCreate = [];
    let votesToDistribute = FAKE_VOTES_PER_HOUR;

    // Distribución de votos falsos
    const distribution = [
      { move: rankedMoves[0]?.move, maxVotes: 20 },
      { move: rankedMoves[1]?.move, maxVotes: 15 },
      { move: rankedMoves[2]?.move, maxVotes: 10 },
      { move: rankedMoves[3]?.move, maxVotes: 5 },
    ];

    for (const item of distribution) {
      if (item.move && votesToDistribute > 0) {
        const votes = Math.min(votesToDistribute, Math.floor(Math.random() * (item.maxVotes / 24)));
        for (let i = 0; i < votes; i++) {
          votesToCreate.push({
            move: item.move,
            isFake: true,
            playerId: fakePlayer.id,
            gameId: 'main_game',
          });
        }
        votesToDistribute -= votes;
      }
    }

    // Resto a movimientos menos populares
    while (votesToDistribute > 0 && rankedMoves.length > 4) {
      const randomMove = rankedMoves[Math.floor(4 + Math.random() * (rankedMoves.length - 4))].move;
      votesToCreate.push({
        move: randomMove,
        isFake: true,
        playerId: fakePlayer.id,
        gameId: 'main_game',
      });
      votesToDistribute--;
    }

    if (votesToCreate.length > 0) {
      await prisma.communityVote.createMany({ data: votesToCreate });
    }

    return NextResponse.json({ success: true, votes_added: votesToCreate.length });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
