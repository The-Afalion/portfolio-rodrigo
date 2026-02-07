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
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      game = await prisma.communityChessGame.create({
        data: {
          id: 'main_game',
          fen: new Chess().fen(), // Asegurarse de que el FEN inicial esté aquí
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
    // Devolver un objeto con una estructura de datos por defecto en caso de error
    // para que el cliente no se rompa.
    const defaultFen = new Chess().fen();
    return { 
      data: {
        fen: defaultFen,
        turn: 'w',
        nextMoveDue: new Date().toISOString(),
        sortedVotes: [],
        totalVotes: 0,
      }, 
      error: "No se pudo cargar la partida. Se muestra un tablero por defecto." 
    };
  }
}

export default async function CommunityChessPage() {
  const { data, error } = await getGameState();

  // Aunque haya un error, renderizamos el cliente con datos por defecto
  // para evitar un error fatal en el lado del cliente.
  // El cliente puede entonces mostrar el mensaje de error.
  return <CommunityChessClient gameData={data} error={error} />;
}
