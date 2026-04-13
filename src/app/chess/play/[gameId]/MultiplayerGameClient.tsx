"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { ArrowLeft, Clock3, Swords, Trophy, XCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useChess } from "@/context/ContextoChess";
import { formatDurationMs, formatRemainingDays } from "@/lib/chess-modes";
import { buildMoveHintStyles, getLegalTargets } from "./shared";

const GameChat = dynamic(() => import("./GameChat"), {
  ssr: false,
  loading: () => <div className="mt-4 text-sm text-zinc-500">Cargando chat de partida...</div>,
});

type MultiplayerSnapshot = {
  id: string;
  fen: string;
  status: string;
  result: string | null;
  turn: "w" | "b";
  playerColor: "w" | "b";
  whitePlayerName: string;
  blackPlayerName: string;
  modeKey: string;
  modeLabel: string;
  modeDescription: string;
  timeControlType: "REALTIME" | "CORRESPONDENCE";
  whiteTimeMs: number | null;
  blackTimeMs: number | null;
  deadlineAt: string | null;
  currentTurnStartedAt: string | null;
};

export default function MultiplayerGameClient({ gameId }: { gameId: string }) {
  const supabase = useRef(createClient()).current;
  const router = useRouter();
  const { usuario, estaInicializando } = useChess();
  const [snapshot, setSnapshot] = useState<MultiplayerSnapshot | null>(null);
  const [loadingGame, setLoadingGame] = useState(true);
  const [submittingMove, setSubmittingMove] = useState(false);
  const [syncedAt, setSyncedAt] = useState(Date.now());
  const [now, setNow] = useState(Date.now());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalTargets, setLegalTargets] = useState<string[]>([]);
  const moveHintStyles = useMemo(
    () => buildMoveHintStyles(selectedSquare, legalTargets),
    [legalTargets, selectedSquare]
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const fetchGame = useCallback(async () => {
    try {
      const response = await fetch(`/api/chess/games/${gameId}`, {
        cache: "no-store",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("No se pudo cargar la partida.");
      }

      const payload = (await response.json()) as MultiplayerSnapshot;
      setSnapshot(payload);
      setSyncedAt(Date.now());
      setSelectedSquare(null);
      setLegalTargets([]);
    } catch (error) {
      console.error(error);
      router.push("/chess");
    } finally {
      setLoadingGame(false);
    }
  }, [gameId, router]);

  useEffect(() => {
    if (!usuario || estaInicializando) {
      return;
    }

    void fetchGame();

    const fallbackIntervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void fetchGame();
      }
    }, 15000);

    const channel = supabase
      .channel(`live-game:${gameId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "ChessGame", filter: `id=eq.${gameId}` },
        () => {
          void fetchGame();
        }
      )
      .subscribe();

    return () => {
      window.clearInterval(fallbackIntervalId);
      void supabase.removeChannel(channel);
    };
  }, [estaInicializando, fetchGame, gameId, supabase, usuario]);

  function getLiveClock(color: "w" | "b") {
    if (!snapshot) {
      return "--:--";
    }

    const base = color === "w" ? snapshot.whiteTimeMs : snapshot.blackTimeMs;

    if (base == null) {
      return null;
    }

    if (snapshot.status === "IN_PROGRESS" && snapshot.timeControlType === "REALTIME" && snapshot.turn === color) {
      return formatDurationMs(Math.max(0, base - (now - syncedAt)));
    }

    return formatDurationMs(Math.max(0, base));
  }

  function getCorrespondenceLabel() {
    if (!snapshot?.deadlineAt) {
      return null;
    }

    return formatRemainingDays(new Date(snapshot.deadlineAt).getTime() - now);
  }

  async function submitMove(sourceSquare: string, targetSquare: string) {
    if (!snapshot || snapshot.turn !== snapshot.playerColor || snapshot.status !== "IN_PROGRESS") {
      return false;
    }

    setSubmittingMove(true);

    try {
      const response = await fetch(`/api/chess/games/${gameId}/move`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q",
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        return false;
      }

      if (payload?.game) {
        setSnapshot(payload.game as MultiplayerSnapshot);
        setSyncedAt(Date.now());
        setSelectedSquare(null);
        setLegalTargets([]);
      }

      return true;
    } finally {
      setSubmittingMove(false);
    }
  }

  function onDrop(sourceSquare: string, targetSquare: string) {
    if (!snapshot || snapshot.turn !== snapshot.playerColor || snapshot.status !== "IN_PROGRESS") {
      return false;
    }

    const validationBoard = new Chess(snapshot.fen);
    const previewMove = validationBoard.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (!previewMove) {
      return false;
    }

    setSnapshot((current) =>
      current
        ? {
            ...current,
            fen: validationBoard.fen(),
            turn: validationBoard.turn() as "w" | "b",
            status: validationBoard.isGameOver() ? "COMPLETED" : current.status,
            result: validationBoard.isGameOver()
              ? validationBoard.isCheckmate()
                ? validationBoard.turn() === "w"
                  ? "0-1"
                  : "1-0"
                : "1/2-1/2"
              : current.result,
          }
        : current
    );
    setSelectedSquare(null);
    setLegalTargets([]);
    void submitMove(sourceSquare, targetSquare);
    return true;
  }

  function onPieceClick(piece: string, square: string) {
    if (!snapshot || snapshot.turn !== snapshot.playerColor || snapshot.status !== "IN_PROGRESS" || submittingMove) {
      setSelectedSquare(null);
      setLegalTargets([]);
      return;
    }

    if (!piece.startsWith(snapshot.playerColor)) {
      setSelectedSquare(null);
      setLegalTargets([]);
      return;
    }

    if (selectedSquare === square) {
      setSelectedSquare(null);
      setLegalTargets([]);
      return;
    }

    const board = new Chess(snapshot.fen);
    setSelectedSquare(square);
    setLegalTargets(getLegalTargets(board, square));
  }

  function onSquareClick(square: string) {
    if (!snapshot || !selectedSquare) {
      return;
    }

    if (square === selectedSquare) {
      setSelectedSquare(null);
      setLegalTargets([]);
      return;
    }

    if (!legalTargets.includes(square)) {
      const board = new Chess(snapshot.fen);
      const piece = board.get(square);
      if (piece?.color === snapshot.playerColor) {
        setSelectedSquare(square);
        setLegalTargets(getLegalTargets(board, square));
        return;
      }

      setSelectedSquare(null);
      setLegalTargets([]);
      return;
    }

    void onDrop(selectedSquare, square);
  }

  if (estaInicializando || loadingGame || !usuario) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-zinc-200">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 px-8 py-6 text-center">
          <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Chess Club</p>
          <h1 className="mt-4 text-3xl font-semibold">Preparando partida online</h1>
          <p className="mt-3 text-sm text-zinc-400">Recuperando el estado oficial del servidor.</p>
        </div>
      </div>
    );
  }

  if (!snapshot) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto grid min-h-screen max-w-[1480px] gap-0 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="border-r border-zinc-800 bg-[linear-gradient(180deg,rgba(24,24,27,0.98),rgba(10,10,12,0.98))] p-8">
          <Link
            href="/chess"
            className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.22em] text-zinc-500 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} /> Volver al club
          </Link>

          <div className="mt-10 rounded-[30px] border border-zinc-800 bg-zinc-900/70 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Modo de partida</p>
            <h1 className="mt-4 text-3xl font-semibold">{snapshot.modeLabel}</h1>
            <p className="mt-3 text-sm leading-7 text-zinc-400">{snapshot.modeDescription}</p>
          </div>

          <div className="mt-6 grid gap-4">
            <div className="rounded-[28px] border border-zinc-800 bg-zinc-900/70 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Blancas</p>
              <p className="mt-3 text-xl font-semibold">{snapshot.whitePlayerName}</p>
              {snapshot.timeControlType === "REALTIME" ? (
                <p className="mt-2 text-sm text-zinc-400">{getLiveClock("w")}</p>
              ) : null}
            </div>
            <div className="rounded-[28px] border border-zinc-800 bg-zinc-900/70 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Negras</p>
              <p className="mt-3 text-xl font-semibold">{snapshot.blackPlayerName}</p>
              {snapshot.timeControlType === "REALTIME" ? (
                <p className="mt-2 text-sm text-zinc-400">{getLiveClock("b")}</p>
              ) : null}
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-zinc-800 bg-zinc-950/70 p-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-zinc-500">
              <Clock3 size={14} />
              <span>Estado temporal</span>
            </div>
            {snapshot.timeControlType === "REALTIME" ? (
              <div className="mt-4 space-y-2 text-sm text-zinc-300">
                <p>Blancas: {getLiveClock("w")}</p>
                <p>Negras: {getLiveClock("b")}</p>
              </div>
            ) : (
              <div className="mt-4 space-y-2 text-sm text-zinc-300">
                <p>Turno activo: {snapshot.turn === "w" ? snapshot.whitePlayerName : snapshot.blackPlayerName}</p>
                <p>Tiempo restante del turno: {getCorrespondenceLabel() ?? "sin plazo"}</p>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-[28px] border border-zinc-800 bg-zinc-900/70 p-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-zinc-500">
              <Swords size={14} />
              <span>Estado de la mesa</span>
            </div>
            <p className="mt-4 text-lg font-medium text-zinc-100">
              {snapshot.status === "COMPLETED"
                ? snapshot.result === "1-0"
                  ? "Victoria de blancas"
                  : snapshot.result === "0-1"
                    ? "Victoria de negras"
                    : "Tablas"
                : snapshot.turn === "w"
                  ? "Turno de blancas"
                  : "Turno de negras"}
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              Tú juegas con {snapshot.playerColor === "w" ? "blancas" : "negras"}.
            </p>
          </div>

          {snapshot.status !== "COMPLETED" ? null : (
            <div
              className={`mt-6 rounded-[28px] border p-6 text-center ${
                (snapshot.result === "1-0" && snapshot.playerColor === "w") ||
                (snapshot.result === "0-1" && snapshot.playerColor === "b")
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : snapshot.result === "1/2-1/2"
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                    : "border-red-500/40 bg-red-500/10 text-red-300"
              }`}
            >
              {snapshot.result === "1/2-1/2" ? null : (snapshot.result === "1-0" && snapshot.playerColor === "w") || (snapshot.result === "0-1" && snapshot.playerColor === "b") ? (
                <Trophy className="mx-auto h-10 w-10" />
              ) : (
                <XCircle className="mx-auto h-10 w-10" />
              )}
              <h2 className="mt-4 text-2xl font-semibold">
                {snapshot.result === "1/2-1/2"
                  ? "Tablas"
                  : (snapshot.result === "1-0" && snapshot.playerColor === "w") ||
                      (snapshot.result === "0-1" && snapshot.playerColor === "b")
                    ? "Victoria"
                    : "Derrota"}
              </h2>
            </div>
          )}
        </aside>

        <section className="relative flex flex-col justify-center overflow-hidden p-4 sm:p-8 xl:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_34%),linear-gradient(135deg,rgba(24,24,27,0.88),rgba(9,9,11,1))]" />

          <div className="relative z-10 mx-auto w-full max-w-[920px]">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-zinc-800 bg-zinc-900/70 px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Partida online</p>
                <p className="mt-2 text-sm text-zinc-300">
                  {snapshot.status === "COMPLETED"
                    ? "La partida ha terminado."
                    : snapshot.turn === snapshot.playerColor
                      ? "Es tu turno."
                      : "Esperando movimiento del rival."}
                </p>
              </div>
              <div className="rounded-full border border-zinc-700 bg-zinc-950 px-4 py-2 text-xs font-medium text-zinc-400">
                {snapshot.modeLabel}
              </div>
            </div>

            <div className="overflow-hidden rounded-[36px] border border-zinc-800 bg-zinc-900/70 p-3 shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:p-5">
              <div className="rounded-[28px] border border-zinc-800 bg-zinc-950 p-2 sm:p-4">
                <Chessboard
                  position={snapshot.fen}
                  onPieceDrop={onDrop}
                  onPieceClick={onPieceClick}
                  onSquareClick={onSquareClick}
                  boardOrientation={snapshot.playerColor === "b" ? "black" : "white"}
                  arePiecesDraggable={snapshot.status === "IN_PROGRESS" && snapshot.turn === snapshot.playerColor && !submittingMove}
                  snapToCursor
                  customSquareStyles={moveHintStyles}
                  customDarkSquareStyle={{ backgroundColor: "#475569" }}
                  customLightSquareStyle={{ backgroundColor: "#d6d3d1" }}
                  animationDuration={220}
                  customBoardStyle={{
                    borderRadius: "20px",
                    boxShadow: "inset 0 0 28px rgba(0,0,0,0.35)",
                  }}
                />
              </div>
            </div>

            <div className="mt-6">
              <GameChat gameId={gameId} supabase={supabase} userId={usuario.id} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
