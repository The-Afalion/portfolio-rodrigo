"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MatchmakingLobby from "@/components/games/MatchmakingLobby";
import { ArrowLeft, Target } from "lucide-react";

// 0: empty, 1: ship, 2: miss, 3: hit
const GRID_SIZE = 10;

const createEmptyGrid = () => Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));

const placeShipsRandomly = (grid: number[][]) => {
  const newGrid = grid.map(r => [...r]);
  const ships = [5, 4, 3, 3, 2];
  
  ships.forEach(len => {
    let placed = false;
    while (!placed) {
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

export default function BattleshipGame() {
  const [playerGrid, setPlayerGrid] = useState<number[][]>([]);
  const [enemyGrid, setEnemyGrid] = useState<number[][]>([]);
  const [phase, setPhase] = useState("menu"); // menu, queue, playing, gameover
  const [turn, setTurn] = useState("player");
  const [gameMode, setGameMode] = useState<"bot"|"online">("bot");
  const [onlineRole, setOnlineRole] = useState<"player1"|"player2"|null>(null);
  const [matchId, setMatchId] = useState<string|null>(null);
  const [message, setMessage] = useState("Prepara tus misiles, Comandante.");

  useEffect(() => {
    setPlayerGrid(placeShipsRandomly(createEmptyGrid()));
    setEnemyGrid(placeShipsRandomly(createEmptyGrid()));
  }, []);

  const handleFire = (r: number, c: number) => {
    if (phase !== "playing" || turn !== "player") return;
    if (enemyGrid[r][c] > 1) return; // Ya disparado

    const newEnemy = enemyGrid.map(row => [...row]);
    let hit = newEnemy[r][c] === 1;
    newEnemy[r][c] = hit ? 3 : 2;
    setEnemyGrid(newEnemy);

    if (checkWin(newEnemy)) {
      setMessage("¡VICTORIA! Has destruido la flota enemiga.");
      setPhase("gameover");
      return;
    }

    setMessage(hit ? "¡Impacto confirmado! Cargando retorno de la IA..." : "Agua. IA tomando coordenadas...");
    setTurn("ai");

    setTimeout(aiTurn, 1000);
  };

  const aiTurn = () => {
    setPlayerGrid(prev => {
      const newPlayer = prev.map(row => [...row]);
      let fired = false;
      while (!fired) {
        const r = Math.floor(Math.random() * GRID_SIZE);
        const c = Math.floor(Math.random() * GRID_SIZE);
        if (newPlayer[r][c] < 2) {
          let hit = newPlayer[r][c] === 1;
          newPlayer[r][c] = hit ? 3 : 2;
          fired = true;
          setMessage(hit ? "¡Alerta Roja! Fuego enemigo impactó nuestro navío." : "La IA falló el tiro. Tu turno.");
        }
      }
      
      if (checkWin(newPlayer)) {
        setMessage("DERROTA. La IA ha erradicado tu flota.");
        setPhase("gameover");
      } else {
        setTurn("player");
      }
      
      return newPlayer;
    });
  };

  const checkWin = (grid: number[][]) => {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] === 1) return false;
      }
    }
    return true;
  };

  return (
    <div className="page-shell min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <Link href="/social" className="mb-6 inline-flex items-center gap-2 text-sm text-neon-cyan hover:text-white transition-colors">
          <ArrowLeft size={16} /> Volver al Hub
        </Link>
        <div className="text-center mb-8">
           <h1 className="text-4xl font-bold text-white tracking-tight flex justify-center items-center gap-3">
             <Target className="text-neon-cyan" size={32}/> Batalla Naval <span className="text-neon-cyan">Neón</span>
           </h1>
           <p className="text-white/60 mt-2">{message}</p>
        </div>

        {phase === "menu" && (
           <div className="surface-panel p-10 flex flex-col gap-4 text-center mt-10 rounded-[2rem] w-full max-w-md mx-auto border border-neon-cyan/30">
              <h2 className="text-2xl font-bold text-white mb-6">Elige el Modo de Juego</h2>
              <button 
                onClick={() => { setGameMode("bot"); setPhase("playing"); }} 
                className="action-pill w-full bg-white/5 border-white/10 text-white font-bold py-4 justify-center hover:bg-neon-cyan hover:text-black hover:border-neon-cyan"
              >
                 Jugar Offline (Vs IA)
              </button>
              <div className="flex items-center gap-4 text-white/30 my-2">
                 <div className="flex-1 border-t border-white/10"></div>
                 <span className="text-xs uppercase">Conexión Remota</span>
                 <div className="flex-1 border-t border-white/10"></div>
              </div>
              <button 
                onClick={() => setPhase("queue")} 
                className="action-pill w-full bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan font-bold py-4 justify-center hover:bg-neon-cyan hover:text-black"
              >
                 Buscar Partida Online
              </button>
           </div>
        )}

        {phase === "queue" && (
           <MatchmakingLobby 
              gameKey="battleship" 
              gameName="Batalla Naval Neón" 
              onCancel={() => setPhase("menu")}
              onMatchFound={(id, role) => {
                 setMatchId(id);
                 setOnlineRole(role as any);
                 setGameMode("online");
                 setPhase("playing");
                 // Initialize multiplayer state if needed
              }}
           />
        )}

        {(phase === "playing" || phase === "gameover") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Jugador */}
            <div className="surface-panel p-6 rounded-[2rem]">
              <h2 className="text-xl text-center text-white font-bold mb-4">TU FLOTA</h2>
              <div className="grid grid-cols-10 gap-1 aspect-square bg-black/50 p-2 rounded-xl">
                {playerGrid.map((row, r) => row.map((cell, c) => (
                  <div key={`p-${r}-${c}`} className={`w-full h-full rounded-sm border border-white/5 transition-colors
                    ${cell === 0 ? "bg-cyan-950/20" : ""}
                    ${cell === 1 ? "bg-neon-cyan shadow-[0_0_10px_#0ff]" : ""}
                    ${cell === 2 ? "bg-white/20 flex items-center justify-center after:content-[''] after:w-2 after:h-2 after:bg-white after:rounded-full" : ""}
                    ${cell === 3 ? "bg-red-500 shadow-[0_0_15px_#f00] flex items-center justify-center after:content-['✕'] after:text-white after:font-bold" : ""}
                  `} />
                )))}
              </div>
            </div>

            {/* Enemigo */}
            <div className={`surface-panel p-6 rounded-[2rem] transition-all ${turn === "player" ? "border-neon-pink shadow-[0_0_20px_rgba(255,0,255,0.15)]" : "opacity-50 pointer-events-none"}`}>
              <h2 className="text-xl text-center text-neon-pink font-bold mb-4">RADAR ENEMIGO</h2>
              <div className="grid grid-cols-10 gap-1 aspect-square bg-black/50 p-2 rounded-xl cursor-crosshair">
                {enemyGrid.map((row, r) => row.map((cell, c) => (
                  <div key={`e-${r}-${c}`} onClick={() => handleFire(r, c)} className={`w-full h-full rounded-sm border border-pink-500/20 hover:border-neon-pink transition-colors
                    ${cell < 2 ? "bg-pink-950/20" : ""}
                    ${cell === 2 ? "bg-white/20 flex items-center justify-center after:content-[''] after:w-2 after:h-2 after:bg-white after:rounded-full" : ""}
                    ${cell === 3 ? "bg-neon-pink shadow-[0_0_15px_#f0f] flex items-center justify-center after:content-['✕'] after:text-white after:font-bold" : ""}
                  `} />
                )))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
