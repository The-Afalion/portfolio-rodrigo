import prisma from '@/lib/prisma';
import { requireSuperAdminAccess } from '@/lib/editor-access';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function resolvePlayerLabel(game: {
  whitePlayer: { id: string } | null;
  blackPlayer: { id: string } | null;
  bot: { name: string | null } | null;
}) {
  if (game.bot) {
    return `Usuario vs ${game.bot.name ?? 'Bot'}`;
  }

  if (game.whitePlayer && game.blackPlayer) {
    return 'Humano vs humano';
  }

  if (game.whitePlayer || game.blackPlayer) {
    return 'Partida incompleta';
  }

  return 'Sin jugadores';
}

export default async function AdminChessPage() {
  await requireSuperAdminAccess();

  const [games, totalGames, completedGames, botGames] = await Promise.all([
    prisma.chessGame.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        whitePlayer: { select: { id: true } },
        blackPlayer: { select: { id: true } },
        bot: { select: { name: true } },
      },
    }),
    prisma.chessGame.count(),
    prisma.chessGame.count({ where: { status: 'COMPLETED' } }),
    prisma.chessGame.count({ where: { botId: { not: null } } }),
  ]);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Ajedrez</p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">Actividad de partidas</h1>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
          Seguimiento de las partidas registradas en la plataforma, con el estado real del modelo actual y sin columnas heredadas que ya no existen.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-border bg-secondary/50 p-6">
          <p className="text-sm font-medium text-muted-foreground">Partidas totales</p>
          <p className="mt-3 text-4xl font-semibold text-foreground">{totalGames}</p>
        </div>
        <div className="rounded-[28px] border border-border bg-secondary/50 p-6">
          <p className="text-sm font-medium text-muted-foreground">Completadas</p>
          <p className="mt-3 text-4xl font-semibold text-foreground">{completedGames}</p>
        </div>
        <div className="rounded-[28px] border border-border bg-secondary/50 p-6">
          <p className="text-sm font-medium text-muted-foreground">Contra bots</p>
          <p className="mt-3 text-4xl font-semibold text-foreground">{botGames}</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-border bg-secondary/50">
        <div className="border-b border-border/70 px-6 py-5">
          <h2 className="text-lg font-semibold text-foreground">Últimas 50 partidas</h2>
        </div>

        {games.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Aún no se ha registrado ninguna partida.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border/70 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Partida</th>
                  <th className="px-6 py-4">Modo</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Resultado</th>
                  <th className="px-6 py-4">Movimientos</th>
                  <th className="px-6 py-4">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game) => {
                  const moveCount = game.moves.trim() ? game.moves.trim().split(/\s+/).length : 0;

                  return (
                    <tr key={game.id} className="border-b border-border/60 last:border-b-0">
                      <td className="px-6 py-4 font-medium text-foreground">{game.id.slice(0, 8)}</td>
                      <td className="px-6 py-4 text-muted-foreground">{resolvePlayerLabel(game)}</td>
                      <td className="px-6 py-4">
                        <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-foreground">
                          {game.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{game.result ?? 'Pendiente'}</td>
                      <td className="px-6 py-4 text-muted-foreground">{moveCount}</td>
                      <td className="px-6 py-4 text-muted-foreground">{formatDate(game.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
