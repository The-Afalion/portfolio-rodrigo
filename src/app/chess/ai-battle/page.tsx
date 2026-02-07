import { supabaseAdmin } from '@/lib/db';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import FondoAjedrez from '@/components/FondoAjedrez';
import dynamicImport from 'next/dynamic'; // Importación renombrada

// Usamos el nombre 'dynamicImport' para evitar el conflicto
const TournamentClient = dynamicImport(() => import('./TournamentClient'), {
  ssr: false,
  loading: () => <div className="text-center font-mono animate-pulse">Cargando Torneo...</div>,
});

// Ahora no hay conflicto con la constante de renderizado de Next.js
export const dynamic = 'force-dynamic';

async function getTournamentData() {
  try {
    const { data: tournament, error: tourneyError } = await supabaseAdmin
      .from('AITournament')
      .select(`
        id,
        status,
        matches:AITournamentMatch (
          *,
          player1:player1Id ( id, name, elo ),
          player2:player2Id ( id, name, elo ),
          winner:winnerId ( id, name )
        )
      `)
      .eq('status', 'ACTIVE')
      .order('createdAt', { ascending: false })
      .limit(1)
      .single();

    if (tourneyError && tourneyError.code !== 'PGRST116') {
      console.error('Error fetching tournament:', tourneyError.message);
      throw new Error(`Error al buscar torneo: ${tourneyError.message}`);
    }

    const { data: leaderboard, error: leaderboardError } = await supabaseAdmin
      .from('ChessPlayer')
      .select('name, elo, winsDaily, winsWeekly, winsMonthly, winsTotal')
      .eq('isAI', true)
      .order('elo', { ascending: false });

    if (leaderboardError) {
      console.error('Error fetching leaderboard:', leaderboardError.message);
      throw new Error(`Error al cargar el leaderboard: ${leaderboardError.message}`);
    }

    return { tournament, leaderboard };

  } catch (error: any) {
    console.error("Fallo total en getTournamentData:", error.message);
    return { tournament: null, leaderboard: [] };
  }
}

export default async function AiBattlePage() {
  const { tournament, leaderboard } = await getTournamentData();

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
        {tournament ? (
          <TournamentClient tournament={tournament} leaderboard={leaderboard} />
        ) : (
          <div className="text-center bg-secondary/50 backdrop-blur-sm border border-border p-8 rounded-lg">
            <h2 className="text-2xl font-bold font-mono">Torneo en Preparación</h2>
            <p className="text-muted-foreground mt-2">Un nuevo torneo comenzará en la próxima hora. ¡Vuelve pronto para la acción!</p>
          </div>
        )}
      </div>
    </main>
  );
}
