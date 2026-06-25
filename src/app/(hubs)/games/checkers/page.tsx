"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Radio } from "lucide-react";
import MatchmakingLobby from "@/components/games/MatchmakingLobby";

type Board = number[][];
type Phase = "menu" | "queue" | "playing";
type OnlineRole = "player1" | "player2";

const INITIAL_BOARD: Board = [
  [0, 2, 0, 2, 0, 2, 0, 2],
  [2, 0, 2, 0, 2, 0, 2, 0],
  [0, 2, 0, 2, 0, 2, 0, 2],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0],
];

function cloneBoard(board: Board) {
  return board.map((row) => [...row]);
}

function getGuestId() {
  const key = "arcadeGuestId";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const generated = `guest-${crypto.randomUUID()}`;
  window.localStorage.setItem(key, generated);
  return generated;
}

function countPieces(board: Board, side: 1 | 2) {
  return board.flat().filter((piece) => piece === side || piece === side + 2).length;
}

export default function CheckersGame() {
  const [phase, setPhase] = useState<Phase>("menu");
  const [gameMode, setGameMode] = useState<"local" | "online">("local");
  const [board, setBoard] = useState<Board>(() => cloneBoard(INITIAL_BOARD));
  const [turn, setTurn] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);
  const [onlineRole, setOnlineRole] = useState<OnlineRole | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [onlineVersion, setOnlineVersion] = useState(0);
  const [syncMessage, setSyncMessage] = useState("Elige modalidad para desplegar el tablero.");

  const isOnline = gameMode === "online" && Boolean(matchId && onlineRole);
  const mySide: 1 | 2 = onlineRole === "player2" ? 2 : 1;
  const canAct = !isOnline || turn === mySide;

  const publishSnapshot = useCallback(
    async (nextBoard: Board, nextTurn: 1 | 2, version = onlineVersion) => {
      if (!matchId) return;
      try {
        const status = countPieces(nextBoard, 1) === 0 || countPieces(nextBoard, 2) === 0 ? "COMPLETED" : "ACTIVE";
        const response = await fetch(`/api/arcade/matches/${matchId}?guestId=${encodeURIComponent(getGuestId())}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            version,
            snapshot: {
              gameKey: "checkers",
              board: nextBoard,
              turn: nextTurn,
              status,
              message: nextTurn === 1 ? "Turno de marfil." : "Turno de pintea.",
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setOnlineVersion(data.version ?? version + 1);
          setSyncMessage(data.snapshot?.message ?? "Movimiento sincronizado.");
        } else {
          const data = await response.json().catch(() => null);
          setSyncMessage(data?.error ?? "No se pudo sincronizar. Recuperando estado...");
        }
      } catch {
        setSyncMessage("Conexión interrumpida. Reintentando sincronización...");
      }
    },
    [matchId, onlineVersion],
  );

  useEffect(() => {
    if (!isOnline || !matchId) return;
    let cancelled = false;

    const loadState = async () => {
      try {
        const response = await fetch(`/api/arcade/matches/${matchId}?guestId=${encodeURIComponent(getGuestId())}`, { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();

        if (!data.snapshot && onlineRole === "player1" && data.version === 0) {
          await publishSnapshot(cloneBoard(INITIAL_BOARD), 1, 0);
          return;
        }

        if (!cancelled && data.snapshot && data.version !== onlineVersion) {
          setBoard(data.snapshot.board ?? INITIAL_BOARD);
          setTurn(data.snapshot.turn === 2 ? 2 : 1);
          setSelected(null);
          setOnlineVersion(data.version ?? 0);
          setSyncMessage(data.snapshot.message ?? "Estado sincronizado.");
        }
      } catch {
        if (!cancelled) setSyncMessage("Esperando al servidor de partida...");
      }
    };

    void loadState();
    const interval = window.setInterval(loadState, 1200);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [isOnline, matchId, onlineRole, onlineVersion, publishSnapshot]);

  const startLocal = () => {
    setGameMode("local");
    setOnlineRole(null);
    setMatchId(null);
    setOnlineVersion(0);
    setBoard(cloneBoard(INITIAL_BOARD));
    setTurn(1);
    setSelected(null);
    setSyncMessage("Partida local iniciada.");
    setPhase("playing");
  };

  const startQueue = () => {
    setGameMode("online");
    setPhase("queue");
    setSyncMessage("Buscando rival online...");
  };

  const handleMatchFound = useCallback((nextMatchId: string, role: string) => {
    setGameMode("online");
    setOnlineRole(role === "player2" ? "player2" : "player1");
    setMatchId(nextMatchId);
    setOnlineVersion(0);
    setBoard(cloneBoard(INITIAL_BOARD));
    setTurn(1);
    setSelected(null);
    setSyncMessage(role === "player2" ? "Conectado como negras. Esperando primer movimiento." : "Conectado como blancas. Te toca abrir.");
    setPhase("playing");
  }, []);

  const handleSquareClick = (r: number, c: number) => {
    if (phase !== "playing" || !canAct) return;
    const piece = board[r][c];

    if (piece === turn || piece === turn + 2) {
      if (!isOnline || turn === mySide) setSelected({ r, c });
      return;
    }

    if (!selected || piece !== 0) return;

    const sr = selected.r;
    const sc = selected.c;
    const selectedPiece = board[sr][sc];
    const dr = r - sr;
    const dc = Math.abs(c - sc);
    const isForward = turn === 1 ? dr === -1 : dr === 1;
    const isKing = selectedPiece > 2;
    let validMove = false;
    let capture: { r: number; c: number } | null = null;

    if ((isForward || isKing) && Math.abs(dr) === 1 && dc === 1) {
      validMove = true;
    } else if (Math.abs(dr) === 2 && dc === 2) {
      const midR = sr + dr / 2;
      const midC = sc + (c - sc) / 2;
      const midPiece = board[midR][midC];
      if (midPiece !== 0 && midPiece !== turn && midPiece !== turn + 2) {
        validMove = true;
        capture = { r: midR, c: midC };
      }
    }

    if (!validMove) return;

    const newBoard = cloneBoard(board);
    newBoard[sr][sc] = 0;

    let finalPiece = selectedPiece;
    if (turn === 1 && r === 0 && selectedPiece === 1) finalPiece = 3;
    if (turn === 2 && r === 7 && selectedPiece === 2) finalPiece = 4;

    newBoard[r][c] = finalPiece;
    if (capture) newBoard[capture.r][capture.c] = 0;

    const nextTurn = turn === 1 ? 2 : 1;
    setBoard(newBoard);
    setSelected(null);
    setTurn(nextTurn);
    setSyncMessage(nextTurn === 1 ? "Turno de marfil." : "Turno de pintea.");
    if (isOnline) void publishSnapshot(newBoard, nextTurn);
  };

  return (
    <div className="page-shell min-h-screen flex flex-col items-center justify-center py-10">
      <div className="w-full max-w-4xl px-4 relative">
        {phase === "queue" && (
          <MatchmakingLobby
            gameKey="checkers"
            gameName="Damas Estelares"
            onMatchFound={handleMatchFound}
            onCancel={() => setPhase("menu")}
          />
        )}

        <Link href="/social" className="mb-8 inline-flex items-center gap-2 text-sm text-neon-pink hover:text-white transition-colors">
          <ArrowLeft size={16} /> Volver al Hub
        </Link>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-serif text-[#3e3024] tracking-tight">Damas <span className="text-[#8c4030]">Clásicas</span></h1>
          {phase === "playing" && <p className="text-[#8a765f] font-mono uppercase tracking-widest text-sm mt-2">{syncMessage}</p>}
        </div>

        {phase === "menu" && (
          <div className="bg-[#fcfaf4] p-10 flex flex-col gap-4 text-center mt-10 rounded-sm w-full max-w-md mx-auto border border-[#d6c4a5] shadow-[5px_8px_15px_rgba(100,70,40,0.15)] relative transform rotate-1">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#cc6640] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)] border border-[#a64020]" />
            <h2 className="text-2xl font-serif font-bold text-[#3e3024] mb-6 mt-2">Modalidad de Partida</h2>
            <button onClick={startLocal} className="w-full bg-[#f4ead5] border border-[#d6c4a5] text-[#453628] font-bold font-serif py-4 justify-center hover:bg-[#8c4030] hover:text-[#fdfbf7] shadow-sm transition-colors">
              Jugar en persona
            </button>
            <button onClick={startQueue} className="w-full bg-[#8c4030] border border-[#6c2f22] text-[#fdfbf7] font-bold font-serif py-4 justify-center hover:bg-[#6c2f22] shadow-sm transition-colors inline-flex items-center gap-2">
              <Radio size={16} /> Buscar rival online
            </button>
          </div>
        )}

        {phase === "playing" && (
          <div className="bg-[#fcfaf4] border-8 border-[#3e3024] p-8 max-w-2xl mx-auto flex flex-col items-center shadow-[10px_15px_30px_rgba(60,40,30,0.3)]">
            <div className="mb-6 flex gap-4 w-full justify-between items-center px-4 font-serif">
              <div className={`px-4 py-2 font-bold border-2 ${turn === 1 ? "bg-[#f4ead5] border-[#a68659] text-[#3e3024]" : "border-transparent text-[#b5a38a]"}`}>MARFIL {isOnline && onlineRole === "player1" ? "(TÚ)" : ""}</div>
              <div className={`px-4 py-2 font-bold border-2 ${turn === 2 ? "bg-[#e8dcc4] border-[#8c4030] text-[#8c4030]" : "border-transparent text-[#b5a38a]"}`}>PINTEA {isOnline && onlineRole === "player2" ? "(TÚ)" : ""}</div>
            </div>

            <div className={`mb-4 rounded border px-4 py-2 text-center text-xs font-bold uppercase tracking-widest ${canAct ? "border-[#8c4030]/40 text-[#8c4030]" : "border-[#a68659]/40 text-[#8a765f]"}`}>
              {canAct ? "Puedes mover" : "Esperando movimiento rival"}
            </div>

            <div className="grid grid-cols-8 border-8 border-[#2e2017] overflow-hidden shadow-2xl relative">
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] z-10" />
              {board.map((row, r) =>
                row.map((piece, c) => {
                  const isDark = (r + c) % 2 === 1;
                  const isSelected = selected?.r === r && selected?.c === c;
                  return (
                    <div
                      key={`${r}-${c}`}
                      onClick={() => handleSquareClick(r, c)}
                      className={`w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center transition-colors relative z-0 ${canAct ? "cursor-pointer" : "cursor-not-allowed"}
                        ${isDark ? "bg-[#2e2017]" : "bg-[#a68659]"}
                        ${isSelected ? "bg-[#cc6640] opacity-80" : ""}
                      `}
                    >
                      {piece !== 0 && (
                        <div className={`w-[80%] h-[80%] rounded-full shadow-[2px_4px_6px_rgba(0,0,0,0.5)] flex items-center justify-center
                          ${piece === 1 || piece === 3 ? "bg-[#fdfbf7] border-2 border-[#d6c4a5]" : "bg-[#5c4033] border-2 border-[#2e2017]"}
                          ${piece > 2 ? "border-[6px] border-[#ccaa40]" : ""}
                        `}>
                          <div className="w-[60%] h-[60%] rounded-full opacity-30 border border-current" />
                          {piece > 2 && <div className="absolute w-2 h-2 bg-[#ccaa40] rounded-full shadow-sm" />}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
