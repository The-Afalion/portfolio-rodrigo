import prisma from '@/lib/prisma';
import CommunityChessClient from './CommunityChessClient';

export const dynamic = 'force-dynamic';

async function getGameState() {
  try {
    let game = await prisma.communityChessGame.findUnique({
      where: { id: 'main_game' },
      include: {
        votes: {
          select: { move: true },
        },
      },
    });

    if (!game) {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      game = await prisma.communityChessGame.create({
        data: {
          id: 'main_game',
          nextMoveDue: threeDaysFromNow,
        },
        include: { votes: true },
      });
    }
    
    const voteCounts = game.votes.reduce((acc, vote) => {
      acc[vote.move] = (acc[vote.move] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalVotes = game.votes.length;
    const sortedVotes = Object.entries(voteCounts).sort(([, a], [, b]) => b - a);

    // **LA SOLUCIÓN DEFINITIVA**: Construir un objeto 100% limpio y serializable.
    // No pasamos el objeto 'game' de Prisma, sino uno nuevo con solo lo que necesitamos.
    const cleanGameData = {
      fen: game.fen,
      turn: game.fen.split(' ')[1], // Extraemos el turno del FEN
      nextMoveDue: game.nextMoveDue.toISOString(),
      sortedVotes: sortedVotes,
      totalVotes: totalVotes,
    };

    return { data: cleanGameData, error: null };

  } catch (error) {
    console.error("Error fetching game state:", error);
    return { data: null, error: "No se pudo cargar la partida." };
  }
}

export default async function CommunityChessPage() {
  const { data, error } = await getGameState();

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  return <CommunityChessClient gameData={data} />;
}
