import { supabaseAdmin } from '@/lib/db';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import FondoAjedrez from '@/components/FondoAjedrez';
import dynamicImport from 'next/dynamic';

// Corregimos la ruta de importación para que apunte al directorio padre
const ArchiveClient = dynamicImport(() => import('../ArchiveClient'), {
  ssr: false,
  loading: () => <div className="text-center font-mono animate-pulse">Cargando Archivo...</div>,
});

export const dynamic = 'force-dynamic';

async function getArchivedTournament(id: string) {
  const { data, error } = await supabaseAdmin
    .from('AITournament')
    .select(`
      id,
      createdAt,
      status,
      winner:winnerId ( name ),
      matches:AITournamentMatch (
        *,
        player1:player1Id ( id, name ),
        player2:player2Id ( id, name ),
        winner:winnerId ( id, name )
      )
    `)
    .eq('id', id)
    .eq('status', 'FINISHED')
    .single();

  if (error) {
    console.error(`Error fetching archived tournament ${id}:`, error.message);
    return null;
  }
  return data;
}

export default async function ArchivedTournamentPage({ params }: { params: { tournamentId: string } }) {
  const tournament = await getArchivedTournament(params.tournamentId);

  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8 relative overflow-hidden">
      <FondoAjedrez />
      <div className="absolute top-6 left-6 z-20">
        <Link href="/chess/ai-battle/archive" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-mono">
          <ArrowLeft size={20} />
          Volver al Archivo
        </Link>
      </div>

      <div className="text-center mb-12 z-10 relative">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground to-muted-foreground">
          Archivo del Torneo
        </h1>
        {tournament ? (
          <p className="text-muted-foreground font-mono mt-2">
            Finalizado el {new Date(tournament.createdAt).toLocaleDateString()} - Campeón: {tournament.winner?.name}
          </p>
        ) : (
          <p className="text-muted-foreground font-mono mt-2">
            No se encontró el torneo.
          </p>
        )}
      </div>

      <div className="max-w-7xl mx-auto z-10 relative">
        {tournament ? (
          <ArchiveClient tournament={tournament} />
        ) : (
          <div className="text-center text-muted-foreground font-mono">
            No se pudieron cargar los datos de este torneo.
          </div>
        )}
      </div>
    </main>
  );
}
