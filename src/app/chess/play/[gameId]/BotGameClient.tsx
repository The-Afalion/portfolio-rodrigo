"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { ArrowLeft, Brain, Flag, RefreshCw, Shield, Swords, Trophy, XCircle } from "lucide-react";
import { useChess } from "@/context/ContextoChess";
import { BOTS, type BotAjedrez } from "@/datos/bots";
import { analizarMovimientoIA, evaluarTablero } from "@/utils/chessAI";
import { buildMoveHintStyles, getLegalTargets, type ChessMoveLike } from "./shared";

function pickRandom(lines: string[]) {
  return lines[Math.floor(Math.random() * lines.length)] ?? "";
}

function getThinkingDelay(bot: BotAjedrez) {
  const normalized = Math.max(250, 1700 - bot.elo);
  return bot.elo >= 1800 ? 850 : normalized;
}

function describePosition(evalScore: number) {
  if (evalScore <= -250) {
    return "Ventaja clara para las negras";
  }

  if (evalScore <= -80) {
    return "Iniciativa negra";
  }

  if (evalScore >= 250) {
    return "Ventaja clara para las blancas";
  }

  if (evalScore >= 80) {
    return "Iniciativa blanca";
  }

  return "Posición equilibrada";
}

function buildBotReply(bot: BotAjedrez, move: ChessMoveLike, beforeEval: number, afterEval: number) {
  const blackSwing = beforeEval - afterEval;

  if (move.san.includes("#")) {
    return pickRandom(bot.dialogos.victoria);
  }

  if (move.san.includes("+")) {
    return pickRandom(bot.dialogos.jaque);
  }

  if (move.captured) {
    return pickRandom(bot.dialogos.captura);
  }

  if (move.flags.includes("k") || move.flags.includes("q")) {
    return pickRandom(bot.dialogos.enroque);
  }

  if (blackSwing > 160) {
    return pickRandom(bot.dialogos.ventaja);
  }

  if (blackSwing < -90) {
    return pickRandom(bot.dialogos.desventaja);
  }

  return pickRandom(bot.dialogos.movimiento);
}

function buildPlayerMoveReply(bot: BotAjedrez, move: ChessMoveLike, beforeEval: number, afterEval: number) {
  const whiteSwing = afterEval - beforeEval;

  if (move.san.includes("+")) {
    return pickRandom(bot.dialogos.respuestaJugador);
  }

  if (move.captured && whiteSwing > 50) {
    return pickRandom(bot.dialogos.respuestaJugador);
  }

  if (move.flags.includes("k") || move.flags.includes("q")) {
    return pickRandom(bot.dialogos.enroque);
  }

  if (whiteSwing > 170) {
    return pickRandom(bot.dialogos.desventaja);
  }

  if (whiteSwing < -110) {
    return pickRandom(bot.dialogos.blunder);
  }

  return pickRandom(bot.dialogos.presion);
}

export default function BotGameClient({ botId }: { botId: string }) {
  const router = useRouter();
  const { usuario, estaInicializando, registrarVictoria } = useChess();
  const bot = useMemo(() => BOTS.find((candidate) => candidate.id === botId) ?? null, [botId]);
  const [fen, setFen] = useState(() => new Chess().fen());
  const [dialogo, setDialogo] = useState("");
  const [lecturaPosicional, setLecturaPosicional] = useState("Esperando el primer movimiento.");
  const [estadoJuego, setEstadoJuego] = useState<"jugando" | "victoria" | "derrota" | "tablas">("jugando");
  const [pensando, setPensando] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalTargets, setLegalTargets] = useState<string[]>([]);

  const game = useMemo(() => new Chess(fen), [fen]);
  const evaluation = useMemo(() => evaluarTablero(game), [game]);
  const moveHintStyles = useMemo(
    () => buildMoveHintStyles(selectedSquare, legalTargets),
    [legalTargets, selectedSquare]
  );

  useEffect(() => {
    if (!estaInicializando && !bot) {
      router.push("/chess");
    }
  }, [bot, estaInicializando, router]);

  useEffect(() => {
    if (!bot) {
      return;
    }

    setDialogo(pickRandom(bot.dialogos.entrada));
    setLecturaPosicional(bot.personalidad.resumen);
    setFen(new Chess().fen());
    setEstadoJuego("jugando");
    setPensando(false);
    setSelectedSquare(null);
    setLegalTargets([]);
  }, [bot]);

  useEffect(() => {
    if (!bot || estadoJuego !== "jugando" || game.turn() !== "b") {
      return;
    }

    setPensando(true);
    const snapshot = new Chess(fen);
    const timeoutId = window.setTimeout(() => {
      const beforeEval = evaluarTablero(snapshot);
      const analysis = analizarMovimientoIA(snapshot, bot.elo, bot.estilo);

      if (!analysis) {
        setPensando(false);
        return;
      }

      const move = snapshot.move({
        from: analysis.from,
        to: analysis.to,
        promotion: analysis.promotion ?? "q",
      }) as ChessMoveLike | null;

      if (!move) {
        const fallbackMove = snapshot.moves({ verbose: true })[0];

        if (!fallbackMove) {
          setPensando(false);
          return;
        }

        const emergencyMove = snapshot.move({
          from: fallbackMove.from,
          to: fallbackMove.to,
          promotion: fallbackMove.promotion ?? "q",
        }) as ChessMoveLike | null;

        if (!emergencyMove) {
          setPensando(false);
          return;
        }

        const fallbackEval = evaluarTablero(snapshot);
        setFen(snapshot.fen());
        setSelectedSquare(null);
        setLegalTargets([]);
        setLecturaPosicional(`${bot.personalidad.etiqueta} · ${describePosition(fallbackEval)} · plan de emergencia`);

        if (snapshot.isCheckmate()) {
          setEstadoJuego("derrota");
          setDialogo(pickRandom(bot.dialogos.victoria));
          setPensando(false);
          return;
        }

        if (snapshot.isDraw()) {
          setEstadoJuego("tablas");
          setDialogo("Tablas. Incluso el acero a veces se detiene.");
          setPensando(false);
          return;
        }

        setDialogo(buildBotReply(bot, emergencyMove, beforeEval, fallbackEval));
        setPensando(false);
        return;
      }

      const afterEval = evaluarTablero(snapshot);
      setFen(snapshot.fen());
      setSelectedSquare(null);
      setLegalTargets([]);
      setLecturaPosicional(
        `${bot.personalidad.etiqueta} · ${describePosition(afterEval)} · elección ${analysis.rank + 1}`
      );

      if (snapshot.isCheckmate()) {
        setEstadoJuego("derrota");
        setDialogo(pickRandom(bot.dialogos.victoria));
        setPensando(false);
        return;
      }

      if (snapshot.isDraw()) {
        setEstadoJuego("tablas");
        setDialogo("Tablas. Incluso el acero a veces se detiene.");
        setPensando(false);
        return;
      }

      setDialogo(buildBotReply(bot, move, beforeEval, afterEval));
      setPensando(false);
    }, getThinkingDelay(bot));

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [bot, estadoJuego, fen, game]);

  function resetMatch() {
    if (!bot) {
      return;
    }

    setFen(new Chess().fen());
    setEstadoJuego("jugando");
    setPensando(false);
    setDialogo(pickRandom(bot.dialogos.entrada));
    setLecturaPosicional(bot.personalidad.resumen);
    setSelectedSquare(null);
    setLegalTargets([]);
  }

  function clearSelection() {
    setSelectedSquare(null);
    setLegalTargets([]);
  }

  function playPlayerMove(sourceSquare: string, targetSquare: string) {
    if (!bot || estadoJuego !== "jugando" || pensando || game.turn() !== "w") {
      return false;
    }

    try {
      const nextGame = new Chess(fen);
      const beforeEval = evaluarTablero(nextGame);
      const move = nextGame.move({ from: sourceSquare, to: targetSquare, promotion: "q" }) as ChessMoveLike | null;

      if (!move) {
        return false;
      }

      const afterEval = evaluarTablero(nextGame);
      setFen(nextGame.fen());
      clearSelection();
      setLecturaPosicional(`Tu jugada: ${move.san} · ${describePosition(afterEval)}`);

      if (nextGame.isCheckmate()) {
        setEstadoJuego("victoria");
        setDialogo(pickRandom(bot.dialogos.derrota));
        if (usuario) {
          void registrarVictoria(bot.id);
        }
        return true;
      }

      if (nextGame.isDraw()) {
        setEstadoJuego("tablas");
        setDialogo("Tablas. Ninguno ha conseguido romper la posición.");
        return true;
      }

      setDialogo(buildPlayerMoveReply(bot, move, beforeEval, afterEval));
      return true;
    } catch {
      return false;
    }
  }

  function onDrop(sourceSquare: string, targetSquare: string) {
    return playPlayerMove(sourceSquare, targetSquare);
  }

  function onPieceClick(piece: string, square: string) {
    if (!bot || estadoJuego !== "jugando" || pensando || game.turn() !== "w") {
      clearSelection();
      return;
    }

    if (!piece.startsWith("w")) {
      clearSelection();
      return;
    }

    if (selectedSquare === square) {
      clearSelection();
      return;
    }

    const targets = getLegalTargets(game, square);
    setSelectedSquare(square);
    setLegalTargets(targets);
  }

  function onSquareClick(square: string) {
    if (!selectedSquare) {
      return;
    }

    if (square === selectedSquare) {
      clearSelection();
      return;
    }

    if (!legalTargets.includes(square)) {
      const piece = game.get(square);
      if (piece?.color === "w") {
        setSelectedSquare(square);
        setLegalTargets(getLegalTargets(game, square));
        return;
      }

      clearSelection();
      return;
    }

    void playPlayerMove(selectedSquare, square);
  }

  if (estaInicializando && !bot) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-zinc-200">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 px-8 py-6 text-center">
          <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Chess Club</p>
          <h1 className="mt-4 text-3xl font-semibold">Preparando la mesa</h1>
          <p className="mt-3 text-sm text-zinc-400">Estamos sincronizando tu sesión y el perfil del rival.</p>
        </div>
      </div>
    );
  }

  if (!bot) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto grid min-h-screen max-w-[1500px] gap-0 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="border-r border-zinc-800 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_45%),linear-gradient(180deg,rgba(24,24,27,0.98),rgba(10,10,12,0.98))] p-8">
          <Link
            href="/chess"
            className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.22em] text-zinc-500 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} /> Volver al club
          </Link>

          <div className="mt-10 flex items-center gap-5">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-5xl shadow-2xl">
              {bot.avatar}
            </div>
            <div>
              <h1 className="text-3xl font-semibold">{bot.nombre}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs uppercase tracking-[0.18em] text-zinc-400">
                  {bot.titulo}
                </span>
                <span className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs text-zinc-500">
                  ELO {bot.elo}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-[28px] border border-zinc-800 bg-zinc-900/60 p-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-zinc-500">
              <Brain size={14} />
              <span>Perfil mental</span>
            </div>
            <p className="mt-4 text-lg font-medium text-zinc-100">{bot.personalidad.etiqueta}</p>
            <p className="mt-3 text-sm leading-7 text-zinc-400">{bot.personalidad.resumen}</p>
            <p className="mt-4 text-sm leading-7 text-zinc-500">{bot.descripcion}</p>
          </div>

          <div className="mt-6 rounded-[28px] border border-zinc-800 bg-zinc-950/70 p-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-zinc-500">
              <Swords size={14} />
              <span>Lectura actual</span>
            </div>
            <p className="mt-4 text-lg font-medium text-zinc-100">{describePosition(evaluation)}</p>
            <p className="mt-2 text-sm text-zinc-400">{lecturaPosicional}</p>
          </div>

          <div className="mt-6 min-h-[180px] rounded-[32px] border border-zinc-800 bg-zinc-900/70 p-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-zinc-500">
              <Shield size={14} />
              <span>Chat del rival</span>
            </div>
            <p className="mt-5 text-xl italic leading-relaxed text-zinc-200">“{dialogo}”</p>
            {pensando ? (
              <div className="mt-5 flex gap-2 opacity-60">
                <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: "140ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: "280ms" }} />
              </div>
            ) : null}
          </div>

          {estadoJuego !== "jugando" ? (
            <div
              className={`mt-6 rounded-[28px] border p-6 text-center ${
                estadoJuego === "victoria"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : estadoJuego === "derrota"
                    ? "border-red-500/40 bg-red-500/10 text-red-300"
                    : "border-amber-500/40 bg-amber-500/10 text-amber-300"
              }`}
            >
              {estadoJuego === "victoria" ? <Trophy className="mx-auto h-10 w-10" /> : null}
              {estadoJuego === "derrota" ? <XCircle className="mx-auto h-10 w-10" /> : null}
              <h2 className="mt-4 text-2xl font-semibold">
                {estadoJuego === "victoria" ? "Victoria" : estadoJuego === "derrota" ? "Derrota" : "Tablas"}
              </h2>
              <p className="mt-2 text-sm opacity-80">
                {estadoJuego === "victoria"
                  ? "Has superado el duelo y desbloqueado progreso contra bots."
                  : estadoJuego === "derrota"
                    ? "Revisa la secuencia crítica y vuelve a por la revancha."
                    : "Partida equilibrada. Puedes intentarlo de nuevo al instante."}
              </p>
            </div>
          ) : null}

          <div className="mt-6 grid grid-cols-2 gap-4">
            <button
              onClick={resetMatch}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-100 px-4 py-4 text-sm font-semibold text-zinc-950 transition-colors hover:bg-white"
            >
              <RefreshCw size={16} /> Revancha
            </button>
            <button
              onClick={() => {
                setEstadoJuego("derrota");
                setPensando(false);
                setDialogo("Retirada registrada. La próxima vez intenta resistir un poco más.");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-4 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              <Flag size={16} /> Rendirse
            </button>
          </div>

          {!usuario ? (
            <div className="mt-6 rounded-[24px] border border-zinc-800 bg-zinc-950/70 p-4 text-sm text-zinc-400">
              Estás jugando en modo invitado. Puedes probar todos los bots, pero las victorias no se guardarán hasta iniciar sesión.
            </div>
          ) : null}
        </aside>

        <section className="relative flex items-center justify-center overflow-hidden p-4 sm:p-8 xl:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.14),_transparent_32%),radial-gradient(circle_at_bottom,_rgba(244,114,182,0.08),_transparent_26%)] opacity-90" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(24,24,27,0.85),rgba(9,9,11,1))]" />

          <div className="relative z-10 w-full max-w-[860px]">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-zinc-800 bg-zinc-900/70 px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Duelo privado</p>
                <p className="mt-2 text-sm text-zinc-300">
                  Juegas con blancas. {pensando ? `${bot.nombre} está calculando.` : "Tu turno o espera según el tablero."}
                </p>
              </div>
              <div className="rounded-full border border-zinc-700 bg-zinc-950 px-4 py-2 text-xs font-medium text-zinc-400">
                {describePosition(evaluation)}
              </div>
            </div>

            <div className="overflow-hidden rounded-[36px] border border-zinc-800 bg-zinc-900/70 p-3 shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:p-5">
              <div className="rounded-[28px] border border-zinc-800 bg-zinc-950 p-2 sm:p-4">
                <Chessboard
                  position={fen}
                  onPieceDrop={onDrop}
                  onPieceClick={onPieceClick}
                  onSquareClick={onSquareClick}
                  boardOrientation="white"
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
          </div>
        </section>
      </div>
    </div>
  );
}
