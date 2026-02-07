import { supabaseAdmin } from '@/lib/db';
import { Chess } from 'chess.js';
import { NextResponse } from 'next/server';

// Lista de jugadores "bot" que generarán los votos
const BOT_EMAILS = [
  'bot-kasparov@system.io',
  'bot-carlsen@system.io',
  'bot-fischer@system.io',
  'bot-alpha-zero@system.io',
];

// Función simple para evaluar un movimiento
function evaluateMove(move: any, game: Chess) {
  let score = 0;
  if (move.flags.includes('c')) score += 10; // Captura
  if (move.flags.includes('p')) score += 100; // Promoción
  
  // Simular el movimiento para ver si da jaque
  game.move(move.san);
  if (game.isCheck()) score += 25;
  if (game.isCheckmate()) score += 1000;
  game.undo(); // Revertir el movimiento

  return score;
}

export async function GET(request: Request) {
  // 1. Seguridad: Solo permitir que Vercel Cron o un usuario con un token secreto ejecute esto
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // 2. Obtener la partida actual
    const { data: gameData, error: gameError } = await supabaseAdmin
      .from('CommunityChessGame')
      .select('fen')
      .eq('id', 'main_game')
      .single();

    if (gameError) throw new Error(`Error al obtener la partida: ${gameError.message}`);

    const game = new Chess(gameData.fen);
    const turn = game.turn();

    // 3. Obtener los jugadores bot o crearlos si no existen
    let { data: bots } = await supabaseAdmin.from('ChessPlayer').select('id, email').in('email', BOT_EMAILS);
    if (!bots || bots.length < BOT_EMAILS.length) {
      const newBots = BOT_EMAILS.filter(email => !bots?.some(b => b.email === email))
        .map(email => ({
          email,
          name: email.split('@')[0],
          isAI: true,
          assignedSide: Math.random() > 0.5 ? 'w' : 'b' // Asignación aleatoria inicial
        }));
      
      await supabaseAdmin.from('ChessPlayer').insert(newBots);
      bots = (await supabaseAdmin.from('ChessPlayer').select('id, email').in('email', BOT_EMAILS)).data;
    }

    // Asegurarse de que los bots tengan el bando correcto para el turno actual
    for (const bot of bots!) {
      await supabaseAdmin.from('ChessPlayer').update({ assignedSide: turn }).eq('id', bot.id);
    }

    // 4. Analizar los mejores movimientos
    const legalMoves = game.moves({ verbose: true });
    const evaluatedMoves = legalMoves.map(move => ({
      san: move.san,
      score: evaluateMove(move, new Chess(game.fen)),
    })).sort((a, b) => b.score - a.score);

    // 5. Distribuir los votos
    const VOTES_TO_ADD = 17; // Aprox. 50 votos en 3 días
    const votes = [];
    let remainingVotes = VOTES_TO_ADD;

    // Asignar votos a los 4 mejores movimientos
    const bestMoves = evaluatedMoves.slice(0, 4);
    const voteDistribution = [0.4, 0.3, 0.2, 0.1]; // 40%, 30%, 20%, 10%

    for (let i = 0; i < bestMoves.length; i++) {
      const move = bestMoves[i];
      const votesForThisMove = Math.round(VOTES_TO_ADD * voteDistribution[i]);
      for (let j = 0; j < votesForThisMove && remainingVotes > 0; j++) {
        votes.push({ move: move.san, botIndex: j % bots!.length });
        remainingVotes--;
      }
    }

    // Asignar votos restantes a otros movimientos aleatorios
    while (remainingVotes > 0) {
      const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      votes.push({ move: randomMove.san, botIndex: Math.floor(Math.random() * bots!.length) });
      remainingVotes--;
    }

    // 6. Crear los registros de votos en la base de datos
    const voteRecords = votes.map(vote => ({
      move: vote.move,
      playerId: bots![vote.botIndex].id,
      gameId: 'main_game',
      isFake: true,
    }));

    const { error: insertError } = await supabaseAdmin.from('CommunityVote').insert(voteRecords);
    if (insertError) throw new Error(`Error al insertar votos falsos: ${insertError.message}`);

    return NextResponse.json({ ok: true, message: `${VOTES_TO_ADD} votos falsos añadidos.` });

  } catch (error: any) {
    console.error("Error en el cron job de votos falsos:", error.message);
    return new Response(error.message, { status: 500 });
  }
}
