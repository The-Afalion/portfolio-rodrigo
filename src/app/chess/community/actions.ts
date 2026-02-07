"use server";

import { supabaseAdmin } from '@/lib/db'; // Usamos el cliente de admin
import { revalidatePath } from 'next/cache';
import { Chess } from 'chess.js';

export async function submitVote(email: string, move: string) {
  if (!email || !move) {
    return { error: "Faltan datos para registrar el voto." };
  }

  try {
    // Usamos supabaseAdmin para todas las operaciones
    const { data: game, error: gameError } = await supabaseAdmin
      .from('CommunityChessGame')
      .select('fen')
      .eq('id', 'main_game')
      .single();

    if (gameError) throw new Error(`Error al buscar la partida: ${gameError.message}`);
    if (!game) return { error: "No se encontró la partida." };

    let { data: player, error: playerError } = await supabaseAdmin
      .from('ChessPlayer')
      .select('*')
      .eq('email', email)
      .single();

    if (playerError && playerError.code !== 'PGRST116') {
      throw new Error(`Error al buscar el jugador: ${playerError.message}`);
    }

    if (!player) {
      const { count: whitePlayers, error: whiteError } = await supabaseAdmin.from('ChessPlayer').select('*', { count: 'exact', head: true }).eq('assignedSide', 'w');
      const { count: blackPlayers, error: blackError } = await supabaseAdmin.from('ChessPlayer').select('*', { count: 'exact', head: true }).eq('assignedSide', 'b');

      if (whiteError || blackError) throw new Error('Error al contar jugadores.');

      const side = (whitePlayers || 0) <= (blackPlayers || 0) ? 'w' : 'b';
      
      const { data: newPlayer, error: createPlayerError } = await supabaseAdmin
        .from('ChessPlayer')
        .insert({
          email,
          name: email.split('@')[0],
          assignedSide: side,
        })
        .select()
        .single();
      
      if (createPlayerError) throw new Error(`Error al crear el jugador: ${createPlayerError.message}`);
      player = newPlayer;
    }

    const currentTurn = new Chess(game.fen).turn();
    if (player.assignedSide !== currentTurn) {
      return { error: `No es el turno de tu bando (${currentTurn === 'w' ? 'blancas' : 'negras'}).` };
    }

    const { data: existingVote, error: voteError } = await supabaseAdmin
      .from('CommunityVote')
      .select('id')
      .eq('playerId', player.id)
      .eq('gameId', 'main_game')
      .single();

    if (voteError && voteError.code !== 'PGRST116') {
      throw new Error(`Error al buscar el voto: ${voteError.message}`);
    }

    if (existingVote) {
      const { error: updateError } = await supabaseAdmin
        .from('CommunityVote')
        .update({ move })
        .eq('id', existingVote.id);
      if (updateError) throw new Error(`Error al actualizar el voto: ${updateError.message}`);
    } else {
      const { error: createError } = await supabaseAdmin
        .from('CommunityVote')
        .insert({
          move,
          playerId: player.id,
          gameId: 'main_game',
        });
      if (createError) throw new Error(`Error al crear el voto: ${createError.message}`);
    }

    revalidatePath('/chess/community');
    return { success: `Voto por '${move}' registrado.` };

  } catch (error: any) {
    console.error("Server action error in submitVote:", error.message);
    return { error: "Ocurrió un error en el servidor." };
  }
}
