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
    <div className="page-shell min-h-screen py-10 px-4 bg-[#f4ead5] font-serif">
      <div className="max-w-6xl mx-auto">
        <Link href="/social" className="mb-6 inline-flex items-center gap-2 text-sm text-[#3c5a6b] font-bold hover:text-[#1e2a33] transition-colors">
          <ArrowLeft size={16} /> Volver a la Tavera
        </Link>
        <div className="text-center mb-8">
           <h1 className="text-4xl font-bold font-serif text-[#1e2a33] tracking-tight flex justify-center items-center gap-3">
             <Target className="text-[#3c5a6b]" size={32}/> Batalla <span className="text-[#5e6642]">Naval</span>
           </h1>
           <p className="text-[#3c5a6b] font-medium italic mt-2">{message}</p>
        </div>

        {phase === "menu" && (
           <div className="bg-[#fcfaf4] p-10 flex flex-col gap-4 text-center mt-10 rounded-sm w-full max-w-md mx-auto border border-[#9fbcce] shadow-[5px_8px_15px_rgba(60,90,107,0.15)] relative transform -rotate-1">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#668c99] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)] border border-[#4d6c7a]" />
              <h2 className="text-2xl font-serif font-bold text-[#1e2a33] mb-6 mt-2">Modalidad de Partida</h2>
              <button 
                onClick={() => { setGameMode("bot"); setPhase("playing"); }} 
                className="w-full bg-[#e6f1f5] border border-[#9fbcce] text-[#2e404d] font-bold font-serif py-4 justify-center hover:bg-[#3c5a6b] hover:text-[#fcfaf4] shadow-sm transition-colors"
              >
                 Jugar en Solitario (Vs IA)
              </button>
              <div className="flex items-center gap-4 text-[#7b9ba8] my-2">
                 <div className="flex-1 border-t border-dashed border-[#9fbcce]"></div>
                 <span className="text-xs uppercase font-mono tracking-widest">Conexión Postal</span>
                 <div className="flex-1 border-t border-dashed border-[#9fbcce]"></div>
              </div>
              <button 
                onClick={() => setPhase("queue")} 
                className="w-full bg-[#3c5a6b] text-[#fcfaf4] font-bold font-serif py-4 justify-center hover:bg-[#1e2a33] shadow-sm transition-colors"
              >
                 Enviar Telegrama de Reto
              </button>
           </div>
        )}

        {phase === "queue" && (
           <MatchmakingLobby 
              gameKey="battleship" 
              gameName="Batalla Naval Clásica" 
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative">
            
            {/* Jugador */}
            <div className="bg-[#fcfaf4] p-6 border border-[#d6c4a5] shadow-[4px_6px_10px_rgba(60,90,107,0.15)] relative transform rotate-[0.5deg]">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-20 pointer-events-none mix-blend-multiply" />
              <h2 className="text-xl text-center text-[#1e2a33] font-bold mb-4 font-serif">TU FLOTA (TINTA AZUL)</h2>
              <div className="grid grid-cols-10 gap-0 aspect-square bg-transparent border-2 border-[#7b9ba8] relative z-10 w-full"
                   style={{backgroundImage: "linear-gradient(#9fbcce 1px, transparent 1px), linear-gradient(90deg, #9fbcce 1px, transparent 1px)", backgroundSize: "10% 10%"}}>
                {playerGrid.map((row, r) => row.map((cell, c) => (
                  <div key={`p-${r}-${c}`} className={`w-full h-full border border-[#9fbcce]/50 transition-colors relative
                    ${cell === 1 ? "bg-[#3c5a6b]" : ""}
                    ${cell === 2 ? "bg-transparent flex items-center justify-center after:content-[''] after:w-3 after:h-3 after:bg-[#fcfaf4] after:border-2 after:border-[#3c5a6b] after:rounded-full" : ""}
                    ${cell === 3 ? "bg-[#8c4030]/20 flex items-center justify-center after:content-['✕'] after:text-[#8c4030] after:font-black after:text-xl" : ""}
                  `} />
                )))}
              </div>
            </div>

            {/* Enemigo */}
            <div className={`bg-[#fcfaf4] p-6 border border-[#d6c4a5] shadow-[4px_6px_10px_rgba(60,90,107,0.15)] relative transform rotate-[-0.5deg] transition-all ${turn === "player" ? "border-2 border-[#8c4030]" : "opacity-70 pointer-events-none"}`}>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-20 pointer-events-none mix-blend-multiply" />
              <h2 className="text-xl text-center text-[#8c4030] font-bold mb-4 font-serif">MAR ENEMIGO (TINTA ROJA)</h2>
              <div className="grid grid-cols-10 gap-0 aspect-square bg-transparent border-2 border-[#d4bd9a] relative z-10 w-full cursor-crosshair"
                   style={{backgroundImage: "linear-gradient(#e3d7c5 1px, transparent 1px), linear-gradient(90deg, #e3d7c5 1px, transparent 1px)", backgroundSize: "10% 10%"}}>
                {enemyGrid.map((row, r) => row.map((cell, c) => (
                  <div key={`e-${r}-${c}`} onClick={() => handleFire(r, c)} className={`w-full h-full border border-[#e3d7c5] hover:bg-[#8c4030]/10 transition-colors relative
                    ${cell === 2 ? "bg-transparent flex items-center justify-center after:content-[''] after:w-3 after:h-3 after:bg-[#fcfaf4] after:border-2 after:border-[#8c4030] after:rounded-full cursor-auto" : ""}
                    ${cell === 3 ? "bg-[#8c4030] flex items-center justify-center after:content-['✕'] after:text-[#fcfaf4] after:font-black after:text-xl cursor-auto" : ""}
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
