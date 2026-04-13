import dynamic from "next/dynamic";
import { BOTS } from "@/datos/bots";

const BotGameClient = dynamic(() => import("./BotGameClient"), {
  ssr: false,
  loading: () => <GameRouteLoading />,
});

const MultiplayerGameClient = dynamic(() => import("./MultiplayerGameClient"), {
  ssr: false,
  loading: () => <GameRouteLoading />,
});

function GameRouteLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-zinc-200">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 px-8 py-6 text-center">
        <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Chess Club</p>
        <h1 className="mt-4 text-3xl font-semibold">Preparando partida</h1>
        <p className="mt-3 text-sm text-zinc-400">Cargando solo el modo de juego que necesitas.</p>
      </div>
    </div>
  );
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const isBotGame = BOTS.some((bot) => bot.id === gameId);

  if (isBotGame) {
    return <BotGameClient botId={gameId} />;
  }

  return <MultiplayerGameClient gameId={gameId} />;
}
