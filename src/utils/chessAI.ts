import { Chess } from "chess.js";

type Difficulty = "Fácil" | "Medio" | "Difícil";

const PIECE_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 90 };

export function evaluateBoard(game: Chess): number {
    let totalEvaluation = 0;
    const board = game.board();
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = board[i][j];
            if (piece) {
                const value = PIECE_VALUES[piece.type];
                totalEvaluation += (piece.color === 'w' ? value : -value);
            }
        }
    }
    return totalEvaluation;
}

function minimax(game: Chess, depth: number, alpha: number, beta: number, isMaximizing: boolean): { bestMove: string | null, value: number } {
    if (depth === 0 || game.game_over()) {
        return { bestMove: null, value: evaluateBoard(game) };
    }

    const possibleMoves = game.moves();
    if (possibleMoves.length === 0) {
        return { bestMove: null, value: evaluateBoard(game) };
    }
    
    let bestMove = possibleMoves[0];

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (const move of possibleMoves) {
            game.move(move);
            const evalValue = minimax(game, depth - 1, alpha, beta, false).value;
            game.undo();
            if (evalValue > maxEval) {
                maxEval = evalValue;
                bestMove = move;
            }
            alpha = Math.max(alpha, evalValue);
            if (beta <= alpha) break;
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
            if (beta <= alpha) break;
        }
        return { bestMove, value: minEval };
    }
}

export function getAIMove(game: Chess, difficulty: Difficulty): string | null {
    const possibleMoves = game.moves();
    if (possibleMoves.length === 0) return null;

    const isMaximizing = game.turn() === 'w';

    switch (difficulty) {
        case "Fácil":
            const randomIndex = Math.floor(Math.random() * possibleMoves.length);
            return possibleMoves[randomIndex];
        
        case "Medio":
            const resultMed = minimax(game, 2, -Infinity, Infinity, isMaximizing);
            return resultMed.bestMove;

        case "Difícil":
            const resultHard = minimax(game, 3, -Infinity, Infinity, isMaximizing);
            return resultHard.bestMove;
            
        default:
            return possibleMoves[0];
    }
}
