import { supabase } from '@/lib/db';
import CommunityChessClient from './CommunityChessClient';
import { Chess } from 'chess.js';

export const dynamic = 'force-dynamic';

async function getGameState() {
  try {
    // 1. Intentar obtener la partida principal
    let { data: game, error: gameError } = await supabase
      .from('CommunityChessGame')
      .select(`
        fen,
        nextMoveDue,
        votes:CommunityVote ( move )
      `)
      .eq('id', 'main_game')
      .single();

    if (gameError && gameError.code !== 'PGRST116') { // PGRST116 = 'single row not found'
      throw new Error(`Supabase game fetch error: ${gameError.message}`);
    }

    // 2. Si no existe, crearla
    if (!game) {
      console.log("No game found via Supabase, attempting to create one.");
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      
      const { data: newGame, error: createError } = await supabase
        .from('CommunityChessGame')
        .insert({
          id: 'main_game',
          fen: new Chess().fen(),
          nextMoveDue: threeDaysFromNow.toISOString(),
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Supabase game creation error: ${createError.message}`);
      }
      
      game = { ...newGame, votes: [] }; // Estructura consistente
      console.log("Successfully created a new game via Supabase.");
    }
    
    // 3. Procesar los votos (igual que antes)
    const voteCounts = (game.votes || []).reduce((acc: any, vote: any) => {
      acc[vote.move] = (acc[vote.move] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalVotes = (game.votes || []).length;
    const sortedVotes = Object.entries(voteCounts).sort(([, a], [, b]) => b - a);

    // 4. Preparar los datos para el cliente (igual que antes)
    const chessInstance = new Chess(game.fen);
    const cleanGameData = {
      fen: game.fen,
      turn: chessInstance.turn(),
      nextMoveDue: game.nextMoveDue,
      sortedVotes: sortedVotes,
      totalVotes: totalVotes,
    };

    return { data: cleanGameData, error: null };

  } catch (error: any) {
    console.error("A radical error occurred in getGameState:", error.message);
    const defaultFen = new Chess().fen();
    return { 
      data: {
        fen: defaultFen,
        turn: 'w',
        nextMoveDue: new Date().toISOString(),
        sortedVotes: [],
        totalVotes: 0,
      }, 
      error: `Error de Supabase: ${error.message}`
    };
  }
}

export default async function CommunityChessPage() {
  const { data, error } = await getGameState();
  
  // El cliente ahora siempre recibe datos, incluso en caso de error.
  // El propio cliente se encargará de mostrar el mensaje de error.
  return <CommunityChessClient gameData={data} error={error} />;
}
