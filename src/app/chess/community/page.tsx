import { supabaseAdmin } from '@/lib/db';
import CommunityChessClient from './CommunityChessClient';
import { Chess } from 'chess.js';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function getGameState() {
  // ... (la lógica para obtener el estado del juego no cambia)
  try {
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
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      const { data: newGame, error: createError } = await supabaseAdmin
        .from('CommunityChessGame')
        .insert({ id: 'main_game', fen: new Chess().fen(), nextMoveDue: threeDaysFromNow.toISOString() })
        .select().single();
      if (createError) throw new Error(`Supabase game creation error: ${createError.message}`);
      game = { ...newGame, votes: [] };
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
    console.error("Error in getGameState:", error.message);
    const defaultFen = new Chess().fen();
    return { 
      data: { fen: defaultFen, turn: 'w', nextMoveDue: new Date().toISOString(), sortedVotes: [], totalVotes: 0 }, 
      error: `Error de base de datos: ${error.message}`
    };
  }
}

export default async function CommunityChessPage() {
  // 1. Comprobar si el jugador está "logueado"
  const playerEmailCookie = cookies().get('player-email');
  if (!playerEmailCookie) {
    redirect('/chess/community/register');
  }

  // 2. Obtener los datos de la partida
  const { data, error } = await getGameState();

  // 3. Pasar el email y los datos al cliente
  return <CommunityChessClient gameData={data} error={error} playerEmail={playerEmailCookie.value} />;
}
