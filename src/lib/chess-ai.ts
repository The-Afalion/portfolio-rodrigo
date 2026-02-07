import { Chess } from 'chess.js';

const pieceValues: { [key: string]: number } = {
  p: 1, n: 3, b: 3, r: 5, q: 9, k: 100
};

// Evalúa una posición desde la perspectiva del jugador actual
function evaluateBoard(board: any): number {
  let totalEvaluation = 0;
  const squares = board.board();

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = squares[i][j];
      if (piece) {
        const value = pieceValues[piece.type];
        // Suma si es nuestra pieza, resta si es del oponente
        totalEvaluation += (piece.color === board.turn() ? value : -value);
      }
    }
  }
  return totalEvaluation;
}

// Algoritmo Minimax con poda Alfa-Beta para encontrar el mejor movimiento
function minimax(game: any, depth: number, alpha: number, beta: number, isMaximizingPlayer: boolean): [number, string | null] {
  if (depth === 0 || game.isGameOver()) {
    return [evaluateBoard(game.board()), null];
  }

  let bestMove: string | null = null;
  let bestValue = isMaximizingPlayer ? -Infinity : Infinity;
  const moves = game.moves({ verbose: true });

  for (const move of moves) {
    game.move(move);
    const [value] = minimax(game, depth - 1, alpha, beta, !isMaximizingPlayer);
    game.undo();

    if (isMaximizingPlayer) {
      if (value > bestValue) {
        bestValue = value;
        bestMove = move.san;
      }
      alpha = Math.max(alpha, bestValue);
    } else {
      if (value < bestValue) {
        bestValue = value;
        bestMove = move.san;
      }
      beta = Math.min(beta, bestValue);
    }

    if (beta <= alpha) {
      break; // Poda Alfa-Beta
    }
  }

  return [bestValue, bestMove];
}

// Función principal para obtener los mejores movimientos ordenados
export function getRankedMoves(fen: string, depth: number = 3): { move: string, score: number }[] {
  const game = new Chess(fen);
  const moves = game.moves({ verbose: true });
  const rankedMoves = [];

  for (const move of moves) {
    game.move(move);
    const [score] = minimax(game, depth - 1, -Infinity, Infinity, false);
    game.undo();
    rankedMoves.push({ move: move.san, score });
  }

  // Ordenar de mejor a peor (mayor puntuación para el jugador actual)
  rankedMoves.sort((a, b) => b.score - a.score);
  return rankedMoves;
}

// Función para obtener un solo mejor movimiento (para las batallas de IA)
export function getBestMove(fen: string, depth: number = 3): string | null {
  const game = new Chess(fen);
  const [, bestMove] = minimax(game, depth, -Infinity, Infinity, true);
  return bestMove;
}
