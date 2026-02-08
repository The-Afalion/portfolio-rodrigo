import { supabaseAdmin } from '@/lib/db';
import { Chess } from 'chess.js';
import { NextResponse } from 'next/server';

// v2.0 - Real-time Engine triggered by client-side polling

const LICHESS_API_URL = 'https://lichess.org/api/cloud-eval';
const MOVE_INTERVAL_SECONDS = 10; // Mover cada 10 segundos

async function getLichessBestMove(fen: string) {
  const response = await fetch(`${LICHESS_API_URL}?fen=${fen}`, {
    headers: { 'Authorization': `Bearer ${process.env.LICHESS_API_TOKEN}` }
  });
  if (!response.ok) throw new Error(`Lichess API error: ${response.statusText}`);
  const data = await response.json();
  return data.pvs[0]?.moves.split(' ')[0] || null;
}

export async function GET(request: Request) {
  // Ya no necesitamos el secreto del cron, pero lo dejamos por si se usa para debug
  // const authHeader = request.headers.get('authorization');
  // if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET_MOVE}`) {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  try {
    // 1. Buscar una partida activa
    let { data: activeMatch, error: activeMatchError } = await supabaseAdmin
      .from('AITournamentMatch')
      .select('*, tournament:tournamentId(status)')
      .eq('status', 'ACTIVE')
      .limit(1)
      .single();

    // 2. Si no hay partida activa, buscar la siguiente pendiente
    if (!activeMatch) {
      const { data: pendingMatch } = await supabaseAdmin
        .from('AITournamentMatch')
        .select('id')
        .eq('status', 'PENDING')
        .order('round', { ascending: true })
        .order('createdAt', { ascending: true })
        .limit(1)
        .single();

      if (!pendingMatch) {
        return NextResponse.json({ message: 'No hay partidas pendientes.' });
      }

      const { data: updatedMatch } = await supabaseAdmin
        .from('AITournamentMatch')
        .update({ status: 'ACTIVE', lastMoveAt: new Date().toISOString() })
        .eq('id', pendingMatch.id)
        .select('*, tournament:tournamentId(status)')
        .single();
      
      activeMatch = updatedMatch;
    }

    if (!activeMatch) {
      return NextResponse.json({ message: 'No se pudo activar la siguiente partida.' });
    }

    // 3. Comprobar si ha pasado suficiente tiempo desde el último movimiento
    const lastMoveTime = new Date(activeMatch.lastMoveAt || 0).getTime();
    const now = new Date().getTime();
    if (now - lastMoveTime < (MOVE_INTERVAL_SECONDS * 1000)) {
      return NextResponse.json({ message: 'Esperando intervalo entre movimientos.' });
    }

    const game = new Chess();
    if (activeMatch.moves && Array.isArray(activeMatch.moves)) {
      activeMatch.moves.forEach((m: any) => game.move(m.move));
    }

    if (game.isGameOver()) {
      await supabaseAdmin.from('AITournamentMatch').update({ status: 'FINISHED' }).eq('id', activeMatch.id);
      // Aquí podríamos añadir la lógica para avanzar a la siguiente ronda/finalizar torneo
      return NextResponse.json({ message: `Partida ${activeMatch.id} finalizada.` });
    }

    const bestMoveUci = await getLichessBestMove(game.fen());
    if (!bestMoveUci) throw new Error("Lichess no devolvió un movimiento.");
    
    const moveResult = game.move({ 
      from: bestMoveUci.substring(0, 2), 
      to: bestMoveUci.substring(2, 4), 
      promotion: bestMoveUci.length > 4 ? bestMoveUci.substring(4) : undefined 
    });

    const updatedMoves = [...(activeMatch.moves || []), { move: moveResult.san }];
    await supabaseAdmin
      .from('AITournamentMatch')
      .update({ moves: updatedMoves, lastMoveAt: new Date().toISOString() })
      .eq('id', activeMatch.id);

    return NextResponse.json({ message: `Movimiento ${moveResult.san} realizado.` });

  } catch (error: any) {
    console.error("Error en la API de movimiento:", error.message);
    return new Response(error.message, { status: 500 });
  }
}
