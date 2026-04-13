"use client";

import { useState } from "react";
import Link from "next/link";
import MatchmakingLobby from "@/components/games/MatchmakingLobby";
import { ArrowLeft } from "lucide-react";

// Representación básica: 0 = vacío, 1 = Blanca, 2 = Negra, 3 = Reina Blanca, 4 = Reina Negra
const INITIAL_BOARD = [
  [0, 2, 0, 2, 0, 2, 0, 2],
  [2, 0, 2, 0, 2, 0, 2, 0],
  [0, 2, 0, 2, 0, 2, 0, 2],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0],
];

export default function CheckersGame() {
  const [phase, setPhase] = useState("menu"); // menu, queue, playing
  const [board, setBoard] = useState(INITIAL_BOARD);
  const [turn, setTurn] = useState(1); // 1 = Blancas, 2 = Negras
  const [selected, setSelected] = useState<{r: number, c: number} | null>(null);
  const [gameMode, setGameMode] = useState<"bot"|"online">("bot");
  const [onlineRole, setOnlineRole] = useState<"player1"|"player2"|null>(null);
  const [matchId, setMatchId] = useState<string|null>(null);

  // Lógica de movimiento muy simplificada para MVP Hot-Seat
  const handleSquareClick = (r: number, c: number) => {
    if (phase !== "playing") return;
    const piece = board[r][c];

    // Seleccionar pieza propia
    if (piece === turn || piece === turn + 2) {
      setSelected({ r, c });
      return;
    }

    // Mover a celda vacía si hay una seleccionada
    if (selected && piece === 0) {
      const sr = selected.r;
      const sc = selected.c;
      const selectedPiece = board[sr][sc];
      
      const dr = r - sr;
      const dc = Math.abs(c - sc);

      // Movimiento simple (1 en diagonal)
      const isForward = turn === 1 ? dr === -1 : dr === 1;
      const isKing = selectedPiece > 2;

      let validMove = false;
      let capture = null;

      if ((isForward || isKing) && Math.abs(dr) === 1 && dc === 1) {
        validMove = true;
      } 
      // Movimiento de captura (2 en diagonal)
      else if (Math.abs(dr) === 2 && dc === 2) {
        const midR = sr + dr / 2;
        const midC = sc + (c - sc) / 2;
        const midPiece = board[midR][midC];
        // Si hay una pieza enemiga en medio
        if (midPiece !== 0 && midPiece !== turn && midPiece !== turn + 2) {
          validMove = true;
          capture = { r: midR, c: midC };
        }
      }

      if (validMove) {
        const newBoard = board.map(row => [...row]);
        newBoard[sr][sc] = 0; // Quitar de origen
        
        // Promoción a Reina
        let finalPiece = selectedPiece;
        if (turn === 1 && r === 0 && selectedPiece === 1) finalPiece = 3;
        if (turn === 2 && r === 7 && selectedPiece === 2) finalPiece = 4;
        
        newBoard[r][c] = finalPiece; // Poner en destino
        
        if (capture) {
          newBoard[capture.r][capture.c] = 0; // Eliminar la pieza comida
        }

        setBoard(newBoard);
        setSelected(null);
        setTurn(turn === 1 ? 2 : 1);
      }
    }
  };

  return (
    <div className="page-shell min-h-screen flex flex-col items-center justify-center py-10">
      <div className="w-full max-w-4xl px-4">
        <Link href="/social" className="mb-8 inline-flex items-center gap-2 text-sm text-neon-pink hover:text-white transition-colors">
          <ArrowLeft size={16} /> Volver al Hub
        </Link>
        <div className="text-center mb-8">
           <h1 className="text-4xl font-bold font-serif text-[#3e3024] tracking-tight">Damas <span className="text-[#8c4030]">Clásicas</span></h1>
           {phase === "playing" && <p className="text-[#8a765f] font-mono uppercase tracking-widest text-sm mt-2">Mesa de Juego</p>}
        </div>

        {phase === "menu" && (
           <div className="bg-[#fcfaf4] p-10 flex flex-col gap-4 text-center mt-10 rounded-sm w-full max-w-md mx-auto border border-[#d6c4a5] shadow-[5px_8px_15px_rgba(100,70,40,0.15)] relative transform rotate-1">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#cc6640] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)] border border-[#a64020]" />
              <h2 className="text-2xl font-serif font-bold text-[#3e3024] mb-6 mt-2">Modalidad de Partida</h2>
              <button 
                onClick={() => { setGameMode("bot"); setPhase("playing"); }} 
                className="w-full bg-[#f4ead5] border border-[#d6c4a5] text-[#453628] font-bold font-serif py-4 justify-center hover:bg-[#8c4030] hover:text-[#fdfbf7] shadow-sm transition-colors"
              >
                 Jugar en Persona (Local)
              </button>
              <div className="flex items-center gap-4 text-[#a6967c] my-2">
                 <div className="flex-1 border-t border-dashed border-[#d6c4a5]"></div>
                 <span className="text-xs uppercase font-mono tracking-widest">Conexión Postal</span>
                 <div className="flex-1 border-t border-dashed border-[#d6c4a5]"></div>
              </div>
              <button 
                onClick={() => setPhase("queue")} 
                className="w-full bg-[#8c4030] text-[#fdfbf7] font-bold font-serif py-4 justify-center hover:bg-[#453628] shadow-sm transition-colors"
              >
                 Enviar Telegrama de Reto
              </button>
           </div>
        )}

        {phase === "queue" && (
           <MatchmakingLobby 
              gameKey="checkers" 
              gameName="Damas Neón" 
              onCancel={() => setPhase("menu")}
              onMatchFound={(id, role) => {
                 setMatchId(id);
                 setOnlineRole(role as any);
                 setGameMode("online");
                 setPhase("playing");
              }}
           />
        )}

        {phase === "playing" && (
        <div className="bg-[#fcfaf4] border-8 border-[#3e3024] p-8 max-w-2xl mx-auto flex flex-col items-center shadow-[10px_15px_30px_rgba(60,40,30,0.3)]">
          <div className="mb-6 flex gap-4 w-full justify-between items-center px-4 font-serif">
            <div className={`px-4 py-2 font-bold border-2 ${turn === 1 ? "bg-[#f4ead5] border-[#a68659] text-[#3e3024]" : "border-transparent text-[#b5a38a]"}`}>TURNO: MARFIL (1)</div>
            <div className={`px-4 py-2 font-bold border-2 ${turn === 2 ? "bg-[#e8dcc4] border-[#8c4030] text-[#8c4030]" : "border-transparent text-[#b5a38a]"}`}>TURNO: PINTEA (2)</div>
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
                    className={`w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center transition-colors cursor-pointer relative z-0
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
