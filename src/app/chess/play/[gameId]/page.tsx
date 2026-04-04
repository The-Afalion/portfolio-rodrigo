"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { createClient } from "@/utils/supabase/client";
import { useChess } from "@/context/ContextoChess";
import { BOTS, type BotAjedrez } from "@/datos/bots";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Brain, Clock3, Flag, RefreshCw, Shield, Swords, Trophy, XCircle } from "lucide-react";
import Link from "next/link";
import { analizarMovimientoIA, evaluarTablero } from "@/utils/chessAI";
import { formatDurationMs, formatRemainingDays } from "@/lib/chess-modes";

type ChessMoveLike = {
  san: string;
  flags: string;
  captured?: string;
};

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

const BotGame = ({ botId }: { botId: string }) => {
  const router = useRouter();
  const { usuario, estaInicializando, registrarVictoria } = useChess();
  const bot = useMemo(() => BOTS.find((candidate) => candidate.id === botId) ?? null, [botId]);
  const [fen, setFen] = useState(() => new Chess().fen());
  const [dialogo, setDialogo] = useState("");
  const [lecturaPosicional, setLecturaPosicional] = useState("Esperando el primer movimiento.");
  const [estadoJuego, setEstadoJuego] = useState<"jugando" | "victoria" | "derrota" | "tablas">("jugando");
  const [pensando, setPensando] = useState(false);

  const game = useMemo(() => new Chess(fen), [fen]);
  const evaluation = useMemo(() => evaluarTablero(game), [game]);

  useEffect(() => {
    if (!estaInicializando && (!usuario || !bot)) {
      router.push("/chess");
    }
  }, [bot, estaInicializando, router, usuario]);

  useEffect(() => {
    if (!bot) {
      return;
    }

    setDialogo(pickRandom(bot.dialogos.entrada));
    setLecturaPosicional(bot.personalidad.resumen);
    setFen(new Chess().fen());
    setEstadoJuego("jugando");
    setPensando(false);
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

      const move = snapshot.move(analysis.san) as ChessMoveLike | null;

      if (!move) {
        setPensando(false);
        return;
      }

      const afterEval = evaluarTablero(snapshot);
      setFen(snapshot.fen());
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
  }

  function onDrop(sourceSquare: string, targetSquare: string) {
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
      setLecturaPosicional(`Tu jugada: ${move.san} · ${describePosition(afterEval)}`);

      if (nextGame.isCheckmate()) {
        setEstadoJuego("victoria");
        setDialogo(pickRandom(bot.dialogos.derrota));
        void registrarVictoria(bot.id);
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

  if (estaInicializando) {
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

  if (!usuario || !bot) {
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
            <AnimatePresence mode="wait">
              <motion.p
                key={dialogo}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-5 text-xl italic leading-relaxed text-zinc-200"
              >
                “{dialogo}”
              </motion.p>
            </AnimatePresence>
            {pensando ? (
              <div className="mt-5 flex gap-2 opacity-60">
                <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: "140ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: "280ms" }} />
              </div>
            ) : null}
          </div>

          {estadoJuego !== "jugando" ? (
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
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
            </motion.div>
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
                  boardOrientation="white"
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
};

const Chat = ({ gameId, supabase, user }: { gameId: string; supabase: ReturnType<typeof createClient>; user: { id: string } }) => {
  const [messages, setMessages] = useState<Array<{ id: string; senderId: string; content: string }>>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("gameId", gameId)
        .order("createdAt", { ascending: true });
      setMessages((data as Array<{ id: string; senderId: string; content: string }>) ?? []);
    };

    void fetchMessages();

    const channel = supabase
      .channel(`chat:${gameId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `gameId=eq.${gameId}` },
        (payload: { new: { id: string; senderId: string; content: string } }) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [gameId, supabase]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newMessage.trim() === "") {
      return;
    }

    await supabase.from("messages").insert({ gameId, content: newMessage, senderId: user.id });
    setNewMessage("");
  };

  return (
    <div className="mt-4 w-full max-w-md">
      <div className="h-64 overflow-y-auto rounded-lg border p-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat ${msg.senderId === user.id ? "chat-end" : "chat-start"}`}>
            <div className="chat-bubble">{msg.content}</div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="mt-2 flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="input input-bordered flex-grow"
          placeholder="Type a message..."
        />
        <button type="submit" className="btn btn-primary ml-2">
          Send
        </button>
      </form>
    </div>
  );
};

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

const MultiplayerGame = ({ gameId }: { gameId: string }) => {
  const supabase = useRef(createClient()).current;
  const router = useRouter();
  const { usuario, estaInicializando } = useChess();
  const [snapshot, setSnapshot] = useState<MultiplayerSnapshot | null>(null);
  const [loadingGame, setLoadingGame] = useState(true);
  const [submittingMove, setSubmittingMove] = useState(false);
  const [syncedAt, setSyncedAt] = useState(Date.now());
  const [now, setNow] = useState(Date.now());

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
    void submitMove(sourceSquare, targetSquare);
    return true;
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
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
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
            </motion.div>
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
                  boardOrientation={snapshot.playerColor === "b" ? "black" : "white"}
                  arePiecesDraggable={snapshot.status === "IN_PROGRESS" && snapshot.turn === snapshot.playerColor && !submittingMove}
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
              <Chat gameId={gameId} supabase={supabase} user={{ id: usuario.id }} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default function GamePage() {
  const { gameId } = useParams();
  const id = Array.isArray(gameId) ? gameId[0] : (gameId as string);
  const isBotGame = BOTS.some((bot) => bot.id === id);

  if (isBotGame) {
    return <BotGame botId={id} />;
  }

  return <MultiplayerGame gameId={id} />;
}
