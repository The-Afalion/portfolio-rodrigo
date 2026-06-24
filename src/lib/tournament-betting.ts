import "server-only";

import { Chess } from "chess.js";
import prisma from "@/lib/prisma";

const HOUSE_FACTOR = 0.92;
const MIN_ODDS = 1.05;
const MAX_ODDS = 18;
const DEFAULT_RODES = 1000;

type BotLike = {
  id: string;
  name: string;
  elo: number;
  winsTotal?: number | null;
  matchWins?: number | null;
  matchLosses?: number | null;
};

type MatchLike = {
  id: string;
  round: number;
  status: string;
  winnerId?: string | null;
  fen?: string | null;
  player1: BotLike;
  player2: BotLike;
};

type TournamentLike = {
  id: string;
  status: string;
  winnerId?: string | null;
  matches?: MatchLike[];
};

type BetSelection = {
  botId?: string;
  matchId?: string;
  finalists?: string[];
  winnerId?: string;
  legs?: BetSelection[];
  minWinnerKnightsAtEnd?: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundOdds(value: number) {
  return Math.round(clamp(value, MIN_ODDS, MAX_ODDS) * 100) / 100;
}

function probabilityToOdds(probability: number) {
  return roundOdds(HOUSE_FACTOR / clamp(probability, 0.03, 0.95));
}

function eloProbability(a: BotLike, b: BotLike) {
  const eloComponent = 1 / (1 + 10 ** ((b.elo - a.elo) / 400));
  const aForm = ((a.matchWins ?? 0) + 1) / ((a.matchWins ?? 0) + (a.matchLosses ?? 0) + 2);
  const bForm = ((b.matchWins ?? 0) + 1) / ((b.matchWins ?? 0) + (b.matchLosses ?? 0) + 2);
  const formComponent = aForm / Math.max(0.001, aForm + bForm);
  return clamp(eloComponent * 0.72 + formComponent * 0.28, 0.08, 0.92);
}

function getTournamentBots(tournament: TournamentLike) {
  const bots = new Map<string, BotLike>();

  for (const match of tournament.matches ?? []) {
    bots.set(match.player1.id, match.player1);
    bots.set(match.player2.id, match.player2);
  }

  return Array.from(bots.values());
}

function hasTournamentStarted(tournament: TournamentLike) {
  return Boolean((tournament.matches ?? []).some((match) => match.status !== "PENDING"));
}

function isBotAlive(tournament: TournamentLike, botId: string) {
  const losses = (tournament.matches ?? []).some((match) => {
    if (match.status !== "FINISHED" || !match.winnerId) {
      return false;
    }

    const played = match.player1.id === botId || match.player2.id === botId;
    return played && match.winnerId !== botId;
  });

  return !losses;
}

function tournamentWinProbability(tournament: TournamentLike, bot: BotLike) {
  if (!isBotAlive(tournament, bot.id)) {
    return 0.001;
  }

  const bots = getTournamentBots(tournament).filter((candidate) => isBotAlive(tournament, candidate.id));
  const strength = Math.max(1, bot.elo + (bot.winsTotal ?? 0) * 18 + (bot.matchWins ?? 0) * 3);
  const total = bots.reduce((sum, candidate) => sum + Math.max(1, candidate.elo + (candidate.winsTotal ?? 0) * 18 + (candidate.matchWins ?? 0) * 3), 0);
  return clamp(strength / Math.max(1, total), 0.02, 0.9);
}

function countWinnerKnights(fen: string | null | undefined, winnerColor: "w" | "b") {
  if (!fen) {
    return 0;
  }

  const board = new Chess(fen).board();
  let count = 0;

  for (const row of board) {
    for (const piece of row) {
      if (piece?.type === "n" && piece.color === winnerColor) {
        count += 1;
      }
    }
  }

  return count;
}

function getFinalMatch(tournament: TournamentLike) {
  const matches = tournament.matches ?? [];
  const maxRound = Math.max(0, ...matches.map((match) => match.round));
  return matches.find((match) => match.round === maxRound && match.status === "FINISHED") ?? null;
}

export function getBettingMarkets(tournament: TournamentLike | null, profile?: { rodes?: number | null } | null) {
  if (!tournament) {
    return {
      wallet: profile?.rodes ?? DEFAULT_RODES,
      markets: [],
      customAvailable: false,
      message: "Las apuestas se activarán cuando haya un torneo.",
    };
  }

  const markets: Array<{
    id: string;
    type: string;
    label: string;
    description: string;
    odds: number;
    locked: boolean;
    selections: BetSelection;
  }> = [];

  const activeOrNextMatch =
    (tournament.matches ?? []).find((match) => match.status === "PENDING") ??
    (tournament.matches ?? []).find((match) => match.status === "ACTIVE");

  if (activeOrNextMatch) {
    const matchLocked = activeOrNextMatch.status !== "PENDING";
    const p1 = eloProbability(activeOrNextMatch.player1, activeOrNextMatch.player2);
    const p2 = 1 - p1;

    markets.push({
      id: `match-${activeOrNextMatch.id}-${activeOrNextMatch.player1.id}`,
      type: "MATCH_WINNER",
      label: `${activeOrNextMatch.player1.name} gana la próxima partida`,
      description: `${activeOrNextMatch.player1.name} vs ${activeOrNextMatch.player2.name}`,
      odds: probabilityToOdds(p1),
      locked: matchLocked,
      selections: { matchId: activeOrNextMatch.id, botId: activeOrNextMatch.player1.id },
    });

    markets.push({
      id: `match-${activeOrNextMatch.id}-${activeOrNextMatch.player2.id}`,
      type: "MATCH_WINNER",
      label: `${activeOrNextMatch.player2.name} gana la próxima partida`,
      description: `${activeOrNextMatch.player1.name} vs ${activeOrNextMatch.player2.name}`,
      odds: probabilityToOdds(p2),
      locked: matchLocked,
      selections: { matchId: activeOrNextMatch.id, botId: activeOrNextMatch.player2.id },
    });
  }

  for (const bot of getTournamentBots(tournament)
    .filter((candidate) => isBotAlive(tournament, candidate.id))
    .sort((a, b) => b.elo - a.elo)
    .slice(0, 6)) {
    markets.push({
      id: `tournament-${bot.id}`,
      type: "TOURNAMENT_WINNER",
      label: `${bot.name} gana el torneo`,
      description: hasTournamentStarted(tournament) ? "Cuota dinámica con torneo en marcha" : "Campeón del bracket",
      odds: probabilityToOdds(tournamentWinProbability(tournament, bot)),
      locked: tournament.status === "FINISHED",
      selections: { botId: bot.id },
    });
  }

  return {
    wallet: profile?.rodes ?? DEFAULT_RODES,
    markets,
    customAvailable: tournament.status !== "FINISHED",
    message: null,
  };
}

export async function ensureRodesWallet(profileId: string) {
  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
    select: { id: true, rodes: true },
  });

  if (!profile) {
    return null;
  }

  if (profile.rodes == null) {
    return prisma.profile.update({
      where: { id: profileId },
      data: { rodes: DEFAULT_RODES },
      select: { id: true, rodes: true },
    });
  }

  return profile;
}

async function loadTournamentForBetting(tournamentId: string) {
  return prisma.aITournament.findUnique({
    where: { id: tournamentId },
    include: {
      matches: {
        include: {
          player1: true,
          player2: true,
        },
        orderBy: [{ round: "asc" }, { createdAt: "asc" }],
      },
    },
  });
}

function calculateOddsForBet(tournament: TournamentLike, type: string, selections: BetSelection): number {
  if (type === "MATCH_WINNER") {
    const match = (tournament.matches ?? []).find((candidate) => candidate.id === selections.matchId);
    if (!match || match.status !== "PENDING" || !selections.botId) {
      throw new Error("Esta partida ya no acepta apuestas.");
    }

    const probability =
      selections.botId === match.player1.id
        ? eloProbability(match.player1, match.player2)
        : selections.botId === match.player2.id
          ? eloProbability(match.player2, match.player1)
          : 0;

    if (probability <= 0) {
      throw new Error("Selección no válida para esta partida.");
    }

    return probabilityToOdds(probability);
  }

  if (type === "TOURNAMENT_WINNER") {
    const bot = getTournamentBots(tournament).find((candidate) => candidate.id === selections.botId);
    if (!bot || tournament.status === "FINISHED") {
      throw new Error("Este mercado ya no está disponible.");
    }

    return probabilityToOdds(tournamentWinProbability(tournament, bot));
  }

  if (type === "FINALISTS_EXACT") {
    if (hasTournamentStarted(tournament)) {
      throw new Error("La final exacta solo se puede apostar antes de empezar el torneo.");
    }

    const finalists = selections.finalists ?? [];
    if (finalists.length !== 2 || finalists[0] === finalists[1]) {
      throw new Error("Selecciona dos finalistas distintos.");
    }

    const bots = getTournamentBots(tournament);
    const probability = finalists.reduce((product, botId) => {
      const bot = bots.find((candidate) => candidate.id === botId);
      return product * (bot ? tournamentWinProbability(tournament, bot) * 1.9 : 0);
    }, 1);

    return probabilityToOdds(clamp(probability, 0.015, 0.25));
  }

  if (type === "CUSTOM_FINAL") {
    const baseOdds: number = calculateOddsForBet(tournament, "FINALISTS_EXACT", selections);
    const championBot = getTournamentBots(tournament).find((candidate) => candidate.id === selections.winnerId);
    const finalistOdds = championBot ? probabilityToOdds(tournamentWinProbability(tournament, championBot)) : 8;
    const knightBoost = selections.minWinnerKnightsAtEnd ? 1.35 + selections.minWinnerKnightsAtEnd * 0.22 : 1;
    return roundOdds(baseOdds * finalistOdds * 0.42 * knightBoost);
  }

  if (type === "COMBO") {
    const legs = selections.legs ?? [];
    if (legs.length < 2 || legs.length > 4) {
      throw new Error("Una combinada necesita entre 2 y 4 selecciones.");
    }

    const combined: number = legs.reduce((odds: number, leg) => odds * calculateOddsForBet(tournament, leg.matchId ? "MATCH_WINNER" : "TOURNAMENT_WINNER", leg), 1);
    return roundOdds(combined * 0.88);
  }

  throw new Error("Tipo de apuesta no reconocido.");
}

export async function placeTournamentBet(input: {
  profileId: string;
  tournamentId: string;
  type: string;
  marketLabel: string;
  stake: number;
  selections: BetSelection;
}) {
  const stake = Math.floor(input.stake);
  if (!Number.isFinite(stake) || stake < 10) {
    throw new Error("La apuesta mínima es de 10 rodes.");
  }

  const [wallet, tournament] = await Promise.all([
    ensureRodesWallet(input.profileId),
    loadTournamentForBetting(input.tournamentId),
  ]);

  if (!wallet) {
    throw new Error("Necesitas iniciar sesión para apostar.");
  }

  if (wallet.rodes < stake) {
    throw new Error("No tienes suficientes rodes.");
  }

  if (!tournament) {
    throw new Error("Torneo no encontrado.");
  }

  const odds = calculateOddsForBet(tournament as TournamentLike, input.type, input.selections);
  const potentialPayout = Math.floor(stake * odds);

  return prisma.$transaction(async (tx) => {
    const freshProfile = await tx.profile.findUnique({
      where: { id: input.profileId },
      select: { rodes: true },
    });

    if (!freshProfile || freshProfile.rodes < stake) {
      throw new Error("No tienes suficientes rodes.");
    }

    await tx.profile.update({
      where: { id: input.profileId },
      data: { rodes: { decrement: stake } },
    });

    return tx.tournamentBet.create({
      data: {
        profileId: input.profileId,
        tournamentId: input.tournamentId,
        matchId: input.selections.matchId,
        type: input.type,
        marketLabel: input.marketLabel,
        selections: input.selections,
        stake,
        odds,
        potentialPayout,
      },
    });
  });
}

function resolveBet(tournament: TournamentLike, bet: { type: string; selections: any; matchId?: string | null }) {
  const selections = bet.selections as BetSelection;

  if (bet.type === "MATCH_WINNER") {
    const match = (tournament.matches ?? []).find((candidate) => candidate.id === (bet.matchId ?? selections.matchId));
    if (!match || match.status !== "FINISHED" || !match.winnerId) {
      return null;
    }

    return match.winnerId === selections.botId;
  }

  if (bet.type === "TOURNAMENT_WINNER") {
    if (tournament.status !== "FINISHED" || !tournament.winnerId) {
      return null;
    }

    return tournament.winnerId === selections.botId;
  }

  if (bet.type === "FINALISTS_EXACT" || bet.type === "CUSTOM_FINAL") {
    if (tournament.status !== "FINISHED") {
      return null;
    }

    const finalMatch = getFinalMatch(tournament);
    if (!finalMatch || !finalMatch.winnerId) {
      return null;
    }

    const expected = new Set(selections.finalists ?? []);
    const actual = new Set([finalMatch.player1.id, finalMatch.player2.id]);
    const finalistsOk = expected.size === 2 && Array.from(expected).every((id) => actual.has(id));
    const winnerOk = selections.winnerId ? finalMatch.winnerId === selections.winnerId : true;

    if (!finalistsOk || !winnerOk) {
      return false;
    }

    if (bet.type === "CUSTOM_FINAL" && selections.minWinnerKnightsAtEnd) {
      const winnerColor = finalMatch.winnerId === finalMatch.player1.id ? "w" : "b";
      return countWinnerKnights(finalMatch.fen, winnerColor) >= selections.minWinnerKnightsAtEnd;
    }

    return true;
  }

  if (bet.type === "COMBO") {
    const legs = selections.legs ?? [];
    let allResolved = true;

    for (const leg of legs) {
      const resolved = resolveBet(tournament, {
        type: leg.matchId ? "MATCH_WINNER" : "TOURNAMENT_WINNER",
        selections: leg,
        matchId: leg.matchId,
      });

      if (resolved === false) {
        return false;
      }

      if (resolved === null) {
        allResolved = false;
      }
    }

    return allResolved ? true : null;
  }

  return false;
}

export async function settleTournamentBets(tournamentId: string) {
  const tournament = await prisma.aITournament.findUnique({
    where: { id: tournamentId },
    include: {
      matches: {
        include: {
          player1: true,
          player2: true,
        },
      },
    },
  });

  if (!tournament) {
    return;
  }

  const pendingBets = await prisma.tournamentBet.findMany({
    where: {
      tournamentId,
      status: "PENDING",
    },
  });

  for (const bet of pendingBets) {
    const result = resolveBet(tournament as TournamentLike, bet);
    if (result === null) {
      continue;
    }

    await prisma.$transaction([
      prisma.tournamentBet.update({
        where: { id: bet.id },
        data: {
          status: result ? "WON" : "LOST",
          payout: result ? bet.potentialPayout : 0,
          settledAt: new Date(),
        },
      }),
      ...(result
        ? [
            prisma.profile.update({
              where: { id: bet.profileId },
              data: { rodes: { increment: bet.potentialPayout } },
            }),
          ]
        : []),
    ]);
  }
}

export async function getUserBettingSummary(profileId: string | null | undefined, tournamentId: string | null | undefined) {
  if (!profileId) {
    return {
      wallet: DEFAULT_RODES,
      bets: [],
    };
  }

  const wallet = await ensureRodesWallet(profileId);
  const bets = tournamentId
    ? await prisma.tournamentBet.findMany({
        where: {
          profileId,
          tournamentId,
        },
        orderBy: { createdAt: "desc" },
        take: 12,
      })
    : [];

  return {
    wallet: wallet?.rodes ?? DEFAULT_RODES,
    bets: bets.map((bet) => ({
      id: bet.id,
      type: bet.type,
      marketLabel: bet.marketLabel,
      stake: bet.stake,
      odds: bet.odds,
      potentialPayout: bet.potentialPayout,
      status: bet.status,
      payout: bet.payout,
      createdAt: bet.createdAt.toISOString(),
    })),
  };
}
