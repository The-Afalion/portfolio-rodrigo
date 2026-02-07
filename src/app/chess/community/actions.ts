"use server";

import { supabase } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { Chess } from 'chess.js';

export async function submitVote(email: string, move: string) {
  if (!email || !move) {
    return { error: "Faltan datos para registrar el voto." };
  }

  try {
    // 1. Obtener la partida
    const { data: game, error: gameError } = await supabase
      .from('CommunityChessGame')
      .select('fen')
      .eq('id', 'main_game')
      .single();

    if (gameError) throw new Error(`Error al buscar la partida: ${gameError.message}`);
    if (!game) return { error: "No se encontró la partida." };

    // 2. Buscar o crear al jugador
    let { data: player, error: playerError } = await supabase
      .from('ChessPlayer')
      .select('*')
      .eq('email', email)
      .single();

    if (playerError && playerError.code !== 'PGRST116') {
      throw new Error(`Error al buscar el jugador: ${playerError.message}`);
    }

    if (!player) {
      const { count: whitePlayers, error: whiteError } = await supabase.from('ChessPlayer').select('*', { count: 'exact', head: true }).eq('assignedSide', 'w');
      const { count: blackPlayers, error: blackError } = await supabase.from('ChessPlayer').select('*', { count: 'exact', head: true }).eq('assignedSide', 'b');

      if (whiteError || blackError) throw new Error('Error al contar jugadores.');

      const side = (whitePlayers || 0) <= (blackPlayers || 0) ? 'w' : 'b';
      
      const { data: newPlayer, error: createPlayerError } = await supabase
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

    // 3. Validar el turno
    const currentTurn = new Chess(game.fen).turn();
    if (player.assignedSide !== currentTurn) {
      return { error: `No es el turno de tu bando (${currentTurn === 'w' ? 'blancas' : 'negras'}).` };
    }

    // 4. Buscar si el jugador ya votó
    const { data: existingVote, error: voteError } = await supabase
      .from('CommunityVote')
      .select('id')
      .eq('playerId', player.id)
      .eq('gameId', 'main_game')
      .single();

    if (voteError && voteError.code !== 'PGRST116') {
      throw new Error(`Error al buscar el voto: ${voteError.message}`);
    }

    // 5. Actualizar o crear el voto
    if (existingVote) {
      const { error: updateError } = await supabase
        .from('CommunityVote')
        .update({ move })
        .eq('id', existingVote.id);
      if (updateError) throw new Error(`Error al actualizar el voto: ${updateError.message}`);
    } else {
      const { error: createError } = await supabase
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
