import prisma from '@/lib/prisma';
import { Trophy, Bot, Swords } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getTournamentData() {
  const leaderboard = await prisma.chessPlayer.findMany({
    where: { isAI: true, NOT: { name: 'System' } },
    orderBy: { wins: 'desc' },
    take: 8,
  });

  const lastTournament = await prisma.aITournament.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  return { leaderboard, lastTournament };
}

export default async function AiBattlePage() {
  const { leaderboard, lastTournament } = await getTournamentData();

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center p-8">
      <div className="text-center mb-16">
        <h1 className="text-6xl font-bold tracking-tighter mb-4">Batalla de IAs</h1>
        <p className="text-lg text-muted-foreground font-mono">Torneo diario de eliminación directa. Un nuevo campeón cada día.</p>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Columna Principal: Partida en Vivo (Placeholder) */}
        <div className="lg:col-span-2 bg-secondary border border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center">
          <h2 className="text-3xl font-bold mb-4">Torneo en Progreso</h2>
          <p className="text-muted-foreground mb-8">Los movimientos se realizan cada 10 segundos.</p>
          <div className="w-full max-w-md aspect-square bg-background rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground font-mono animate-pulse">Esperando al próximo torneo...</p>
          </div>
          <div className="mt-8 w-full flex justify-between items-center font-mono text-2xl font-bold">
            <span><Bot className="inline mr-2" /> {lastTournament?.winner || 'IA 1'}</span>
            <Swords className="text-blue-500" />
            <span>{leaderboard[1]?.name || 'IA 2'} <Bot className="inline ml-2" /></span>
          </div>
        </div>

        {/* Barra Lateral: Leaderboard */}
        <aside>
          <div className="bg-secondary border border-border rounded-2xl p-6">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Trophy className="text-yellow-500" />
              Leaderboard de Victorias
            </h3>
            <ol className="space-y-4">
              {leaderboard.map((ai, index) => (
                <li key={ai.id} className="flex items-center justify-between font-mono">
                  <span className="flex items-center gap-3">
                    <span className="font-bold text-lg">{index + 1}.</span>
                    <span>{ai.name}</span>
                  </span>
                  <span className="font-bold text-lg">{ai.wins} wins</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="text-center mt-4">
            <Link href="/chess" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              &larr; Volver al Laboratorio
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
