"use client";
import { useState } from "react";
import { Chess, Square } from "chess.js";
import { RefreshCw, Cpu } from "lucide-react";

// Mapeo de piezas a imágenes SVG estándar (Wikimedia Commons)
const PIECE_IMAGES: Record<string, string> = {
  p: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg",
  n: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg",
  b: "https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg",
  r: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg",
  q: "https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg",
  k: "https://upload.wikimedia.org/wikipedia/commons/f/f4/Chess_kdt45.svg",
  P: "https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg",
  N: "https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg",
  B: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg",
  R: "https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg",
  Q: "https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg",
  K: "https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg",
};

export default function ChessGame() {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [status, setStatus] = useState("Tu turno (Blancas)");

  // Tablero 8x8 generado matemáticamente
  const board = [];
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  // --- LÓGICA DE JUEGO ---

  function makeRandomMove(gameCopy: Chess) {
    const possibleMoves = gameCopy.moves();

    // CORRECCIÓN AQUÍ: Usamos game_over() en lugar de isGameOver() para v0.13.4
    // CORRECCIÓN AQUÍ: Usamos in_draw() en lugar de isDraw() para v0.13.4
    if (gameCopy.game_over() || gameCopy.in_draw() || possibleMoves.length === 0) {
      setStatus("Juego Terminado.");
      return;
    }

    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    gameCopy.move(possibleMoves[randomIndex]);
    setGame(new Chess(gameCopy.fen())); // Forzar actualización
    setStatus("Tu turno (Blancas)");
  }

  function handleSquareClick(square: Square) {
    // 1. Si no hay nada seleccionado, intentamos seleccionar
    if (!selectedSquare) {
      const piece = game.get(square);
      // Solo seleccionamos si hay pieza y es blanca (tu turno)
      if (piece && piece.color === 'w') {
        setSelectedSquare(square);
      }
      return;
    }

    // 2. Si ya hay algo seleccionado, intentamos MOVER
    const gameCopy = new Chess(game.fen());
    try {
      const move = gameCopy.move({
        from: selectedSquare,
        to: square,
        promotion: 'q', // Siempre reina
      });

      if (move) {
        // Movimiento válido
        setGame(gameCopy);
        setSelectedSquare(null);
        setStatus("Pensando...");
        setTimeout(() => makeRandomMove(gameCopy), 300);
      } else {
        // Movimiento inválido: Deseleccionar o cambiar selección
        const piece = game.get(square);
        if (piece && piece.color === 'w') setSelectedSquare(square);
        else setSelectedSquare(null);
      }
    } catch (e) {
      // Si falla, reiniciamos selección
      setSelectedSquare(null);
    }
  }

  // Construir el array del tablero
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const square = (files[f] + ranks[r]) as Square;
      const piece = game.get(square);
      const isDark = (r + f) % 2 === 1;
      const isSelected = selectedSquare === square;

      board.push(
        <div
          key={square}
          onClick={() => handleSquareClick(square)}
          className={`
            w-full h-full flex items-center justify-center cursor-pointer relative
            ${isDark ? 'bg-slate-600' : 'bg-slate-400'}
            ${isSelected ? 'ring-4 ring-green-400 inset-0 z-10' : ''}
          `}
        >
            {/* Coordenadas pequeñas */}
            {f === 0 && <span className={`absolute top-0 left-1 text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{ranks[r]}</span>}
            {r === 7 && <span className={`absolute bottom-0 right-1 text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{files[f]}</span>}

            {/* La Pieza */}
            {piece && (
              <img
                src={PIECE_IMAGES[piece.color === 'w' ? piece.type.toUpperCase() : piece.type]}
                alt={`${piece.color} ${piece.type}`}
                className="w-[85%] h-[85%] select-none pointer-events-none"
              />
            )}
        </div>
      );
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      {/* HUD */}
      <div className="w-full bg-[#111] border border-green-500/30 rounded p-4 shadow-lg">
        <div className="flex items-center gap-2 text-green-400 mb-2 text-sm font-mono border-b border-green-500/20 pb-2">
          <Cpu size={16} /> MANUAL OVERRIDE SYSTEM
        </div>
        <p className="font-mono text-gray-300 text-sm">
           &gt; {status}
        </p>
      </div>

      {/* TABLERO CSS GRID */}
      <div className="w-full aspect-square border-4 border-[#222] rounded shadow-2xl overflow-hidden">
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
            {board}
        </div>
      </div>

      <div className="text-xs text-gray-500 font-mono">
        Instrucciones: Clic para seleccionar &rarr; Clic para mover.
      </div>

      <button
        onClick={() => { setGame(new Chess()); setSelectedSquare(null); }}
        className="flex items-center gap-2 px-4 py-2 bg-[#222] text-white font-mono text-sm rounded border border-gray-700 hover:border-green-500 transition-all"
      >
        <RefreshCw size={16} /> REINICIAR
      </button>
    </div>
  );
}