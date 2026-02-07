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

    // **LA SOLUCIÓN CLAVE**: Convertir las fechas a strings antes de pasarlas al cliente.
    // Los Server Components no pueden pasar objetos Date() como props.
    const serializableGame = {
      ...game,
      nextMoveDue: game.nextMoveDue.toISOString(),
      lastMoveAt: game.lastMoveAt.toISOString(),
    };

    return { game: serializableGame, sortedVotes, totalVotes, error: null };
  } catch (error) {
    console.error("Error fetching game state:", error);
    // Devolver un estado de error que el cliente pueda manejar
    return { game: null, sortedVotes: [], totalVotes: 0, error: "No se pudo cargar la partida." };
  }
}

export default async function CommunityChessPage() {
  const gameData = await getGameState();

  if (gameData.error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{gameData.error}</div>;
  }

  return <CommunityChessClient gameData={gameData} />;
}
