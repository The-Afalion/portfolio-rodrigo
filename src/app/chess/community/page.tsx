import { supabaseAdmin } from '@/lib/db';
import { Chess } from 'chess.js';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import dynamicImport from 'next/dynamic';
import ErrorDisplay from '@/components/ErrorDisplay';

const CommunityChessClient = dynamicImport(() => import('./CommunityChessClient'), {
  ssr: false,
  loading: () => <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-foreground animate-pulse">Cargando partida comunitaria...</p></div>,
});

export const dynamic = 'force-dynamic';

async function getGameState() {
  let { data: game, error: gameError } = await supabaseAdmin
    .from('CommunityChessGame')
    .select('fen, nextMoveDue, votes:CommunityVote(move)')
    .eq('id', 'main_game')
    .single();

  if (gameError && gameError.code !== 'PGRST116') {
    throw new Error(`Error al cargar la partida: ${gameError.message}`);
  }

  if (!game) {
    const oneDayFromNow = new Date();
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);
    const { data: newGame, error: createError } = await supabaseAdmin
      .from('CommunityChessGame')
      .insert({ id: 'main_game', fen: new Chess().fen(), nextMoveDue: oneDayFromNow.toISOString() })
      .select()
      .single();
    if (createError) throw new Error(`Error al crear la partida: ${createError.message}`);
    game = { ...newGame, votes: [] };
  }
  
  const voteCounts = (game.votes || []).reduce((acc: Record<string, number>, vote: { move: string }) => {
    acc[vote.move] = (acc[vote.move] || 0) + 1;
    return acc;
  }, {});

  const totalVotes = (game.votes || []).length;
  const sortedVotes = Object.entries(voteCounts).sort(([, a], [, b]) => b - a);

  const chessInstance = new Chess(game.fen);
  return {
    fen: game.fen,
    turn: chessInstance.turn(),
    nextMoveDue: game.nextMoveDue,
    sortedVotes: sortedVotes,
    totalVotes: totalVotes,
  };
}

export default async function CommunityChessPage() {
  const playerEmailCookie = cookies().get('player-email');
  const playerSideCookie = cookies().get('player-side');

  // Si falta CUALQUIERA de las cookies, se redirige al registro.
  if (!playerEmailCookie?.value || !playerSideCookie?.value) {
    redirect('/chess/community/register');
  }

  try {
    const gameData = await getGameState();
    return (
      <CommunityChessClient 
        gameData={gameData} 
        playerEmail={playerEmailCookie.value}
        playerSide={playerSideCookie.value as 'w' | 'b'}
      />
    );
  } catch (error: any) {
    return <ErrorDisplay error={error.message} />;
  }
}
