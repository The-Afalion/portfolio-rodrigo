"use server";

import { supabaseAdmin } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { Chess } from 'chess.js';

// --- Lógica de Simulación (sin cambios) ---
const AI_PERSONALITIES: { [name: string]: any } = {
  "ByteBard": "PAWN_MASTER", "HexaMind": "AGGRESSIVE", "CodeCaster": "ADAPTIVE", 
  "NexoZero": "BALANCED", "QuantumLeap": "CHAOTIC", "SiliconSoul": "DEFENSIVE", 
  "LogicLoom": "FORTRESS", "KernelKing": "OPENING_BOOK", "VoidRunner": "BERSERKER", 
  "FluxAI": "REACTIONARY", "CygnusX1": "OPPORTUNIST", "ApexBot": "PRESSURER"
};
const OPENING_BOOK: any = { "e4": { "e5": { "Nf3": { "Nc6": {} } } }, "d4": { "d5": { "c4": { "e6": {} } } } };
function getBestMove(game: Chess, personality: any, opponentPersonality: any, moveNumber: number) {
  if (personality.type === 'OPENING_BOOK' && moveNumber <= 4) {
    let bookMoves = OPENING_BOOK;
    for (const move of game.history()) {
      if (bookMoves[move]) bookMoves = bookMoves[move];
      else { bookMoves = null; break; }
    }
    if (bookMoves && Object.keys(bookMoves).length > 0) {
      const moveObject = game.moves({ verbose: true }).find(m => m.san === Object.keys(bookMoves)[0]);
      if (moveObject) return moveObject;
    }
  }
  if (personality.type === 'CHAOTIC' && Math.random() < 0.3) {
    const legalMoves = game.moves({ verbose: true });
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }
  const legalMoves = game.moves({ verbose: true });
  let bestMove = legalMoves[0], bestScore = -Infinity;
  let currentPersonality = personality;
  if (personality.type === 'ADAPTIVE') {
    if (opponentPersonality.includes('AGGRESSIVE') || opponentPersonality.includes('BERSERKER')) currentPersonality = 'DEFENSIVE';
    else if (opponentPersonality.includes('DEFENSIVE') || opponentPersonality.includes('FORTRESS')) currentPersonality = 'AGGRESSIVE';
  }
  for (const move of legalMoves) {
    let score = 0;
    if (move.flags.includes('c')) score += 10;
    if (move.flags.includes('p')) score += 100;
    switch (currentPersonality) {
      case 'BERSERKER': if (move.flags.includes('c')) score *= 2.0; break;
      case 'AGGRESSIVE': if (move.flags.includes('c')) score *= 1.5; break;
      case 'PRESSURER': if (['e4', 'd4', 'e5', 'd5'].includes(move.to)) score += 5; break;
      case 'DEFENSIVE': if (move.san === 'O-O' || move.san === 'O-O-O') score += 15; break;
      case 'FORTRESS': if (move.san === 'O-O' || move.san === 'O-O-O') score += 25; break;
      case 'PAWN_MASTER': if (move.piece === 'p') score += 8; break;
    }
    const gameCopy = new Chess();
    gameCopy.loadPgn(game.pgn());
    gameCopy.move(move.san);
    if (gameCopy.isCheck()) score += 25;
    if (gameCopy.isCheckmate()) score += 1000;
    if (score > bestValue) { bestScore = score; bestMove = move; }
  }
  return bestMove;
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

// --- ACCIÓN DEL SERVIDOR CON LOGS ---

export async function startNewTournament() {
  console.log("1. Iniciando acción 'startNewTournament'.");
  try {
    console.log("2. Finalizando torneos antiguos...");
    const { error: updateError } = await supabaseAdmin.from('AITournament').update({ status: 'FINISHED', endedAt: new Date().toISOString() }).eq('status', 'ACTIVE');
    if (updateError) console.error("Error al finalizar torneos:", updateError.message);
    console.log("3. Torneos antiguos finalizados.");

    console.log("4. Obteniendo jugadores IA...");
    const { data: players } = await supabaseAdmin.from('ChessPlayer').select('id, name').eq('isAI', true);
    if (!players || players.length < 8) throw new Error("No hay suficientes IAs en la base de datos.");
    console.log(`5. Encontrados ${players.length} jugadores IA.`);

    const shuffled = players.sort(() => 0.5 - Math.random());
    const participants = shuffled.slice(0, 8);

    console.log("6. Creando nuevo torneo...");
    const { data: newTournament, error: createError } = await supabaseAdmin.from('AITournament').insert({ status: 'ACTIVE' }).select('id').single();
    if (createError || !newTournament) throw new Error(`No se pudo crear el torneo: ${createError?.message || 'newTournament es null'}`);
    console.log(`7. Torneo ${newTournament.id} creado.`);
    
    const firstRoundMatches = [];
    for (let i = 0; i < 8; i += 2) {
      firstRoundMatches.push({ tournamentId: newTournament.id, round: 1, player1Id: participants[i].id, player2Id: participants[i + 1].id });
    }
    
    console.log("8. Creando partidas de la primera ronda...");
    const { data: insertedMatches, error: insertError } = await supabaseAdmin.from('AITournamentMatch').insert(firstRoundMatches).select();
    if (insertError || !insertedMatches) throw new Error(`No se pudieron crear las partidas: ${insertError?.message || 'insertedMatches es null'}`);
    console.log("9. Partidas creadas.");

    console.log("10. Simulando ronda...");
    await simulateRound(insertedMatches, players);
    console.log("11. Ronda simulada.");
    
    revalidatePath('/chess/ai-battle');
    console.log("12. Acción completada con éxito.");
    return { success: `Nuevo torneo ${newTournament.id} iniciado.` };

  } catch (error: any) {
    console.error("Error final en 'startNewTournament':", error.message);
    return { error: error.message };
  }
}
