import { supabaseAdmin } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: tournament, error } = await supabaseAdmin
      .from('AITournament')
      .select(`
        id,
        status,
        winner:winnerId ( name ),
        matches:AITournamentMatch (
          *,
          player1:player1Id ( id, name, elo ),
          player2:player2Id ( id, name, elo ),
          winner:winnerId ( id, name )
        )
      `)
      .order('createdAt', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }

    const { data: leaderboard } = await supabaseAdmin
      .from('ChessBot')
      .select('name, elo, winsTotal')
      .order('elo', { ascending: false });

    return NextResponse.json({ tournament, leaderboard });

  } catch (error: any) {
    console.error("Error fetching tournament status:", error.message);
    return new Response(error.message, { status: 500 });
  }
}
