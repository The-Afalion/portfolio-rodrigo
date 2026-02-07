import prisma from '@/lib/prisma';
import { Chessboard } from "react-chessboard";
import Countdown from './Countdown';
import VoteHandler from './VoteHandler';

export const dynamic = 'force-dynamic';

async function getGameState() {
  let game = await prisma.communityChessGame.findUnique({
    where: { id: 'main_game' },
    include: {
      votes: {
        select: { move: true },
      },
    },
  });

  // Si no existe el juego, lo creamos
  if (!game) {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    game = await prisma.communityChessGame.create({
      data: {
        id: 'main_game',
        nextMoveDue: threeDaysFromNow,
      },
      include: { votes: true },
    });
  }
  
  return game;
}

export default async function CommunityChessPage() {
  const game = await getGameState();

  const voteCounts = game.votes.reduce((acc, vote) => {
    acc[vote.move] = (acc[vote.move] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalVotes = game.votes.length;
  const sortedVotes = Object.entries(voteCounts).sort(([, a], [, b]) => b - a);

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row items-center justify-center gap-8 p-8">
      {/* Columna del Tablero */}
      <div className="w-full max-w-lg lg:max-w-xl">
        <Chessboard position={game.fen} arePiecesDraggable={false} />
      </div>

      {/* Columna de Información y Votos */}
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tighter">Ajedrez Comunitario</h1>
          <p className="text-muted-foreground font-mono">El mundo decide el próximo movimiento.</p>
        </div>

        <div className="bg-secondary p-6 rounded-lg border border-border mb-8">
          <h2 className="text-lg font-bold text-center mb-2">Tiempo para el Próximo Movimiento</h2>
          <Countdown targetDate={game.nextMoveDue} />
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold">Movimientos Propuestos</h3>
          {sortedVotes.slice(0, 5).map(([move, count]) => (
            <div key={move} className="bg-secondary p-3 rounded-lg border border-border">
              <div className="flex justify-between items-center font-mono">
                <span className="font-bold text-lg">{move}</span>
                <span className="text-muted-foreground">{((count / totalVotes) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(count / totalVotes) * 100}%` }}></div>
              </div>
            </div>
          ))}
          {sortedVotes.length === 0 && <p className="text-muted-foreground text-center">Aún no hay votos para esta ronda.</p>}
        </div>

        <VoteHandler fen={game.fen} />
      </div>
    </main>
  );
}
