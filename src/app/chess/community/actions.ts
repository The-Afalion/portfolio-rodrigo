"use server";

import { supabaseAdmin } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { Chess } from 'chess.js';

// --- FUNCIÓN PARA GENERAR VOTOS FALSOS DE IA ---
async function generateFakeVotes(gameFen: string, currentTurn: 'w' | 'b') {
  try {
    const { data: ais } = await supabaseAdmin
      .from('ChessPlayer')
      .select('id')
      .eq('isAI', true);

    if (!ais || ais.length === 0) return;

    const game = new Chess(gameFen);
    const legalMoves = game.moves();
    if (legalMoves.length === 0) return;

    // Haremos que entre 2 y 5 IAs voten
    const numberOfAIVotes = Math.floor(Math.random() * 4) + 2;
    const shuffledAIs = ais.sort(() => 0.5 - Math.random());
    const votingAIs = shuffledAIs.slice(0, numberOfAIVotes);

    const fakeVotes = votingAIs.map(ai => {
      // Cada IA elige un movimiento legal al azar
      const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      return {
        move: randomMove,
        playerId: ai.id,
        gameId: 'main_game',
        isFake: true, // Marcamos el voto como falso
      };
    });

    await supabaseAdmin.from('CommunityVote').insert(fakeVotes);
    console.log(`Generated ${fakeVotes.length} fake AI votes.`);

  } catch (error: any) {
    console.error("Error generating fake votes:", error.message);
  }
}


export async function submitVote(email: string, move: string) {
  if (!email || !move) {
    return { error: "Faltan datos para registrar el voto." };
  }

  try {
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
      const { count: whitePlayers } = await supabaseAdmin.from('ChessPlayer').select('*', { count: 'exact', head: true }).eq('assignedSide', 'w');
      const { count: blackPlayers } = await supabaseAdmin.from('ChessPlayer').select('*', { count: 'exact', head: true }).eq('assignedSide', 'b');
      const side = (whitePlayers || 0) <= (blackPlayers || 0) ? 'w' : 'b';
      
      const { data: newPlayer, error: createPlayerError } = await supabaseAdmin
        .from('ChessPlayer')
        .insert({ email, name: email.split('@')[0], assignedSide: side })
        .select()
        .single();
      
      if (createPlayerError) throw new Error(`Error al crear el jugador: ${createPlayerError.message}`);
      player = newPlayer;
    }

    const currentTurn = new Chess(game.fen).turn();
    if (player.assignedSide !== currentTurn) {
      return { error: `No es el turno de tu bando (${currentTurn === 'w' ? 'blancas' : 'negras'}).` };
    }

    const { data: existingVote } = await supabaseAdmin
      .from('CommunityVote')
      .select('id')
      .eq('playerId', player.id)
      .eq('gameId', 'main_game')
      .single();

    if (existingVote) {
      await supabaseAdmin.from('CommunityVote').update({ move }).eq('id', existingVote.id);
    } else {
      await supabaseAdmin.from('CommunityVote').insert({ move, playerId: player.id, gameId: 'main_game' });
    }

    // --- LÓGICA RESTAURADA ---
    // Después de que el humano vota, generamos los votos falsos
    await generateFakeVotes(game.fen, currentTurn);
    // -------------------------

    revalidatePath('/chess/community');
    return { success: `Voto por '${move}' registrado.` };

  } catch (error: any) {
    console.error("Server action error in submitVote:", error.message);
    return { error: "Ocurrió un error en el servidor." };
  }
}
