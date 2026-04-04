"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { motion } from "framer-motion";
import { EyeOff, Loader2, Shield, Vote, Trophy } from "lucide-react";
import toast from "react-hot-toast";
import { submitVote } from "./actions";

type CommunityPlayer = {
  id: string;
  displayName: string;
  communitySide: string | null;
  communitySideLabel: string;
  canVote: boolean;
  hasVoted: boolean;
  currentVote: string | null;
};

type CommunityGame = {
  fen: string;
  nextMoveDue: string;
  isGameOver: boolean;
  currentTurn: "w" | "b";
  currentTurnLabel: string;
};

type VoteResult = {
  move: string;
  count: number;
  percentage: number;
};

export default function ChessCommunityClient({
  player,
  game,
  voteResults,
}: {
  player: CommunityPlayer;
  game: CommunityGame;
  voteResults: VoteResult[];
}) {
  const router = useRouter();
  const [board, setBoard] = useState(() => new Chess(game.fen));
  const [selectedMove, setSelectedMove] = useState<string>(player.currentVote ?? "");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setBoard(new Chess(game.fen));
    setSelectedMove(player.currentVote ?? "");
  }, [game.fen, player.currentVote]);

  const boardOrientation = player.communitySide === "BLACK" ? "black" : "white";

  function onDrop(sourceSquare: string, targetSquare: string) {
    if (!player.canVote || game.isGameOver) {
      return false;
    }

    const nextBoard = new Chess(game.fen);

    try {
      const move = nextBoard.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      if (!move) {
        return false;
      }

      setBoard(nextBoard);
      setSelectedMove(move.san);
      return true;
    } catch {
      return false;
    }
  }

  function handleVote() {
    if (!selectedMove) {
      toast.error("Selecciona un movimiento legal antes de votar.");
      return;
    }

    startTransition(async () => {
      const result = await submitVote(selectedMove);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(result.success ?? "Voto registrado");
      router.refresh();
    });
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="surface-panel overflow-hidden p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-2">
          <p className="text-sm font-semibold text-foreground">
            {player.displayName}, juegas con {player.communitySideLabel}
          </p>
          <p className="text-sm leading-7 text-muted-foreground">
            {player.canVote
              ? "Arrastra una pieza para proponer tu movimiento del día."
              : game.isGameOver
                ? "La partida ha terminado. El tablero se reiniciará en la siguiente resolución."
                : `Ahora mismo mueven ${game.currentTurnLabel}.`}
          </p>
        </div>

        <div className="mx-auto max-w-[720px]">
          <Chessboard
            position={board.fen()}
            onPieceDrop={onDrop}
            boardOrientation={boardOrientation}
            customDarkSquareStyle={{ backgroundColor: "#5e6b4f" }}
            customLightSquareStyle={{ backgroundColor: "#ede3c8" }}
            customBoardStyle={{ borderRadius: "20px", boxShadow: "0 20px 60px rgba(0,0,0,0.28)" }}
          />
        </div>

        <div className="mt-6 rounded-3xl border border-border/70 bg-background/70 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Tu elección</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {selectedMove || "Sin movimiento seleccionado"}
              </p>
              {player.currentVote ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Tu voto actual en esta ronda es <span className="font-medium text-foreground">{player.currentVote}</span>.
                </p>
              ) : null}
            </div>

            <button
              onClick={handleVote}
              disabled={!player.canVote || !selectedMove || isPending}
              className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Vote size={16} />
                  {player.currentVote ? "Actualizar voto" : "Emitir voto"}
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <section className="surface-panel overflow-hidden">
          <div className="border-b border-border/60 px-6 py-5">
            <p className="text-sm font-semibold text-foreground">Estado de la ronda</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Los resultados se desbloquean cuando tú ya has dejado tu voto.
            </p>
          </div>

          <div className="space-y-4 p-5">
            <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Bando activo</p>
              <p className="mt-2 text-xl font-semibold text-foreground">{game.currentTurnLabel}</p>
            </div>

            <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Tu estado</p>
              <p className="mt-2 text-xl font-semibold text-foreground">
                {player.canVote
                  ? "Puedes votar ahora"
                  : player.hasVoted
                    ? "Ya has votado"
                    : "Esperando a tu bando"}
              </p>
            </div>

            <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Cierre de ronda</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                El cron diario resolverá esta posición y aplicará el movimiento más votado.
              </p>
            </div>
          </div>
        </section>

        <section className="surface-panel overflow-hidden">
          <div className="border-b border-border/60 px-6 py-5">
            <p className="text-sm font-semibold text-foreground">Conteo de votos</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Visible solo después de emitir tu voto en la ronda actual.
            </p>
          </div>

          {!player.hasVoted ? (
            <div className="p-5">
              <div className="rounded-3xl border border-dashed border-border/70 bg-background/45 p-6 text-center">
                <EyeOff className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium text-foreground">Resultados bloqueados</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Vota primero para ver cómo se está inclinando la ronda.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 p-5">
              {voteResults.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border/70 bg-background/45 p-6 text-center text-sm text-muted-foreground">
                  Aún no hay votos contables en esta ronda.
                </div>
              ) : (
                voteResults.map((result, index) => {
                  const isCurrentVote = player.currentVote === result.move;

                  return (
                    <motion.div
                      key={result.move}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className={`rounded-3xl border p-4 ${
                        isCurrentVote
                          ? "border-emerald-400/40 bg-emerald-400/10"
                          : "border-border/70 bg-background/70"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-mono text-lg font-semibold text-foreground">{result.move}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {result.count} {result.count === 1 ? "voto" : "votos"} · {result.percentage}%
                          </p>
                        </div>
                        {index === 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-xs font-medium text-amber-300">
                            <Trophy size={12} />
                            Liderando
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-4 h-2 rounded-full bg-secondary/80">
                        <div
                          className={`h-2 rounded-full ${isCurrentVote ? "bg-emerald-400" : "bg-foreground"}`}
                          style={{ width: `${Math.max(6, result.percentage)}%` }}
                        />
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          )}
        </section>

        <section className="surface-panel-muted rounded-[28px] p-5">
          <div className="flex items-center gap-3">
            <Shield size={18} className="text-primary" />
            <p className="text-sm font-semibold text-foreground">Regla del modo comunal</p>
          </div>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Cada cuenta tiene un bando fijo. Solo puedes votar cuando le toca a tu equipo, y el tablero revela el
            pulso de la ronda únicamente después de tu propia participación.
          </p>
        </section>
      </aside>
    </div>
  );
}
