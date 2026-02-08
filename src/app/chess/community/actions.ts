"use server";

import { supabaseAdmin } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { Chess } from 'chess.js';

const LICHESS_API_URL = 'https://lichess.org/api/cloud-eval';

// --- ACCIONES DEL SERVIDOR CON LÓGICA "INFUSIÓN DE VOTOS" ---

async function getLichessTopMoves(fen: string, count: number = 4) {
  try {
    const response = await fetch(`${LICHESS_API_URL}?fen=${fen}&multiPv=${count}`, {
      headers: { 'Authorization': `Bearer ${process.env.LICHESS_API_TOKEN}` }
    });
    if (!response.ok) throw new Error(`Lichess API error: ${response.statusText}`);
    const data = await response.json();
    
    // Extraer los movimientos en formato SAN
    const game = new Chess(fen);
    return data.pvs.map((pv: any) => {
      const uci = pv.moves.split(' ')[0];
      const move = game.move({ from: uci.substring(0, 2), to: uci.substring(2, 4), promotion: uci.length > 4 ? uci.substring(4) : undefined });
      game.undo(); // Deshacer para que el siguiente move() sea válido
      return move?.san;
    }).filter(Boolean); // Filtrar movimientos nulos si algo falla

  } catch (error) {
    console.error("Error fetching from Lichess:", error);
    // Fallback: devolver movimientos legales aleatorios si Lichess falla
    const game = new Chess(fen);
    return game.moves().sort(() => 0.5 - Math.random()).slice(0, count);
  }
}

export async function executeMoveAndInjectVotes() {
  try {
    // 1. Ejecutar el movimiento más votado por los humanos
    const { data: humanVotes } = await supabaseAdmin.from('CommunityVote').select('move').eq('isFake', false).eq('gameId', 'main_game');
    if (!humanVotes || humanVotes.length === 0) {
      // Si no hay votos humanos, podemos tomar el mejor voto falso o simplemente no hacer nada
      // Por ahora, no hacemos nada para evitar bucles infinitos.
      return { error: "No hay votos humanos para ejecutar." };
    }

    const voteCounts = humanVotes.reduce((acc, { move }) => {
      acc[move] = (acc[move] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostVotedMove = Object.keys(voteCounts).reduce((a, b) => voteCounts[a] > voteCounts[b] ? a : b);

    const { data: gameData } = await supabaseAdmin.from('CommunityChessGame').select('fen').single();
    if (!gameData) throw new Error("No se pudo obtener la partida.");

    const game = new Chess(gameData.fen);
    const moveResult = game.move(mostVotedMove);
    if (!moveResult) throw new Error("El movimiento más votado es ilegal.");

    // 2. Actualizar el tablero y limpiar todos los votos anteriores
    await supabaseAdmin.from('CommunityChessGame').update({ fen: game.fen() }).eq('id', 'main_game');
    await supabaseAdmin.from('CommunityVote').delete().eq('gameId', 'main_game');

    // 3. Obtener las 4 mejores jugadas de Lichess para la NUEVA posición
    const topMoves = await getLichessTopMoves(game.fen());
    if (topMoves.length === 0) throw new Error("No se pudieron obtener sugerencias de Lichess.");

    // 4. Generar los 15 votos falsos con marcas de tiempo futuras
    const { data: ais } = await supabaseAdmin.from('ChessPlayer').select('id').eq('isAI', true);
    if (!ais) throw new Error("No se encontraron IAs para generar votos.");

    const voteDistribution = [
      { move: topMoves[0], count: 7 },
      { move: topMoves[1], count: 4 },
      { move: topMoves[2], count: 3 },
      { move: topMoves[3], count: 1 },
    ].filter(d => d.move); // Asegurarse de que el movimiento existe

    const fakeVotes = [];
    const now = Date.now();
    const oneHour = 55 * 60 * 1000; // Distribuir en los próximos 55 minutos

    for (const dist of voteDistribution) {
      for (let i = 0; i < dist.count; i++) {
        const randomAI = ais[Math.floor(Math.random() * ais.length)];
        const randomTimestamp = new Date(now + Math.random() * oneHour);
        
        fakeVotes.push({
          move: dist.move,
          playerId: randomAI.id,
          gameId: 'main_game',
          isFake: true,
          createdAt: randomTimestamp.toISOString(),
        });
      }
    }

    // 5. Insertar los 15 votos de golpe
    await supabaseAdmin.from('CommunityVote').insert(fakeVotes);

    revalidatePath('/chess/community');
    return { success: `Movimiento '${mostVotedMove}' ejecutado. ${fakeVotes.length} votos falsos inyectados para el próximo turno.` };

  } catch (error: any) {
    console.error("Error en executeMoveAndInjectVotes:", error.message);
    return { error: error.message };
  }
}

export async function submitVote(email: string, move: string) {
  try {
    const { data: player } = await supabaseAdmin.from('ChessPlayer').select('id, assignedSide').eq('email', email).single();
    if (!player) return { error: "Jugador no encontrado." };

    const { data: game } = await supabaseAdmin.from('CommunityChessGame').select('fen').single();
    if (!game) return { error: "Partida no encontrada." };

    const currentTurn = new Chess(game.fen).turn();
    if (player.assignedSide !== currentTurn) {
      return { error: `No es el turno de tu bando.` };
    }

    const { data: existingVote } = await supabaseAdmin.from('CommunityVote').select('id').eq('playerId', player.id).eq('gameId', 'main_game').single();

    if (existingVote) {
      await supabaseAdmin.from('CommunityVote').update({ move }).eq('id', existingVote.id);
    } else {
      await supabaseAdmin.from('CommunityVote').insert({ move, playerId: player.id, gameId: 'main_game', isFake: false });
    }

    revalidatePath('/chess/community');
    return { success: `Voto por '${move}' registrado.` };
  } catch (error: any) {
    return { error: "Ocurrió un error en el servidor." };
  }
}
