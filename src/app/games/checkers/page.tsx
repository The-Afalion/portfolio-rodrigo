"use client";

import { useState } from "react";
import Link from "next/link";
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
  const [board, setBoard] = useState(INITIAL_BOARD);
  const [turn, setTurn] = useState(1); // 1 = Blancas, 2 = Negras
  const [selected, setSelected] = useState<{r: number, c: number} | null>(null);

  // Lógica de movimiento muy simplificada para MVP Hot-Seat
  const handleSquareClick = (r: number, c: number) => {
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
           <h1 className="text-4xl font-bold text-white tracking-tight">Damas <span className="text-neon-pink">Neón</span></h1>
           <p className="text-white/50 text-sm mt-2">Versión Hot-Seat (Pasa el control)</p>
        </div>

        <div className="surface-panel p-8 max-w-2xl mx-auto flex flex-col items-center">
          <div className="mb-6 flex gap-4 w-full justify-between items-center px-4">
            <div className={`px-4 py-2 rounded-lg font-bold border ${turn === 1 ? "bg-neon-cyan/20 border-neon-cyan text-neon-cyan shadow-[0_0_15px_rgba(0,255,255,0.3)]" : "border-white/10 text-white/40"}`}>TU TURNO: CIAN (1)</div>
            <div className={`px-4 py-2 rounded-lg font-bold border ${turn === 2 ? "bg-neon-pink/20 border-neon-pink text-neon-pink shadow-[0_0_15px_rgba(255,0,255,0.3)]" : "border-white/10 text-white/40"}`}>TU TURNO: MAGENTA (2)</div>
          </div>

          <div className="grid grid-cols-8 border-4 border-white/10 rounded-lg overflow-hidden shadow-2xl">
            {board.map((row, r) => 
              row.map((piece, c) => {
                const isDark = (r + c) % 2 === 1;
                const isSelected = selected?.r === r && selected?.c === c;
                return (
                  <div 
                    key={`${r}-${c}`} 
                    onClick={() => handleSquareClick(r, c)}
                    className={`w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center transition-colors cursor-pointer
                      ${isDark ? "bg-gray-900" : "bg-gray-800"} 
                      ${isSelected ? "bg-white/20" : ""}
                    `}
                  >
                    {piece !== 0 && (
                      <div className={`w-[80%] h-[80%] rounded-full shadow-inner flex items-center justify-center
                        ${piece === 1 || piece === 3 ? "bg-neon-cyan shadow-[0_0_10px_#0ff]" : "bg-neon-pink shadow-[0_0_10px_#f0f]"}
                        ${piece > 2 ? "border-4 border-white/80" : ""}
                      `}>
                        {piece > 2 && <div className="w-2 h-2 bg-yellow-400 rounded-full" />}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
