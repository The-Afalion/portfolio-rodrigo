import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import FondoAjedrez from '@/components/FondoAjedrez';
import TournamentClient from './TournamentClient';
import { getLatestTournamentData } from '@/lib/ai-tournament-server';
import { getAuthenticatedChessUser } from '@/lib/chess-social';
import { ensureProfileForUserSafely } from '@/lib/profile';
import { getBettingMarkets, getUserBettingSummary } from '@/lib/tournament-betting';

export const dynamic = 'force-dynamic';

export default async function AiBattlePage() {
  const { tournament, leaderboard } = await getLatestTournamentData();
  const user = await getAuthenticatedChessUser().catch(() => null);
  const profile = user ? await ensureProfileForUserSafely(user) : null;
  const bettingSummary = await getUserBettingSummary(user?.id, tournament?.id);
  const bettingMarkets = getBettingMarkets(tournament, profile && "rodes" in profile ? { rodes: profile.rodes } : null);
  const betting = {
    ...bettingMarkets,
    wallet: bettingSummary.wallet,
    bets: bettingSummary.bets,
    isAuthenticated: Boolean(user),
  };

  return (
    <main className="min-h-screen bg-background text-foreground p-4 pt-24 sm:p-6 sm:pt-28 md:p-8 md:pt-28 relative overflow-hidden">
      <FondoAjedrez />
      <div className="relative z-20 mb-8 md:absolute md:left-6 md:top-24 md:mb-0">
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
        <TournamentClient initialTournament={tournament} initialLeaderboard={leaderboard} initialBetting={betting} />
      </div>
    </main>
  );
}
