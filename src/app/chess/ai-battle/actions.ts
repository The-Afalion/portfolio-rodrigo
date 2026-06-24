"use server";

import { revalidatePath } from "next/cache";
import { ensureProfileForUserSafely } from "@/lib/profile";
import { startTournament } from "@/lib/ai-tournament-server";
import { getAuthenticatedChessUser } from "@/lib/chess-social";
import { placeTournamentBet } from "@/lib/tournament-betting";

export async function startNewTournament() {
  try {
    const tournament = await startTournament();

    revalidatePath("/chess/ai-battle");
    revalidatePath("/chess/ai-battle/archive");

    return { success: `Nuevo torneo ${tournament?.id ?? ""} iniciado.` };
  } catch (error) {
    console.error("No se pudo iniciar el torneo:", error);
    return { error: error instanceof Error ? error.message : "No se pudo iniciar el torneo." };
  }
}

export async function placeBetAction(input: {
  tournamentId: string;
  type: string;
  marketLabel: string;
  stake: number;
  selections: Record<string, unknown>;
}) {
  try {
    const user = await getAuthenticatedChessUser();

    if (!user) {
      return { error: "Inicia sesión para apostar rodes." };
    }

    await ensureProfileForUserSafely(user);

    const bet = await placeTournamentBet({
      profileId: user.id,
      tournamentId: input.tournamentId,
      type: input.type,
      marketLabel: input.marketLabel,
      stake: input.stake,
      selections: input.selections,
    });

    revalidatePath("/chess/ai-battle");

    return { success: `Apuesta registrada: ${bet.potentialPayout} rodes posibles.` };
  } catch (error) {
    console.error("No se pudo registrar la apuesta:", error);
    return { error: error instanceof Error ? error.message : "No se pudo registrar la apuesta." };
  }
}
