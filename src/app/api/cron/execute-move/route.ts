import { NextResponse } from 'next/server';
import { executeCommunityRound } from '@/lib/community-chess';
import { playTournamentMove } from '@/lib/ai-tournament-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Esta es la ruta que el Cron Job de Vercel llamará.
// GET /api/cron/execute-move
export async function GET(request: Request) {
  // 1. Proteger la ruta
  // El Cron Job de Vercel incluirá un secreto en la cabecera 'Authorization'.
  // Este secreto se debe configurar como una variable de entorno en Vercel.
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }

  // 2. Ejecutar la lógica de ajedrez con el único cron disponible en Vercel.
  try {
    const [communityResult, tournamentResult] = await Promise.allSettled([
      executeCommunityRound(),
      playTournamentMove(),
    ]);

    const community =
      communityResult.status === 'fulfilled'
        ? communityResult.value
        : { error: communityResult.reason instanceof Error ? communityResult.reason.message : 'No se pudo resolver la ronda comunitaria.' };

    const tournament =
      tournamentResult.status === 'fulfilled'
        ? tournamentResult.value
        : { message: tournamentResult.reason instanceof Error ? tournamentResult.reason.message : 'No se pudo avanzar el torneo.' };

    if ('error' in community && community.error) {
      console.error('Cron community error:', community.error);
    }

    console.log('Cron Job Success:', {
      community: 'message' in community ? community.message : null,
      tournament: tournament.message,
    });

    return NextResponse.json({
      success: !('error' in community && community.error) && tournamentResult.status === 'fulfilled',
      community,
      tournament,
    });
  } catch (error: any) {
    console.error('Cron Job Failed:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
