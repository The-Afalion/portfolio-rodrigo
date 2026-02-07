import { supabaseAdmin } from '@/lib/db';
import { Chess } from 'chess.js';
import { NextResponse } from 'next/server';

// v1.2 - Adding null checks for robustness
const AI_NAMES = [
  "ByteBard", "HexaMind", "CodeCaster", "NexoZero", "QuantumLeap", 
  "SiliconSoul", "LogicLoom", "KernelKing", "VoidRunner", "FluxAI", 
  "CygnusX1", "ApexBot"
];

// --- FUNCIONES DE SIMULACIÓN ---

function getBestMove(game: Chess) {
  const legalMoves = game.moves({ verbose: true });
  let bestMove = legalMoves[0];
  let bestScore = -Infinity;

  for (const move of legalMoves) {
    let score = 0;
    if (move.flags.includes('c')) score += 10;
    if (move.flags.includes('p')) score += 100;
    
    const gameCopy = new Chess(game.fen());
    gameCopy.move(move.san);
    if (gameCopy.isCheck()) score += 25;
    if (gameCopy.isCheckmate()) score += 1000;
    
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
}

function simulateGame(startTime: Date): { winner: 'w' | 'b', moves: { move: string, timestamp: string }[] } {
  const game = new Chess();
  const moves: { move: string, timestamp: string }[] = [];
  let currentTime = startTime.getTime();

  while (!game.isGameOver()) {
    const move = getBestMove(game);
    game.move(move.san);
    
    const timeIncrement = (5 + Math.random() * 10) * 1000; // 5-15 segundos
    currentTime += timeIncrement;
    
    moves.push({ move: move.san, timestamp: new Date(currentTime).toISOString() });
  }
  
  const winner = game.turn() === 'b' ? 'w' : 'b';
  return { winner, moves };
}

// --- LÓGICA PRINCIPAL DEL CRON JOB ---

async function simulateRound(matches: any[]) {
  const startTime = new Date();
  for (const match of matches) {
    if (!match || !match.player1Id || !match.player2Id) continue; // Comprobación de seguridad

    const { winner, moves } = simulateGame(startTime);
    const winnerId = winner === 'w' ? match.player1Id : match.player2Id;

    await supabaseAdmin.from('AITournamentMatch')
      .update({
        status: 'ACTIVE',
        winnerId: winnerId,
        moves: moves,
      })
      .eq('id', match.id);
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // 1. Crear las IAs si no existen
    const { count: playerCount } = await supabaseAdmin.from('ChessPlayer').select('*', { count: 'exact', head: true }).eq('isAI', true);
    if (playerCount === 0) {
      const newAIs = AI_NAMES.map(name => ({ email: `${name.toLowerCase()}@system.io`, name: name, isAI: true }));
      await supabaseAdmin.from('ChessPlayer').insert(newAIs);
    }

    // 2. Buscar un torneo activo
    let { data: activeTournament } = await supabaseAdmin
      .from('AITournament')
      .select('id, matches:AITournamentMatch(*)')
      .eq('status', 'ACTIVE')
      .single();

    // 3. Si no hay torneo activo, empezar uno nuevo y simular la primera ronda
    if (!activeTournament) {
      const { data: players } = await supabaseAdmin.from('ChessPlayer').select('id').eq('isAI', true);
      if (!players || players.length < 8) throw new Error("No hay suficientes IAs en la base de datos para empezar un torneo.");

      const shuffled = players.sort(() => 0.5 - Math.random());
      const participants = shuffled.slice(0, 8);

      const { data: newTournament, error: createTourneyError } = await supabaseAdmin.from('AITournament').insert({ status: 'ACTIVE' }).select().single();
      if (createTourneyError || !newTournament) throw new Error("No se pudo crear el nuevo torneo.");
      
      const firstRoundMatches = [];
      for (let i = 0; i < 8; i += 2) {
        firstRoundMatches.push({
          tournamentId: newTournament.id,
          round: 1,
          player1Id: participants[i].id,
          player2Id: participants[i + 1].id,
        });
      }
      const { data: insertedMatches, error: insertMatchesError } = await supabaseAdmin.from('AITournamentMatch').insert(firstRoundMatches).select();
      if (insertMatchesError || !insertedMatches) throw new Error("No se pudieron crear las partidas de la primera ronda.");
      
      await simulateRound(insertedMatches);
      return NextResponse.json({ message: `Nuevo torneo ${newTournament.id} iniciado y primera ronda simulada.` });
    }

    // 4. Si hay torneo, comprobar si la ronda actual ha terminado
    const activeMatches = activeTournament.matches.filter(m => m.status === 'ACTIVE');
    if (activeMatches.length > 0) {
      return NextResponse.json({ message: `La ronda actual todavía está en curso.` });
    }

    // 5. Si no hay partidas activas, significa que la ronda ha terminado. Avanzamos.
    const finishedMatches = activeTournament.matches;
    const lastRound = Math.max(...finishedMatches.map(m => m.round));
    const winnersOfLastRound = finishedMatches.filter(m => m.round === lastRound).map(m => m.winnerId).filter(id => id != null); // Filtrar nulos

    if (winnersOfLastRound.length === 0 && lastRound > 0) {
      throw new Error(`No se encontraron ganadores para la ronda ${lastRound}.`);
    }

    await supabaseAdmin.from('AITournamentMatch').update({ status: 'FINISHED' }).in('id', finishedMatches.map(m => m.id));

    if (winnersOfLastRound.length === 1) {
      await supabaseAdmin.from('AITournament').update({ status: 'FINISHED', winnerId: winnersOfLastRound[0], endedAt: new Date().toISOString() }).eq('id', activeTournament.id);
      await supabaseAdmin.rpc('increment_wins', { player_id: winnersOfLastRound[0] });
      return NextResponse.json({ message: `Torneo ${activeTournament.id} finalizado. Ganador: ${winnersOfLastRound[0]}` });
    }

    const nextRoundMatches = [];
    for (let i = 0; i < winnersOfLastRound.length; i += 2) {
      if (!winnersOfLastRound[i] || !winnersOfLastRound[i+1]) continue; // Comprobación de seguridad
      nextRoundMatches.push({
        tournamentId: activeTournament.id,
        round: lastRound + 1,
        player1Id: winnersOfLastRound[i],
        player2Id: winnersOfLastRound[i + 1],
      });
    }
    const { data: insertedMatches, error: insertMatchesError } = await supabaseAdmin.from('AITournamentMatch').insert(nextRoundMatches).select();
    if (insertMatchesError || !insertedMatches) throw new Error(`No se pudieron crear las partidas de la ronda ${lastRound + 1}.`);

    await simulateRound(insertedMatches);
    return NextResponse.json({ message: `Avanzando a la ronda ${lastRound + 1} y simulándola.` });

  } catch (error: any) {
    console.error("Error en el cron job del torneo:", error.message);
    return new Response(error.message, { status: 500 });
  }
}
