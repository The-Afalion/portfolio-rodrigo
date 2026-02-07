import prisma from '@/lib/prisma';
import CommunityChessClient from './CommunityChessClient';

export const dynamic = 'force-dynamic';

async function getGameState() {
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

  // Convertir la fecha a string para que sea serializable
  const serializableGame = {
    ...game,
    nextMoveDue: game.nextMoveDue.toISOString(),
    lastMoveAt: game.lastMoveAt.toISOString(),
  };

  return { game: serializableGame, sortedVotes, totalVotes };
}

export default async function CommunityChessPage() {
  const gameData = await getGameState();

  return <CommunityChessClient gameData={gameData} />;
}
