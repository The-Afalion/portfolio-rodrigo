import prisma from '@/lib/prisma';

export default async function AdminChessPage() {
  const games = await prisma.chessGame.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Historial de Partidas de Ajedrez</h1>

      <div className="bg-secondary border border-border rounded-lg">
        <table className="w-full text-left">
          <thead className="border-b border-border">
            <tr>
              <th className="p-4">Jugador</th>
              <th className="p-4">Nivel IA</th>
              <th className="p-4">Resultado</th>
              <th className="p-4">Fecha</th>
              <th className="p-4">PGN</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr key={game.id} className="border-b border-border last:border-b-0">
                <td className="p-4">{game.player}</td>
                <td className="p-4">{game.levelAI}</td>
                <td className="p-4 font-bold">{game.result}</td>
                <td className="p-4 text-muted-foreground">
                  {new Date(game.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-xs text-muted-foreground truncate max-w-xs">
                  {game.pgn}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {games.length === 0 && (
          <p className="p-8 text-center text-muted-foreground">
            Aún no se ha jugado ninguna partida.
          </p>
        )}
      </div>
    </div>
  );
}
