import { Chess, Move } from "chess.js";

// Valores de las piezas para la evaluación estática
const PIECE_VALUES: Record<string, number> = {
    p: 10,
    n: 30,
    b: 30,
    r: 50,
    q: 90,
    k: 900,
};

// Tablas de peso posicional (Simplificadas)
// Un peón vale más si avanza, un caballo vale más en el centro
const PAWN_TABLE = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_TABLE = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
];

// Evalúa el tablero desde la perspectiva de las Blancas
function evaluateBoard(game: Chess): number {
    let totalEvaluation = 0;
    const board = game.board();

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = board[i][j];
            if (piece) {
                const value = PIECE_VALUES[piece.type];
                // Posición (invertimos tabla para negras)
                let positionValue = 0;
                if (piece.type === 'p') positionValue = piece.color === 'w' ? PAWN_TABLE[i][j] : PAWN_TABLE[7-i][j];
                if (piece.type === 'n') positionValue = piece.color === 'w' ? KNIGHT_TABLE[i][j] : KNIGHT_TABLE[7-i][j];

                // Sumamos si es blanca, restamos si es negra
                if (piece.color === 'w') {
                    totalEvaluation += (value * 10 + positionValue);
                } else {
                    totalEvaluation -= (value * 10 + positionValue);
                }
            }
        }
    }
    return totalEvaluation;
}

// Algoritmo Minimax con Poda Alpha-Beta
// depth: cuántos movimientos mira hacia adelante (3 es bueno para JS, 4 es lento)
export function getBestMove(game: Chess, depth: number = 3): string | null {
    const possibleMoves = game.moves();
    if (possibleMoves.length === 0) return null;

    let bestMove = null;
    let bestValue = -Infinity; // Las negras quieren minimizar, pero aquí maximizamos para la IA (asumimos que IA juega "su turno")

    // Nota: Si la IA juega con negras, debemos minimizar.
    // Para simplificar, usamos un multiplicador según el turno.
    const isMaximizingPlayer = game.turn() === 'w';

    // Si es el turno de las negras (IA), queremos encontrar el valor MÍNIMO posible
    // Si es blancas, el MÁXIMO.
    // Vamos a usar una función minimax genérica.

    const result = minimax(game, depth, -Infinity, Infinity, game.turn() === 'w');
    return result.bestMove;
}

function minimax(game: Chess, depth: number, alpha: number, beta: number, isMaximizing: boolean): { bestMove: string | null, value: number } {
    if (depth === 0 || game.game_over()) {
        return { bestMove: null, value: evaluateBoard(game) };
    }

    const possibleMoves = game.moves();
    let bestMove = possibleMoves[0];

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (const move of possibleMoves) {
            game.move(move);
            const evalValue = minimax(game, depth - 1, alpha, beta, false).value;
            game.undo(); // Backtracking

            if (evalValue > maxEval) {
                maxEval = evalValue;
                bestMove = move;
            }
            alpha = Math.max(alpha, evalValue);
            if (beta <= alpha) break; // Poda Alpha
        }
        return { bestMove, value: maxEval };
    } else {
        let minEval = Infinity;
        for (const move of possibleMoves) {
            game.move(move);
            const evalValue = minimax(game, depth - 1, alpha, beta, true).value;
            game.undo();

            if (evalValue < minEval) {
                minEval = evalValue;
                bestMove = move;
            }
            beta = Math.min(beta, evalValue);
            if (beta <= alpha) break; // Poda Beta
        }
        return { bestMove, value: minEval };
    }
}