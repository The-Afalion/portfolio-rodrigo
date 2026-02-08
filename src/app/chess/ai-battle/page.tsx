import { supabaseAdmin } from '@/lib/db';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import FondoAjedrez from '@/components/FondoAjedrez';
import TournamentClient from './TournamentClient';

export const dynamic = 'force-dynamic';

async function getInitialTournamentData() {
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

    if (error && error.code !== 'PGRST116') throw new Error(error.message);

    const { data: leaderboard } = await supabaseAdmin
      .from('ChessPlayer')
      .select('name, elo, winsDaily, winsWeekly, winsMonthly, winsTotal')
      .eq('isAI', true)
      .order('elo', { ascending: false });

    return { tournament, leaderboard: leaderboard || [] };

  } catch (error: any) {
    console.error("Error fetching initial tournament data:", error.message);
    return { tournament: null, leaderboard: [] };
  }
}

export default async function AiBattlePage() {
  const { tournament, leaderboard } = await getInitialTournamentData();

  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8 relative overflow-hidden">
      <FondoAjedrez />
      <div className="absolute top-6 left-6 z-20">
        <Link href="/#chess-hub" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-mono">
          <ArrowLeft size={20} />
          Volver al Laboratorio
        </Link>
      </div>

      <div className="text-center mb-12 z-10 relative">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground to-muted-foreground">
          Torneo de Titanes
        </h1>
        <p className="text-muted-foreground font-mono mt-2">Las IAs combaten por la supremacía. Cada hora, una nueva batalla.</p>
      </div>

      <div className="max-w-7xl mx-auto z-10 relative">
        <TournamentClient initialTournament={tournament} initialLeaderboard={leaderboard} />
      </div>
    </main>
  );
}
