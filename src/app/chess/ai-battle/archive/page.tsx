import { supabaseAdmin } from '@/lib/db';
import Link from 'next/link';
import { ArrowLeft, Trophy } from 'lucide-react';
import FondoAjedrez from '@/components/FondoAjedrez';

async function getFinishedTournaments() {
  const { data, error } = await supabaseAdmin
    .from('AITournament')
    .select(`
      id,
      createdAt,
      winner:winnerId ( name )
    `)
    .eq('status', 'FINISHED')
    .order('createdAt', { ascending: false });

  if (error) {
    console.error("Error fetching finished tournaments:", error.message);
    return [];
  }
  return data;
}

export default async function ArchivePage() {
  const tournaments = await getFinishedTournaments();

  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8 relative overflow-hidden">
      <FondoAjedrez />
      <div className="absolute top-6 left-6 z-20">
        <Link href="/chess/ai-battle" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-mono">
          <ArrowLeft size={20} />
          Volver al Torneo en Directo
        </Link>
      </div>

      <div className="text-center mb-12 z-10 relative">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground to-muted-foreground">
          Archivo de Torneos
        </h1>
        <p className="text-muted-foreground font-mono mt-2">Revive las batallas del pasado y estudia a los campeones.</p>
      </div>

      <div className="max-w-2xl mx-auto z-10 relative space-y-4">
        {tournaments.length > 0 ? (
          tournaments.map(t => (
            <Link key={t.id} href={`/chess/ai-battle/archive/${t.id}`}>
              <div className="bg-secondary/50 backdrop-blur-sm border border-border rounded-lg p-4 flex justify-between items-center hover:border-blue-500 transition-colors">
                <div>
                  <p className="font-mono text-sm text-muted-foreground">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </p>
                  <p className="font-bold text-lg flex items-center gap-2">
                    <Trophy size={16} className="text-amber-400" />
                    Campeón: {t.winner?.name || 'Desconocido'}
                  </p>
                </div>
                <div className="font-mono text-xs bg-background px-2 py-1 rounded">
                  Ver Bracket
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center text-muted-foreground font-mono">
            Aún no ha finalizado ningún torneo.
          </div>
        )}
      </div>
    </main>
  );
}
