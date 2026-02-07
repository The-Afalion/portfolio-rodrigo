import { supabaseAdmin } from '@/lib/db'; // Usamos el cliente de admin
import CommunityChessClient from './CommunityChessClient';
import { Chess } from 'chess.js';

export const dynamic = 'force-dynamic';

async function getGameState() {
  try {
    // Usamos supabaseAdmin para todas las operaciones de servidor
    let { data: game, error: gameError } = await supabaseAdmin
      .from('CommunityChessGame')
      .select(`
        fen,
        nextMoveDue,
        votes:CommunityVote ( move )
      `)
      .eq('id', 'main_game')
      .single();

    if (gameError && gameError.code !== 'PGRST116') {
      throw new Error(`Supabase game fetch error: ${gameError.message}`);
    }

    if (!game) {
      console.log("No game found, creating one with admin client.");
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      
      const { data: newGame, error: createError } = await supabaseAdmin
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
      
      game = { ...newGame, votes: [] };
      console.log("Successfully created a new game via Supabase admin.");
    }
    
    const voteCounts = (game.votes || []).reduce((acc: any, vote: any) => {
      acc[vote.move] = (acc[vote.move] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalVotes = (game.votes || []).length;
    const sortedVotes = Object.entries(voteCounts).sort(([, a], [, b]) => b - a);

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
    console.error("Error in getGameState with admin client:", error.message);
    const defaultFen = new Chess().fen();
    return { 
      data: {
        fen: defaultFen,
        turn: 'w',
        nextMoveDue: new Date().toISOString(),
        sortedVotes: [],
        totalVotes: 0,
      }, 
      error: `Error de base de datos: ${error.message}`
    };
  }
}

export default async function CommunityChessPage() {
  const { data, error } = await getGameState();
  return <CommunityChessClient gameData={data} error={error} />;
}
