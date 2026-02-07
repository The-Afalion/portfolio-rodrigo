import prisma from '@/lib/prisma';
import { Crown, Shield, Swords } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getChessStats() {
  const totalGames = await prisma.chessGame.count();
  
  const results = await prisma.chessGame.groupBy({
    by: ['result'],
    _count: {
      result: true,
    },
  });

  const wins = results.find(r => r.result === '1-0')?._count.result || 0;
  const losses = results.find(r => r.result === '0-1')?._count.result || 0;
  const draws = results.find(r => r.result === '1/2-1/2')?._count.result || 0;

  const levelStats = await prisma.chessGame.groupBy({
    by: ['levelAI'],
    _count: {
      levelAI: true,
    },
    orderBy: {
      _count: {
        levelAI: 'desc',
      },
    },
  });

  return { totalGames, wins, losses, draws, levelStats };
}

export default async function ChessStatsPage() {
  const stats = await getChessStats();

  return (
    <main className="min-h-screen bg-background text-foreground p-4 pt-24">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-2 tracking-tighter">Estadísticas de Ajedrez</h1>
        <p className="text-muted-foreground font-mono mb-12">Resultados globales de las partidas Humano vs. Máquina.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-secondary p-6 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">Partidas Totales</h3>
              <Swords className="text-muted-foreground" />
            </div>
            <p className="text-5xl font-bold">{stats.totalGames}</p>
          </div>
          <div className="bg-secondary p-6 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">Victorias Humanas</h3>
              <Crown className="text-yellow-500" />
            </div>
            <p className="text-5xl font-bold">{stats.wins}</p>
          </div>
          <div className="bg-secondary p-6 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">Victorias IA</h3>
              <Shield className="text-red-500" />
            </div>
            <p className="text-5xl font-bold">{stats.losses}</p>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Niveles de IA Más Jugados</h2>
          <div className="bg-secondary border border-border rounded-lg p-4">
            {stats.levelStats.map((level, index) => (
              <div key={index} className="flex justify-between items-center p-2 border-b border-border last:border-b-0">
                <span className="font-mono">Nivel {level.levelAI}</span>
                <span className="font-bold">{level._count.levelAI} partidas</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
