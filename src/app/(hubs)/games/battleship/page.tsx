"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Radio, Target } from "lucide-react";
import MatchmakingLobby from "@/components/games/MatchmakingLobby";

type Grid = number[][];
type Phase = "menu" | "queue" | "playing" | "gameover";
type OnlineRole = "player1" | "player2";

const GRID_SIZE = 10;

const createEmptyGrid = (): Grid => Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));
const cloneGrid = (grid: Grid): Grid => grid.map((row) => [...row]);

const placeShipsRandomly = (grid: Grid) => {
  const newGrid = cloneGrid(grid);
  const ships = [5, 4, 3, 3, 2];

  ships.forEach((len) => {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 300) {
      attempts += 1;
      const isHorizontal = Math.random() > 0.5;
      const r = Math.floor(Math.random() * (isHorizontal ? GRID_SIZE : GRID_SIZE - len));
      const c = Math.floor(Math.random() * (isHorizontal ? GRID_SIZE - len : GRID_SIZE));

      let canPlace = true;
      for (let i = 0; i < len; i++) {
        if (isHorizontal ? newGrid[r][c + i] !== 0 : newGrid[r + i][c] !== 0) {
          canPlace = false;
          break;
        }
      }

      if (canPlace) {
        for (let i = 0; i < len; i++) {
          if (isHorizontal) newGrid[r][c + i] = 1;
          else newGrid[r + i][c] = 1;
        }
        placed = true;
      }
    }
  });

  return newGrid;
};

function getGuestId() {
  const key = "arcadeGuestId";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const generated = `guest-${crypto.randomUUID()}`;
  window.localStorage.setItem(key, generated);
  return generated;
}

function checkWin(grid: Grid) {
  return !grid.some((row) => row.some((cell) => cell === 1));
}

function createFleet() {
  return placeShipsRandomly(createEmptyGrid());
}

export default function BattleshipGame() {
  const [player1Grid, setPlayer1Grid] = useState<Grid>(() => createFleet());
  const [player2Grid, setPlayer2Grid] = useState<Grid>(() => createFleet());
  const [phase, setPhase] = useState<Phase>("menu");
  const [gameMode, setGameMode] = useState<"bot" | "online">("bot");
  const [turn, setTurn] = useState<1 | 2>(1);
  const [message, setMessage] = useState("Prepara tus misiles, Comandante.");
  const [onlineRole, setOnlineRole] = useState<OnlineRole | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [onlineVersion, setOnlineVersion] = useState(0);

  const isOnline = gameMode === "online" && Boolean(matchId && onlineRole);
  const mySide: 1 | 2 = onlineRole === "player2" ? 2 : 1;
  const canFire = phase === "playing" && (!isOnline || turn === mySide);
  const myGrid = !isOnline || mySide === 1 ? player1Grid : player2Grid;
  const enemyGrid = !isOnline || mySide === 1 ? player2Grid : player1Grid;

  const publishSnapshot = useCallback(
    async (nextP1: Grid, nextP2: Grid, nextTurn: 1 | 2, nextMessage: string, nextPhase: Phase, version = onlineVersion) => {
      if (!matchId) return;
      try {
        const response = await fetch(`/api/arcade/matches/${matchId}?guestId=${encodeURIComponent(getGuestId())}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            version,
            snapshot: {
              gameKey: "battleship",
              player1Grid: nextP1,
              player2Grid: nextP2,
              turn: nextTurn,
              message: nextMessage,
              phase: nextPhase,
              status: nextPhase === "gameover" ? "COMPLETED" : "ACTIVE",
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setOnlineVersion(data.version ?? version + 1);
        } else {
          const data = await response.json().catch(() => null);
          setMessage(data?.error ?? "La flota rival ya cambió de posición. Sincronizando...");
        }
      } catch {
        setMessage("Radio naval interrumpida. Reintentando sincronización...");
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
          const p1 = createFleet();
          const p2 = createFleet();
          setPlayer1Grid(p1);
          setPlayer2Grid(p2);
          setTurn(1);
          setMessage("Flotas desplegadas. Dispara el comandante azul.");
          await publishSnapshot(p1, p2, 1, "Flotas desplegadas. Dispara el comandante azul.", "playing", 0);
          return;
        }

        if (!cancelled && data.snapshot && data.version !== onlineVersion) {
          setPlayer1Grid(data.snapshot.player1Grid ?? createEmptyGrid());
          setPlayer2Grid(data.snapshot.player2Grid ?? createEmptyGrid());
          setTurn(data.snapshot.turn === 2 ? 2 : 1);
          setMessage(data.snapshot.message ?? "Estado naval sincronizado.");
          setPhase(data.snapshot.phase === "gameover" ? "gameover" : "playing");
          setOnlineVersion(data.version ?? 0);
        }
      } catch {
        if (!cancelled) setMessage("Esperando al servidor naval...");
      }
    };

    void loadState();
    const interval = window.setInterval(loadState, 1200);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [isOnline, matchId, onlineRole, onlineVersion, publishSnapshot]);

  const startBotGame = () => {
    setGameMode("bot");
    setOnlineRole(null);
    setMatchId(null);
    setOnlineVersion(0);
    setPlayer1Grid(createFleet());
    setPlayer2Grid(createFleet());
    setTurn(1);
    setMessage("Prepara tus misiles, Comandante.");
    setPhase("playing");
  };

  const startQueue = () => {
    setGameMode("online");
    setPhase("queue");
    setMessage("Buscando rival para batalla naval...");
  };

  const handleMatchFound = useCallback((nextMatchId: string, role: string) => {
    setGameMode("online");
    setOnlineRole(role === "player2" ? "player2" : "player1");
    setMatchId(nextMatchId);
    setOnlineVersion(0);
    setPlayer1Grid(createEmptyGrid());
    setPlayer2Grid(createEmptyGrid());
    setTurn(1);
    setMessage(role === "player2" ? "Conectado como flota roja. Espera el primer disparo." : "Conectado como flota azul. Preparando flotas...");
    setPhase("playing");
  }, []);

  const aiTurn = (nextPlayerGrid?: Grid) => {
    const current = cloneGrid(nextPlayerGrid ?? player1Grid);
    let fired = false;
    while (!fired) {
      const r = Math.floor(Math.random() * GRID_SIZE);
      const c = Math.floor(Math.random() * GRID_SIZE);
      if (current[r][c] < 2) {
        const hit = current[r][c] === 1;
        current[r][c] = hit ? 3 : 2;
        fired = true;
        setMessage(hit ? "¡Alerta Roja! Fuego enemigo impactó nuestro navío." : "La IA falló el tiro. Tu turno.");
      }
    }

    setPlayer1Grid(current);
    if (checkWin(current)) {
      setMessage("DERROTA. La IA ha erradicado tu flota.");
      setPhase("gameover");
    } else {
      setTurn(1);
    }
  };

  const handleFire = (r: number, c: number) => {
    if (!canFire) return;

    if (!isOnline) {
      if (player2Grid[r][c] > 1) return;
      const newEnemy = cloneGrid(player2Grid);
      const hit = newEnemy[r][c] === 1;
      newEnemy[r][c] = hit ? 3 : 2;
      setPlayer2Grid(newEnemy);

      if (checkWin(newEnemy)) {
        setMessage("¡VICTORIA! Has destruido la flota enemiga.");
        setPhase("gameover");
        return;
      }

      setMessage(hit ? "¡Impacto confirmado! Cargando retorno de la IA..." : "Agua. IA tomando coordenadas...");
      setTurn(2);
      window.setTimeout(() => aiTurn(), 900);
      return;
    }

    const targetGrid = mySide === 1 ? cloneGrid(player2Grid) : cloneGrid(player1Grid);
    if (targetGrid[r][c] > 1) return;

    const hit = targetGrid[r][c] === 1;
    targetGrid[r][c] = hit ? 3 : 2;

    const nextP1 = mySide === 1 ? player1Grid : targetGrid;
    const nextP2 = mySide === 1 ? targetGrid : player2Grid;
    const won = checkWin(targetGrid);
    const nextTurn: 1 | 2 = mySide === 1 ? 2 : 1;
    const nextMessage = won
      ? `Victoria de la flota ${mySide === 1 ? "azul" : "roja"}.`
      : hit
        ? `Impacto confirmado. Turno de la flota ${nextTurn === 1 ? "azul" : "roja"}.`
        : `Agua. Turno de la flota ${nextTurn === 1 ? "azul" : "roja"}.`;
    const nextPhase: Phase = won ? "gameover" : "playing";

    setPlayer1Grid(nextP1);
    setPlayer2Grid(nextP2);
    setTurn(nextTurn);
    setMessage(nextMessage);
    setPhase(nextPhase);
    void publishSnapshot(nextP1, nextP2, nextTurn, nextMessage, nextPhase);
  };

  const renderCell = (cell: number, isOwnFleet: boolean) => {
    const showShip = isOwnFleet && cell === 1;
    if (showShip) return "bg-[#3c5a6b]";
    if (cell === 2) return "bg-transparent flex items-center justify-center after:content-[''] after:w-3 after:h-3 after:bg-[#fcfaf4] after:border-2 after:border-[#3c5a6b] after:rounded-full";
    if (cell === 3) return "bg-[#8c4030] flex items-center justify-center after:content-['X'] after:text-[#fcfaf4] after:font-black after:text-xl";
    return "";
  };

  return (
    <div className="page-shell min-h-screen py-10 px-4 bg-[#cce3eb] font-serif">
      <div className="max-w-6xl mx-auto relative">
        {phase === "queue" && (
          <MatchmakingLobby
            gameKey="battleship"
            gameName="Batalla Naval"
            onMatchFound={handleMatchFound}
            onCancel={() => setPhase("menu")}
          />
        )}

        <Link href="/social" className="mb-6 inline-flex items-center gap-2 text-sm text-[#3c5a6b] font-bold hover:text-[#1e2a33] transition-colors">
          <ArrowLeft size={16} /> Volver a la Tavera
        </Link>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-serif text-[#1e2a33] tracking-tight flex justify-center items-center gap-3">
            <Target className="text-[#3c5a6b]" size={32} /> Batalla <span className="text-[#5e6642]">Naval</span>
          </h1>
          <p className="text-[#3c5a6b] font-medium italic mt-2">{message}</p>
        </div>

        {phase === "menu" && (
          <div className="bg-[#fcfaf4] p-10 flex flex-col gap-4 text-center mt-10 rounded-sm w-full max-w-md mx-auto border border-[#9fbcce] shadow-[5px_8px_15px_rgba(60,90,107,0.15)] relative transform -rotate-1">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#668c99] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)] border border-[#4d6c7a]" />
            <h2 className="text-2xl font-serif font-bold text-[#1e2a33] mb-6 mt-2">Modalidad de Partida</h2>
            <button onClick={startBotGame} className="w-full bg-[#e6f1f5] border border-[#9fbcce] text-[#2e404d] font-bold font-serif py-4 justify-center hover:bg-[#3c5a6b] hover:text-[#fcfaf4] shadow-sm transition-colors">
              Jugar contra IA
            </button>
            <button onClick={startQueue} className="w-full bg-[#3c5a6b] border border-[#2e404d] text-[#fcfaf4] font-bold font-serif py-4 justify-center hover:bg-[#2e404d] shadow-sm transition-colors inline-flex items-center gap-2">
              <Radio size={16} /> Buscar rival online
            </button>
          </div>
        )}

        {(phase === "playing" || phase === "gameover") && (
          <div className="space-y-5">
            {isOnline && (
              <div className="mx-auto max-w-xl rounded border border-[#7b9ba8] bg-[#fcfaf4]/80 px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-[#2e404d]">
                Eres la flota {mySide === 1 ? "azul" : "roja"} · {canFire ? "tu disparo" : "esperando disparo rival"}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative">
              <div className="bg-[#fcfaf4] p-6 border border-[#d6c4a5] shadow-[4px_6px_10px_rgba(60,90,107,0.15)] relative transform rotate-[0.5deg]">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-20 pointer-events-none mix-blend-multiply" />
                <h2 className="text-xl text-center text-[#1e2a33] font-bold mb-4 font-serif">TU FLOTA</h2>
                <div className="grid grid-cols-10 gap-0 aspect-square bg-transparent border-2 border-[#7b9ba8] relative z-10 w-full" style={{ backgroundImage: "linear-gradient(#9fbcce 1px, transparent 1px), linear-gradient(90deg, #9fbcce 1px, transparent 1px)", backgroundSize: "10% 10%" }}>
                  {myGrid.map((row, r) => row.map((cell, c) => (
                    <div key={`p-${r}-${c}`} className={`w-full h-full border border-[#9fbcce]/50 transition-colors relative ${renderCell(cell, true)}`} />
                  )))}
                </div>
              </div>

              <div className={`bg-[#fcfaf4] p-6 border border-[#d6c4a5] shadow-[4px_6px_10px_rgba(60,90,107,0.15)] relative transform rotate-[-0.5deg] transition-all ${canFire ? "border-2 border-[#8c4030]" : "opacity-70 pointer-events-none"}`}>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-20 pointer-events-none mix-blend-multiply" />
                <h2 className="text-xl text-center text-[#8c4030] font-bold mb-4 font-serif">MAR RIVAL</h2>
                <div className="grid grid-cols-10 gap-0 aspect-square bg-transparent border-2 border-[#d4bd9a] relative z-10 w-full cursor-crosshair" style={{ backgroundImage: "linear-gradient(#e3d7c5 1px, transparent 1px), linear-gradient(90deg, #e3d7c5 1px, transparent 1px)", backgroundSize: "10% 10%" }}>
                  {enemyGrid.map((row, r) => row.map((cell, c) => (
                    <div key={`e-${r}-${c}`} onClick={() => handleFire(r, c)} className={`w-full h-full border border-[#e3d7c5] hover:bg-[#8c4030]/10 transition-colors relative ${renderCell(cell, false)}`} />
                  )))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
