"use server";

import { supabaseAdmin } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { Chess } from 'chess.js';

// v2.4 - Re-enabling optimized simulation

// --- CONFIGURACIÓN DEL MOTOR OPTIMIZADA ---
const SEARCH_DEPTH = 2;

const PIECE_VALUES: { [key: string]: number } = { p: 10, n: 30, b: 30, r: 50, q: 90, k: 900 };

const AI_PERSONALITIES: { [name: string]: any } = {
  "ByteBard": { type: "PAWN_MASTER", aggression: 1.0 }, "HexaMind": { type: "AGGRESSIVE", aggression: 1.5 }, "CodeCaster": { type: "ADAPTIVE", aggression: 1.0 }, 
  "NexoZero": { type: "BALANCED", aggression: 1.0 }, "QuantumLeap": { type: "CHAOTIC", aggression: 1.2 }, "SiliconSoul": { type: "DEFENSIVE", aggression: 0.8 }, 
  "LogicLoom": { type: "FORTRESS", aggression: 0.5 }, "KernelKing": { type: "OPENING_BOOK", aggression: 1.0 }, "VoidRunner": { type: "BERSERKER", aggression: 2.0 }, 
  "FluxAI": { type: "REACTIONARY", aggression: 1.1 }, "CygnusX1": { type: "OPPORTUNIST", aggression: 1.3 }, "ApexBot": { type: "PRESSURER", aggression: 1.2 }
};
const OPENING_BOOK: any = { "e4": { "e5": { "Nf3": { "Nc6": {} } } }, "d4": { "d5": { "c4": { "e6": {} } } } };

// --- MOTOR MINIMAX OPTIMIZADO ---

function evaluateBoard(game: Chess) {
  let score = 0;
  game.board().forEach(row => {
    row.forEach(piece => {
      if (!piece) return;
      score += PIECE_VALUES[piece.type] * (piece.color === 'w' ? 1 : -1);
    });
  });
  return score;
}

function minimax(game: Chess, depth: number, alpha: number, beta: number, maximizingPlayer: boolean) {
  if (depth === 0 || game.isGameOver()) return evaluateBoard(game);
  const moves = game.moves();
  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const evaluation = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const evaluation = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function getBestMove(game: Chess, personality: any, opponentPersonality: any, moveNumber: number) {
  if (personality.type === 'OPENING_BOOK' && moveNumber <= 4) { /* ... */ }
  if (personality.type === 'CHAOTIC' && Math.random() < 0.3) { /* ... */ }

  let bestMove = null;
  let bestValue = -Infinity;
  const isMaximizing = game.turn() === 'w';

  for (const move of game.moves()) {
    game.move(move);
    const boardValue = minimax(game, SEARCH_DEPTH - 1, -Infinity, Infinity, !isMaximizing);
    game.undo();
    
    let finalValue = boardValue;
    if (move.flags.includes('c')) finalValue *= personality.aggression;

    if (isMaximizing) {
      if (finalValue > bestValue) {
        bestValue = finalValue;
        bestMove = move;
      }
    } else {
      if (bestMove === null || finalValue < bestValue) {
        bestValue = finalValue;
        bestMove = move;
      }
    }
  }
  return bestMove || game.moves()[0];
}

function simulateGame(p1: any, p2: any, startTime: Date) {
  const game = new Chess();
  const moves: { move: string, timestamp: string }[] = [];
  let currentTime = startTime.getTime();
  while (!game.isGameOver()) {
    const turn = game.turn();
    const currentPlayer = turn === 'w' ? p1 : p2;
    const opponentPlayer = turn === 'w' ? p2 : p1;
    const move = getBestMove(game, AI_PERSONALITIES[currentPlayer.name], AI_PERSONALITIES[opponentPlayer.name], moves.length);
    game.move(move);
    const timeIncrement = (5 + Math.random() * 10) * 1000;
    currentTime += timeIncrement;
    moves.push({ move: move, timestamp: new Date(currentTime).toISOString() });
  }
  const winnerTurn = game.turn() === 'b' ? 'w' : 'b';
  return { winner: winnerTurn === 'w' ? 'p1' : 'p2', moves };
}

async function simulateRound(matches: any[], players: any[]) {
  const startTime = new Date();
  for (const match of matches) {
    if (!match || !match.player1Id || !match.player2Id) continue;
    const player1 = players.find(p => p.id === match.player1Id);
    const player2 = players.find(p => p.id === match.player2Id);
    if (!player1 || !player2) continue;
    const { winner, moves } = simulateGame(player1, player2, startTime);
    const winnerId = winner === 'p1' ? match.player1Id : match.player2Id;
    await supabaseAdmin.from('AITournamentMatch').update({ status: 'ACTIVE', winnerId, moves }).eq('id', match.id);
  }
}

// --- ACCIÓN DEL SERVIDOR ---

export async function startNewTournament() {
  try {
    await supabaseAdmin.from('AITournament').update({ status: 'FINISHED', endedAt: new Date().toISOString() }).eq('status', 'ACTIVE');
    const { data: players } = await supabaseAdmin.from('ChessPlayer').select('id, name').eq('isAI', true);
    if (!players || players.length < 8) throw new Error("No hay suficientes IAs en la base de datos.");
    const shuffled = players.sort(() => 0.5 - Math.random());
    const participants = shuffled.slice(0, 8);
    const { data: newTournament } = await supabaseAdmin.from('AITournament').insert({ status: 'ACTIVE' }).select('id').single();
    if (!newTournament) throw new Error("No se pudo crear el torneo.");
    const firstRoundMatches = [];
    for (let i = 0; i < 8; i += 2) {
      firstRoundMatches.push({ tournamentId: newTournament.id, round: 1, player1Id: participants[i].id, player2Id: participants[i + 1].id });
    }
    const { data: insertedMatches } = await supabaseAdmin.from('AITournamentMatch').insert(firstRoundMatches).select();
    if (!insertedMatches) throw new Error("No se pudieron crear las partidas.");
    
    // RE-ACTIVADO: La simulación ahora es más rápida.
    await simulateRound(insertedMatches, players);
    
    revalidatePath('/chess/ai-battle');
    return { success: `Nuevo torneo ${newTournament.id} iniciado.` };

  } catch (error: any) {
    console.error("Error al forzar el inicio del torneo:", error.message);
    return { error: error.message };
  }
}
