"use server";

import { supabaseAdmin } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { Chess } from 'chess.js';

// --- Lógica de Simulación (sin cambios) ---
const AI_PERSONALITIES: { [name: string]: string } = {
  "ByteBard": "PAWN_MASTER", "HexaMind": "AGGRESSIVE", "CodeCaster": "ADAPTIVE", 
  "NexoZero": "BALANCED", "QuantumLeap": "CHAOTIC", "SiliconSoul": "DEFENSIVE", 
  "LogicLoom": "FORTRESS", "KernelKing": "OPENING_BOOK", "VoidRunner": "BERSERKER", 
  "FluxAI": "REACTIONARY", "CygnusX1": "OPPORTUNIST", "ApexBot": "PRESSURER"
};
const OPENING_BOOK: any = { "e4": { "e5": { "Nf3": { "Nc6": {} } } }, "d4": { "d5": { "c4": { "e6": {} } } } };
function getBestMove(game: Chess, personality: string, opponentPersonality: string, moveNumber: number) {
  if (personality === 'OPENING_BOOK' && moveNumber <= 4) {
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
  if (personality === 'CHAOTIC' && Math.random() < 0.3) {
    const legalMoves = game.moves({ verbose: true });
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }
  const legalMoves = game.moves({ verbose: true });
  let bestMove = legalMoves[0], bestScore = -Infinity;
  let currentPersonality = personality;
  if (personality === 'ADAPTIVE') {
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
    const gameCopy = new Chess(game.fen());
    gameCopy.move(move.san);
    if (gameCopy.isCheck()) score += 25;
    if (gameCopy.isCheckmate()) score += 1000;
    if (score > bestScore) { bestScore = score; bestMove = move; }
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
    const move = getBestMove(game, currentPlayer.personality, opponentPlayer.personality, moves.length);
    game.move(move.san);
    const timeIncrement = (5 + Math.random() * 10) * 1000;
    currentTime += timeIncrement;
    moves.push({ move: move.san, timestamp: new Date(currentTime).toISOString() });
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

// --- ACCIÓN DEL SERVIDOR (LÓGICA REVISADA) ---

export async function startNewTournament() {
  try {
    // Finalizar cualquier torneo activo
    await supabaseAdmin.from('AITournament').update({ status: 'FINISHED', endedAt: new Date().toISOString() }).eq('status', 'ACTIVE');

    // --- LÓGICA DE CREACIÓN REVISADA ---
    // Paso 1: Insertar el nuevo torneo sin pedir que lo devuelva.
    const { error: createTourneyError } = await supabaseAdmin
      .from('AITournament')
      .insert({ status: 'ACTIVE' });

    if (createTourneyError) {
      throw new Error(`Error directo en la inserción del torneo: ${createTourneyError.message}`);
    }

    // Paso 2: Si la inserción fue exitosa, buscar el torneo que acabamos de crear.
    const { data: newTournament, error: fetchTourneyError } = await supabaseAdmin
      .from('AITournament')
      .select('id')
      .eq('status', 'ACTIVE')
      .order('createdAt', { ascending: false })
      .limit(1)
      .single();

    if (fetchTourneyError || !newTournament) {
      throw new Error("Se insertó el torneo, pero no se pudo recuperar inmediatamente después.");
    }
    // --- FIN DE LA LÓGICA REVISADA ---

    const { data: players } = await supabaseAdmin.from('ChessPlayer').select('id, personality').eq('isAI', true);
    if (!players || players.length < 8) throw new Error("No hay suficientes IAs en la base de datos.");

    const shuffled = players.sort(() => 0.5 - Math.random());
    const participants = shuffled.slice(0, 8);
    
    const firstRoundMatches = [];
    for (let i = 0; i < 8; i += 2) {
      firstRoundMatches.push({ tournamentId: newTournament.id, round: 1, player1Id: participants[i].id, player2Id: participants[i + 1].id });
    }
    const { data: insertedMatches } = await supabaseAdmin.from('AITournamentMatch').insert(firstRoundMatches).select();
    if (!insertedMatches) throw new Error("No se pudieron crear las partidas.");
    
    await simulateRound(insertedMatches, players);
    
    revalidatePath('/chess/ai-battle');
    return { success: `Nuevo torneo ${newTournament.id} iniciado.` };

  } catch (error: any) {
    console.error("Error al forzar el inicio del torneo:", error.message);
    return { error: error.message };
  }
}
