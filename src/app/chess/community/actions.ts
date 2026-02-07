"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function submitVote(email: string, move: string) {
  if (!email || !move) {
    return { error: "Faltan datos para registrar el voto." };
  }

  try {
    const game = await prisma.communityChessGame.findUnique({ where: { id: 'main_game' } });
    if (!game) return { error: "No se encontró la partida." };

    // 1. Buscar o crear al jugador
    let player = await prisma.chessPlayer.findUnique({ where: { email } });

    if (!player) {
      // Asignar un bando al nuevo jugador de forma equitativa
      const whitePlayers = await prisma.chessPlayer.count({ where: { assignedSide: 'w' } });
      const blackPlayers = await prisma.chessPlayer.count({ where: { assignedSide: 'b' } });
      const side = whitePlayers <= blackPlayers ? 'w' : 'b';
      
      player = await prisma.chessPlayer.create({
        data: {
          email,
          name: email.split('@')[0],
          assignedSide: side,
        },
      });
    }

    // 2. Comprobar si el jugador puede votar en este turno
    const currentTurn = game.fen.split(' ')[1];
    if (player.assignedSide !== currentTurn) {
      return { error: `No es el turno de tu bando (${currentTurn === 'w' ? 'blancas' : 'negras'}).` };
    }

    // 3. Comprobar si el jugador ya ha votado
    const existingVote = await prisma.communityVote.findFirst({
      where: {
        playerId: player.id,
        gameId: 'main_game',
      },
    });

    if (existingVote) {
      // Si ya votó, actualizamos su voto
      await prisma.communityVote.update({
        where: { id: existingVote.id },
        data: { move },
      });
    } else {
      // Si no, creamos un nuevo voto
      await prisma.communityVote.create({
        data: {
          move,
          playerId: player.id,
          gameId: 'main_game',
        },
      });
    }

    revalidatePath('/chess/community');
    return { success: `Voto por '${move}' registrado.` };

  } catch (error) {
    return { error: "Ocurrió un error en el servidor." };
  }
}
