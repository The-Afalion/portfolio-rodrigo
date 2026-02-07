import { supabaseAdmin } from '@/lib/db';
import { Chess } from 'chess.js';
import { NextResponse } from 'next/server';

// v4.0 - Final Version: Tournament logic only. Assumes AIs exist.

const OPENING_BOOK: any = { "e4": { "e5": { "Nf3": { "Nc6": {} } } }, "d4": { "d5": { "c4": { "e6": {} } } } };

// --- FUNCIONES DE SIMULACIÓN CON PERSONALIDAD ---

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

// --- LÓGICA PRINCIPAL DEL CRON JOB ---

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // 1. Buscar un torneo activo
    let { data: activeTournament } = await supabaseAdmin.from('AITournament').select('id, matches:AITournamentMatch(*)').eq('status', 'ACTIVE').single();

    // 2. Si no hay torneo activo, empezar uno nuevo
    if (!activeTournament) {
      const { data: players } = await supabaseAdmin.from('ChessPlayer').select('id, personality').eq('isAI', true);
      if (!players || players.length < 8) throw new Error("No hay suficientes IAs en la base de datos. Ejecuta el script de siembra (seed).");

      const shuffled = players.sort(() => 0.5 - Math.random());
      const participants = shuffled.slice(0, 8);

      const { data: newTournament } = await supabaseAdmin.from('AITournament').insert({ status: 'ACTIVE' }).select().single();
      if (!newTournament) throw new Error("No se pudo crear el torneo.");
      
      const firstRoundMatches = [];
      for (let i = 0; i < 8; i += 2) {
        firstRoundMatches.push({ tournamentId: newTournament.id, round: 1, player1Id: participants[i].id, player2Id: participants[i + 1].id });
      }
      const { data: insertedMatches } = await supabaseAdmin.from('AITournamentMatch').insert(firstRoundMatches).select();
      if (!insertedMatches) throw new Error("No se pudieron crear las partidas.");
      
      await simulateRound(insertedMatches, players);
      return NextResponse.json({ message: `Nuevo torneo ${newTournament.id} iniciado.` });
    }

    // 3. Si hay torneo, comprobar si la ronda actual ha terminado
    const activeMatches = activeTournament.matches.filter(m => m.status === 'ACTIVE');
    if (activeMatches.length > 0) {
      return NextResponse.json({ message: `Ronda en curso.` });
    }

    // 4. Si no hay partidas activas, avanzar
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

    const { data: players } = await supabaseAdmin.from('ChessPlayer').select('id, personality').eq('isAI', true);
    if (!players) throw new Error("No se pudieron obtener los datos de las IAs.");

    const nextRoundMatches = [];
    for (let i = 0; i < winnersOfLastRound.length; i += 2) {
      if (!winnersOfLastRound[i] || !winnersOfLastRound[i+1]) continue;
      nextRoundMatches.push({ tournamentId: activeTournament.id, round: lastRound + 1, player1Id: winnersOfLastRound[i], player2Id: winnersOfLastRound[i + 1] });
    }
    const { data: insertedMatches } = await supabaseAdmin.from('AITournamentMatch').insert(nextRoundMatches).select();
    if (!insertedMatches) throw new Error(`No se pudieron crear las partidas de la ronda ${lastRound + 1}.`);

    await simulateRound(insertedMatches, players);
    return NextResponse.json({ message: `Avanzando a la ronda ${lastRound + 1}.` });

  } catch (error: any) {
    console.error("Error en el cron job del torneo:", error.message);
    return new Response(error.message, { status: 500 });
  }
}
