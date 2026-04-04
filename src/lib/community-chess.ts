import "server-only";

import { Chess } from "chess.js";
import prisma from "@/lib/prisma";
import { evaluarTablero } from "@/utils/chessAI";
import type { CommunitySide } from "@/lib/profile";

export const COMMUNITY_GAME_ID = "main_game";
export const COMMUNITY_INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
export const COMMUNITY_MOVE_INTERVAL_HOURS = 24;

const DEFAULT_FAKE_VOTES_PER_ROUND = 18;
const BASE_FAKE_DISTRIBUTION = [0.4, 0.25, 0.18, 0.1, 0.07];
const PIECE_WEIGHTS: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

type RankedMove = {
  san: string;
  score: number;
};

type ChessMoveLike = {
  san: string;
};

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function clampInteger(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function getConfiguredFakeVotesPerRound() {
  const rawValue = Number(process.env.COMMUNITY_FAKE_VOTES_PER_ROUND ?? DEFAULT_FAKE_VOTES_PER_ROUND);

  if (!Number.isFinite(rawValue)) {
    return DEFAULT_FAKE_VOTES_PER_ROUND;
  }

  return clampInteger(rawValue, 0, 200);
}

export function communitySideToTurn(side?: string | null): "w" | "b" | null {
  if (side === "WHITE") {
    return "w";
  }

  if (side === "BLACK") {
    return "b";
  }

  return null;
}

export function turnToCommunitySide(turn: "w" | "b"): CommunitySide {
  return turn === "w" ? "WHITE" : "BLACK";
}

export function getCommunitySideLabel(side?: string | null) {
  if (side === "WHITE") {
    return "Blancas";
  }

  if (side === "BLACK") {
    return "Negras";
  }

  return "Sin asignar";
}

export async function ensureCommunityGame() {
  const now = new Date();

  return prisma.communityChessGame.upsert({
    where: { id: COMMUNITY_GAME_ID },
    update: {},
    create: {
      id: COMMUNITY_GAME_ID,
      fen: COMMUNITY_INITIAL_FEN,
      lastMoveAt: now,
      nextMoveDue: addHours(now, COMMUNITY_MOVE_INTERVAL_HOURS),
    },
  });
}

export function getRankedCommunityMoves(fen: string): RankedMove[] {
  const game = new Chess(fen);
  const turn = game.turn();
  const legalMoves = game.moves({ verbose: true }) as Array<{
    san: string;
    captured?: string;
    promotion?: string;
  }>;

  return legalMoves
    .map((move) => {
      const simulation = new Chess(fen);
      const moveResult = simulation.move(move.san);
      if (!moveResult) {
        return null;
      }

      const boardEvaluation = evaluarTablero(simulation);
      const turnAdjustedScore = turn === "w" ? boardEvaluation : -boardEvaluation;
      const tacticalBonus =
        (move.captured ? PIECE_WEIGHTS[move.captured] ?? 0 : 0) +
        (move.promotion ? 8 : 0) +
        (simulation.isCheck() ? 0.75 : 0) +
        (simulation.isCheckmate() ? 10000 : 0);

      return {
        san: move.san,
        score: turnAdjustedScore + tacticalBonus,
      };
    })
    .filter((move): move is RankedMove => move !== null)
    .sort((left, right) => right.score - left.score);
}

function allocateIntegerVotes(weights: number[], totalVotes: number) {
  if (weights.length === 0 || totalVotes <= 0) {
    return [];
  }

  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const rawAllocations = weights.map((weight) => (weight / totalWeight) * totalVotes);
  const baseAllocations = rawAllocations.map((value) => Math.floor(value));
  let remainingVotes = totalVotes - baseAllocations.reduce((sum, value) => sum + value, 0);

  const remainders = rawAllocations
    .map((value, index) => ({
      index,
      remainder: value - Math.floor(value),
    }))
    .sort((left, right) => right.remainder - left.remainder);

  for (const { index } of remainders) {
    if (remainingVotes <= 0) {
      break;
    }

    baseAllocations[index] += 1;
    remainingVotes -= 1;
  }

  return baseAllocations;
}

export function buildSyntheticVotePlan(fen: string, totalVotes = getConfiguredFakeVotesPerRound()) {
  const rankedMoves = getRankedCommunityMoves(fen);
  if (rankedMoves.length === 0 || totalVotes <= 0) {
    return [];
  }

  const candidates = rankedMoves.slice(0, Math.min(BASE_FAKE_DISTRIBUTION.length, rankedMoves.length));
  const slicedBaseDistribution = BASE_FAKE_DISTRIBUTION.slice(0, candidates.length);
  const baseDistributionSum = slicedBaseDistribution.reduce((sum, value) => sum + value, 0);
  const normalizedBaseDistribution = slicedBaseDistribution.map((value) => value / baseDistributionSum);

  const bestScore = candidates[0].score;
  const worstScore = candidates[candidates.length - 1].score;
  const scoreRange = Math.max(1, bestScore - worstScore);

  const qualityAdjustedWeights = candidates.map((candidate, index) => {
    const relativeQuality = (candidate.score - worstScore) / scoreRange;
    return normalizedBaseDistribution[index] * (0.4 + relativeQuality * 0.6);
  });

  const allocations = allocateIntegerVotes(qualityAdjustedWeights, totalVotes);

  return candidates
    .map((candidate, index) => ({
      move: candidate.san,
      count: allocations[index] ?? 0,
    }))
    .filter((candidate) => candidate.count > 0);
}

export async function ensureSyntheticVotes(gameId: string, fen: string) {
  const desiredFakeVotes = getConfiguredFakeVotesPerRound();
  if (desiredFakeVotes <= 0) {
    return [];
  }

  const existingFakeVotes = await prisma.communityVote.count({
    where: {
      gameId,
      isFake: true,
    },
  });

  if (existingFakeVotes >= desiredFakeVotes) {
    return prisma.communityVote.findMany({
      where: {
        gameId,
        isFake: true,
      },
    });
  }

  const votePlan = buildSyntheticVotePlan(fen, desiredFakeVotes);
  const operations = [];
  let slot = 0;

  for (const entry of votePlan) {
    for (let index = 0; index < entry.count; index += 1) {
      slot += 1;

      operations.push(
        prisma.communityVote.upsert({
          where: {
            gameId_syntheticKey: {
              gameId,
              syntheticKey: `fake-${slot}`,
            },
          },
          update: {
            move: entry.move,
            isFake: true,
            userId: null,
          },
          create: {
            gameId,
            move: entry.move,
            isFake: true,
            syntheticKey: `fake-${slot}`,
          },
        })
      );
    }
  }

  if (operations.length > 0) {
    await prisma.$transaction(operations);
  }

  return prisma.communityVote.findMany({
    where: {
      gameId,
      isFake: true,
    },
  });
}

export function groupCommunityVotes(votes: Array<{ move: string }>) {
  const counts = new Map<string, number>();

  for (const vote of votes) {
    counts.set(vote.move, (counts.get(vote.move) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([move, count]) => ({ move, count }))
    .sort((left, right) => right.count - left.count || left.move.localeCompare(right.move));
}

export async function executeCommunityRound(options?: { force?: boolean }) {
  const game = await ensureCommunityGame();
  const now = new Date();

  if (!options?.force && now < game.nextMoveDue) {
    return {
      success: false,
      skipped: true,
      message: "The current community round is still open.",
    };
  }

  const chess = new Chess(game.fen);

  if (chess.isGameOver() || chess.moves().length === 0) {
    const nextMoveDue = addHours(now, COMMUNITY_MOVE_INTERVAL_HOURS);

    await prisma.$transaction([
      prisma.communityVote.deleteMany({
        where: { gameId: game.id },
      }),
      prisma.communityChessGame.update({
        where: { id: game.id },
        data: {
          fen: COMMUNITY_INITIAL_FEN,
          lastMoveAt: now,
          nextMoveDue,
        },
      }),
    ]);

    return {
      success: true,
      reset: true,
      message: "La partida comunal ha terminado y se ha reiniciado una nueva ronda.",
    };
  }

  await ensureSyntheticVotes(game.id, game.fen);

  const votes = await prisma.communityVote.findMany({
    where: {
      gameId: game.id,
    },
  });

  const legalMoves = new Set(chess.moves() as string[]);
  const groupedVotes = groupCommunityVotes(votes.filter((vote) => legalMoves.has(vote.move)));
  const fallbackMove = getRankedCommunityMoves(game.fen)[0]?.san ?? null;
  const selectedMove = groupedVotes[0]?.move ?? fallbackMove;

  if (!selectedMove) {
    return {
      success: false,
      error: "No hay movimientos legales disponibles para la partida comunal.",
    };
  }

  const moveResult = chess.move(selectedMove) as ChessMoveLike | null;
  if (!moveResult) {
    return {
      success: false,
      error: `El movimiento seleccionado '${selectedMove}' no es legal en la posición actual.`,
    };
  }

  const nextMoveDue = addHours(now, COMMUNITY_MOVE_INTERVAL_HOURS);

  await prisma.$transaction([
    prisma.communityVote.deleteMany({
      where: { gameId: game.id },
    }),
    prisma.communityChessGame.update({
      where: { id: game.id },
      data: {
        fen: chess.fen(),
        lastMoveAt: now,
        nextMoveDue,
      },
    }),
  ]);

  return {
    success: true,
    move: moveResult.san,
    nextMoveDue,
    message: `Se ha ejecutado '${moveResult.san}' como movimiento ganador de la ronda.`,
  };
}
