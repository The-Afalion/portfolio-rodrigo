import { supabaseAdmin } from '@/lib/db';
import { Chess } from 'chess.js';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import dynamicImport from 'next/dynamic'; // Importación renombrada

// Usamos el nombre 'dynamicImport' para evitar el conflicto
const CommunityChessClient = dynamicImport(() => import('./CommunityChessClient'), {
  ssr: false,
  loading: () => <div className="min-h-screen flex items-center justify-center"><p>Cargando partida...</p></div>,
});

// Ahora no hay conflicto con la constante de renderizado de Next.js
export const dynamic = 'force-dynamic';

async function getGameState() {
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
  const playerEmailCookie = cookies().get('player-email');
  if (!playerEmailCookie) {
    redirect('/chess/community/register');
  }

  const { data, error } = await getGameState();

  return <CommunityChessClient gameData={data} error={error} playerEmail={playerEmailCookie.value} />;
}
