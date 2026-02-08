import { supabaseAdmin } from '@/lib/db';
import { Chess } from 'chess.js';
import { NextResponse } from 'next/server';

// v5.4 - Defensive coding for AI personality logic

// --- CONFIGURACIÓN DEL MOTOR ---
const SEARCH_DEPTH = 2;
const PIECE_VALUES: { [key: string]: number } = { p: 10, n: 30, b: 30, r: 50, q: 90, k: 900 };
const AI_PERSONALITIES: { [name: string]: any } = {
  "ByteBard": { type: "PAWN_MASTER", aggression: 1.0 }, "HexaMind": { type: "AGGRESSIVE", aggression: 1.5 }, "CodeCaster": { type: "ADAPTIVE", aggression: 1.0 }, 
  "NexoZero": { type: "BALANCED", aggression: 1.0 }, "QuantumLeap": { type: "CHAOTIC", aggression: 1.2 }, "SiliconSoul": { type: "DEFENSIVE", aggression: 0.8 }, 
  "LogicLoom": { type: "FORTRESS", aggression: 0.5 }, "KernelKing": { type: "OPENING_BOOK", aggression: 1.0 }, "VoidRunner": { type: "BERSERKER", aggression: 2.0 }, 
  "FluxAI": { type: "REACTIONARY", aggression: 1.1 }, "CygnusX1": { type: "OPPORTUNIST", aggression: 1.3 }, "ApexBot": { type: "PRESSURER", aggression: 1.2 }
};
const OPENING_BOOK: any = { "e4": { "e5": { "Nf3": { "Nc6": {} } } }, "d4": { "d5": { "c4": { "e6": {} } } } };

// --- MOTOR MINIMAX ---

function evaluateBoard(game: Chess) {
  let score = 0;
  game.board().forEach(row => {
    row.forEach(piece => {
      if (piece) score += PIECE_VALUES[piece.type] * (piece.color === 'w' ? 1 : -1);
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
  if (!personality) personality = { type: 'BALANCED', aggression: 1.0 };

  if (personality.type === 'OPENING_BOOK' && moveNumber <= 4) { /* ... */ }
  if (personality.type === 'CHAOTIC' && Math.random() < 0.3) { /* ... */ }

  let bestMove = null;
  let bestValue = -Infinity;
  const isMaximizing = game.turn() === 'w';

  let currentPersonalityType = personality.type;
  if (personality.type === 'ADAPTIVE' && opponentPersonality) {
    const opponentType = opponentPersonality.type;
    if (opponentType === 'AGGRESSIVE' || opponentType === 'BERSERKER') currentPersonalityType = 'DEFENSIVE';
    else if (opponentType === 'DEFENSIVE' || opponentType === 'FORTRESS') currentPersonalityType = 'AGGRESSIVE';
  }

  for (const move of game.moves()) {
    game.move(move);
    const boardValue = minimax(game, SEARCH_DEPTH - 1, -Infinity, Infinity, !isMaximizing);
    game.undo();
    
    let finalValue = boardValue;
    const aggression = personality.aggression || 1.0;
    if (move.flags.includes('c')) finalValue *= aggression;

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
    if (!currentPlayer?.name || !opponentPlayer?.name) continue;
    
    const move = getBestMove(game, AI_PERSONALITIES[currentPlayer.name], AI_PERSONALITIES[opponentPlayer.name], moves.length);
    if (!move) break;
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

// --- LÓGICA PRINCIPAL DEL CRON JOB ---

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    let { data: activeTournament } = await supabaseAdmin.from('AITournament').select('id, matches:AITournamentMatch(*)').eq('status', 'ACTIVE').single();

    if (!activeTournament) {
      return NextResponse.json({ message: 'No active tournament. Waiting for manual start.' });
    }

    const pendingMatches = activeTournament.matches.filter(m => m.status === 'PENDING');
    if (pendingMatches.length > 0) {
      const { data: players } = await supabaseAdmin.from('ChessPlayer').select('id, name').eq('isAI', true);
      if (!players) throw new Error("No se pudieron obtener los datos de las IAs.");
      await simulateRound(pendingMatches, players);
      return NextResponse.json({ message: `Simulada la ronda con ${pendingMatches.length} partidas.` });
    }

    const activeMatches = activeTournament.matches.filter(m => m.status === 'ACTIVE');
    if (activeMatches.length > 0) {
      return NextResponse.json({ message: `Ronda en curso.` });
    }

    const finishedMatches = activeTournament.matches;
    const lastRound = Math.max(...finishedMatches.map(m => m.round));
    const winnersOfLastRound = finishedMatches.filter(m => m.round === lastRound).map(m => m.winnerId).filter(id => id != null);

    if (winnersOfLastRound.length === 0 && lastRound > 0) throw new Error(`No se encontraron ganadores para la ronda ${lastRound}.`);

    await supabaseAdmin.from('AITournamentMatch').update({ status: 'FINISHED' }).in('id', finishedMatches.map(m => m.id));

    if (winnersOfLastRound.length === 1) {
      await supabaseAdmin.from('AITournament').update({ status: 'FINISHED', winnerId: winnersOfLastRound[0], endedAt: new Date().toISOString() }).eq('id', activeTournament.id);
      await supabaseAdmin.rpc('increment_wins', { player_id: winnersOfLastRound[0] });
      return NextResponse.json({ message: `Torneo finalizado. Ganador: ${winnersOfLastRound[0]}` });
    }

    const { data: players } = await supabaseAdmin.from('ChessPlayer').select('id, name').eq('isAI', true);
    if (!players) throw new Error("No se pudieron obtener los datos de las IAs.");

    const nextRoundMatches = [];
    for (let i = 0; i < winnersOfLastRound.length; i += 2) {
      if (!winnersOfLastRound[i] || !winnersOfLastRound[i+1]) continue;
      nextRoundMatches.push({ tournamentId: activeTournament.id, round: lastRound + 1, player1Id: winnersOfLastRound[i], player2Id: winnersOfLastRound[i + 1] });
    }
    const { data: insertedMatches } = await supabaseAdmin.from('AITournamentMatch').insert(nextRoundMatches).select();
    if (!insertedMatches) throw new Error(`No se pudieron crear las partidas de la ronda ${lastRound + 1}.`);

    return NextResponse.json({ message: `Preparada la ronda ${lastRound + 1}.` });

  } catch (error: any) {
    console.error("Error en el cron job del torneo:", error.message);
    return new Response(error.message, { status: 500 });
  }
}
