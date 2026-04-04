"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { Chess } from "chess.js";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import {
  COMMUNITY_GAME_ID,
  communitySideToTurn,
  ensureCommunityGame,
  ensureSyntheticVotes,
  executeCommunityRound,
} from "@/lib/community-chess";
import { ensureProfileForUserSafely } from "@/lib/profile";

async function getAuthenticatedCommunityPlayer() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const profile = await ensureProfileForUserSafely(user);
  return { user, profile };
}

export async function submitVote(move: string) {
  try {
    const player = await getAuthenticatedCommunityPlayer();
    if (!player) {
      return { error: "Necesitas iniciar sesión para votar en el ajedrez comunal." };
    }

    const playerTurn = communitySideToTurn(player.profile.communitySide);
    if (!playerTurn) {
      return { error: "No se ha podido determinar tu bando comunal." };
    }

    const game = await ensureCommunityGame();
    const now = new Date();

    if (now >= game.nextMoveDue) {
      return { error: "La ronda ya se ha cerrado. Espera al siguiente movimiento diario." };
    }

    const chess = new Chess(game.fen);
    if (chess.isGameOver()) {
      return { error: "La partida comunal ha terminado y se está preparando una nueva." };
    }

    if (chess.turn() !== playerTurn) {
      return {
        error: `Ahora mismo le toca mover al bando ${chess.turn() === "w" ? "blanco" : "negro"}.`,
      };
    }

    const legalMoves = chess.moves({ verbose: true }) as Array<{ san: string }>;
    const selectedMove = legalMoves.find((legalMove) => legalMove.san === move);

    if (!selectedMove) {
      return { error: "El movimiento seleccionado no es legal en esta posición." };
    }

    await ensureSyntheticVotes(game.id, game.fen);

    await prisma.communityVote.upsert({
      where: {
        gameId_userId: {
          gameId: COMMUNITY_GAME_ID,
          userId: player.user.id,
        },
      },
      update: {
        move: selectedMove.san,
        isFake: false,
        syntheticKey: null,
      },
      create: {
        gameId: COMMUNITY_GAME_ID,
        move: selectedMove.san,
        userId: player.user.id,
      },
    });

    revalidatePath("/chess/community");

    return {
      success: `Tu voto por '${selectedMove.san}' ha quedado registrado.`,
      move: selectedMove.san,
    };
  } catch (error) {
    console.error("Error en submitVote:", error);
    return { error: "No se ha podido registrar tu voto." };
  }
}

export async function executeMostVotedMove() {
  try {
    const result = await executeCommunityRound({ force: true });
    revalidatePath("/chess/community");

    if (!result.success) {
      return { error: result.error ?? result.message ?? "No se ha podido ejecutar la ronda." };
    }

    return {
      success: result.message,
      move: result.move ?? null,
      reset: Boolean(result.reset),
    };
  } catch (error) {
    console.error("Error en executeMostVotedMove:", error);
    return { error: "No se ha podido ejecutar el movimiento ganador." };
  }
}
