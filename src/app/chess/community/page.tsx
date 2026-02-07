import prisma from '@/lib/prisma';
import CommunityChessClient from './CommunityChessClient';
import { Chess } from 'chess.js';

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
      console.log("No game found, attempting to create one.");
      try {
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        game = await prisma.communityChessGame.create({
          data: {
            id: 'main_game',
            fen: new Chess().fen(),
            nextMoveDue: threeDaysFromNow,
          },
          include: { votes: true },
        });
        console.log("Successfully created a new game.");
      } catch (creationError) {
        console.error("FATAL: Failed to create new game.", creationError);
        // Si la creación falla, no podemos continuar.
        return { 
          data: null, 
          error: "Error crítico: No se pudo inicializar la partida en la base de datos." 
        };
      }
    }
    
    const voteCounts = game.votes.reduce((acc, vote) => {
      acc[vote.move] = (acc[vote.move] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalVotes = game.votes.length;
    const sortedVotes = Object.entries(voteCounts).sort(([, a], [, b]) => b - a);

    const chessInstance = new Chess(game.fen);

    const cleanGameData = {
      fen: game.fen,
      turn: chessInstance.turn(),
      nextMoveDue: game.nextMoveDue.toISOString(),
      sortedVotes: sortedVotes,
      totalVotes: totalVotes,
    };

    return { data: cleanGameData, error: null };

  } catch (error) {
    console.error("Error fetching game state:", error);
    const defaultFen = new Chess().fen();
    return { 
      data: {
        fen: defaultFen,
        turn: 'w',
        nextMoveDue: new Date().toISOString(),
        sortedVotes: [],
        totalVotes: 0,
      }, 
      error: "No se pudo conectar con la base de datos para cargar la partida." 
    };
  }
}

export default async function CommunityChessPage() {
  const { data, error } = await getGameState();

  if (!data) {
    // Si la creación de la partida falló, mostramos un error fatal.
    return <div className="min-h-screen flex items-center justify-center text-red-500 font-mono">{error}</div>;
  }

  return <CommunityChessClient gameData={data} error={error} />;
}
