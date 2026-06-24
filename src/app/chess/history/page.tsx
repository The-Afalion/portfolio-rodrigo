"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock3, RotateCw, Swords, Trophy } from "lucide-react";
import { useChess } from "@/context/ContextoChess";

type HistoryGame = {
  id: string;
  status: string;
  result: string | null;
  resultLabel: string;
  modeLabel: string;
  opponentName: string;
  color: "w" | "b" | null;
  createdAt: string;
  updatedAt: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function resultTone(game: HistoryGame) {
  if (game.status !== "COMPLETED") {
    return "border-sky-400/25 bg-sky-400/10 text-sky-200";
  }

  if (game.resultLabel === "Victoria") {
    return "border-emerald-400/25 bg-emerald-400/10 text-emerald-200";
  }

  if (game.resultLabel === "Tablas") {
    return "border-amber-400/25 bg-amber-400/10 text-amber-200";
  }

  return "border-red-400/25 bg-red-400/10 text-red-200";
}

export default function ChessHistoryPage() {
  const { usuario, estaInicializando } = useChess();
  const [games, setGames] = useState<HistoryGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuario) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadHistory() {
      setLoading(true);
      const response = await fetch("/api/chess/games", {
        credentials: "include",
        cache: "no-store",
      });

      const payload = await response.json().catch(() => null);

      if (!cancelled) {
        setGames((payload?.games as HistoryGame[] | undefined) ?? []);
        setLoading(false);
      }
    }

    void loadHistory();

    return () => {
      cancelled = true;
    };
  }, [usuario]);

  if (estaInicializando || loading) {
    return (
      <div className="min-h-screen bg-[#070b12] px-4 pt-24 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="surface-panel p-8">
            <p className="text-sm text-slate-300">Cargando historial...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="min-h-screen bg-[#070b12] px-4 pt-24 text-white">
        <div className="mx-auto max-w-3xl">
          <div className="surface-panel p-8 text-center">
            <h1 className="text-3xl font-semibold">Inicia sesión para ver tu historial</h1>
            <Link href="/chess" className="mt-6 inline-flex rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950">
              Volver al club
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b12] px-4 pb-16 pt-24 text-white">
      <main className="mx-auto max-w-6xl">
        <Link href="/chess" className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white">
          <ArrowLeft size={16} />
          Volver al club
        </Link>

        <header className="mt-8 surface-panel p-7 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-200/70">Historial</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Tus partidas de ajedrez</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            Reanuda mesas activas, revisa resultados recientes y mantén claro contra quién jugaste.
          </p>
        </header>

        <section className="mt-6 grid gap-4">
          {games.length === 0 ? (
            <div className="surface-panel p-8 text-center text-sm text-slate-300">
              Todavía no hay partidas online en tu historial.
            </div>
          ) : (
            games.map((game) => (
              <article key={game.id} className="surface-panel flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-amber-100">
                    {game.status === "COMPLETED" ? <Trophy size={18} /> : <Swords size={18} />}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-white">{game.opponentName}</h2>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${resultTone(game)}`}>
                        {game.resultLabel}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">
                      {game.modeLabel} · {game.color === "w" ? "blancas" : "negras"}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <Clock3 size={13} />
                      Última actividad: {formatDate(game.updatedAt)}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/chess/play/${game.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950"
                >
                  {game.status === "COMPLETED" ? "Ver tablero" : "Reanudar"}
                  <RotateCw size={16} />
                </Link>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
