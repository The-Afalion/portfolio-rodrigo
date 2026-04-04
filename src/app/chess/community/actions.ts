"use server";

import { supabaseAdmin } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { Chess } from 'chess.js';
import { cookies } from 'next/headers';

/**
 * Calcula el bando de un jugador ('w' para blancas, 'b' para negras)
 * basándose en la suma de los dígitos de su correo electrónico.
 * @param email El correo del jugador.
 * @returns 'w' si la suma es impar, 'b' si es par.
 */
function getSideFromEmail(email: string): 'w' | 'b' {
  const digits = email.match(/\d/g) || [];
  const sum = digits.reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  return sum % 2 !== 0 ? 'w' : 'b';
}

export async function submitVote(email: string, move: string) {
  try {
    // 1. Obtener el bando del jugador desde la cookie
    const playerSideCookie = cookies().get('player-side');
    if (!playerSideCookie || playerSideCookie.value !== getSideFromEmail(email)) {
      return { error: "Error de autenticación. Por favor, regístrate de nuevo." };
    }
    const playerSide = playerSideCookie.value;

    // 2. Validar partida y turno
    const { data: game, error: gameError } = await supabaseAdmin
      .from('CommunityChessGame')
      .select('fen')
      .eq('id', 'main_game')
      .single();

    if (gameError || !game) {
      return { error: "Partida no encontrada." };
    }

    const chess = new Chess(game.fen);
    if (chess.turn() !== playerSide) {
      return { error: `No es el turno de tu bando (${playerSide === 'w' ? 'Blancas' : 'Negras'}).` };
    }

    // 3. Validar que el movimiento sea legal
    const moveResult = chess.move(move);
    if (moveResult === null) {
      return { error: "El movimiento propuesto es ilegal." };
    }

    // 4. Usar el email como identificador único para el voto
    const { error: voteError } = await supabaseAdmin
      .from('CommunityVote')
      .upsert(
        {
          // Usamos el email como un ID de jugador improvisado y único
          playerId: email, 
          gameId: 'main_game',
          move: move,
        },
        { onConflict: 'playerId, gameId' }
      );

    if (voteError) {
      return { error: `Error al registrar el voto: ${voteError.message}` };
    }

    revalidatePath('/chess/community');
    return { success: `Tu voto por '${move}' ha sido registrado.` };

  } catch (error: any) {
    console.error("Error en submitVote:", error.message);
    return { error: "Ocurrió un error inesperado en el servidor." };
  }
}

export async function executeMostVotedMove() {
  try {
    const { data: votes, error: votesError } = await supabaseAdmin
      .from('CommunityVote')
      .select('move')
      .eq('gameId', 'main_game');

    if (votesError || !votes || votes.length === 0) {
      const newDueDate = new Date();
      newDueDate.setDate(newDueDate.getDate() + 1);
      await supabaseAdmin
        .from('CommunityChessGame')
        .update({ nextMoveDue: newDueDate.toISOString() })
        .eq('id', 'main_game');
      return { message: "No hay votos. Ronda extendida." };
    }

    const voteCounts = votes.reduce((acc: Record<string, number>, { move }) => {
      acc[move] = (acc[move] || 0) + 1;
      return acc;
    }, {});

    const mostVotedMove = Object.keys(voteCounts).reduce((a, b) => voteCounts[a] > voteCounts[b] ? a : b);

    const { data: game, error: gameError } = await supabaseAdmin
      .from('CommunityChessGame')
      .select('fen')
      .eq('id', 'main_game')
      .single();
    
    if (gameError || !game) throw new Error("No se pudo obtener la partida.");

    const chess = new Chess(game.fen);
    const moveResult = chess.move(mostVotedMove);
    if (!moveResult) throw new Error(`El movimiento más votado '${mostVotedMove}' es ilegal.`);

    const newDueDate = new Date();
    newDueDate.setDate(newDueDate.getDate() + 1);

    await supabaseAdmin
      .from('CommunityChessGame')
      .update({ fen: chess.fen(), nextMoveDue: newDueDate.toISOString() })
      .eq('id', 'main_game');

    await supabaseAdmin.from('CommunityVote').delete().eq('gameId', 'main_game');

    revalidatePath('/chess/community');
    return { success: `Movimiento '${mostVotedMove}' ejecutado.` };

  } catch (error: any) {
    console.error("Error en executeMostVotedMove:", error.message);
    return { error: error.message };
  }
}
