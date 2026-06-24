import "server-only";

import { Chess } from "chess.js";
import prisma from "@/lib/prisma";
import { searchBestMove, type EngineStyle } from "@/lib/chess-engine";
import { settleTournamentBets } from "@/lib/tournament-betting";

const INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const DEFAULT_BOTS = [
  { name: "VoidRunner", personality: "BERSERKER", elo: 1820 },
  { name: "HexaMind", personality: "AGGRESSIVE", elo: 1740 },
  { name: "ApexBot", personality: "PRESSURER", elo: 1680 },
  { name: "NexoZero", personality: "BALANCED", elo: 1650 },
  { name: "SiliconSoul", personality: "DEFENSIVE", elo: 1580 },
  { name: "LogicLoom", personality: "FORTRESS", elo: 1540 },
  { name: "CodeCaster", personality: "ADAPTIVE", elo: 1720 },
  { name: "KernelKing", personality: "OPENING_BOOK", elo: 1610 },
  { name: "FluxAI", personality: "REACTIONARY", elo: 1420 },
  { name: "CygnusX1", personality: "OPPORTUNIST", elo: 1690 },
  { name: "ByteBard", personality: "PAWN_MASTER", elo: 1510 },
  { name: "QuantumLeap", personality: "CHAOTIC", elo: 1460 },
];

function isDatabaseUnavailableError(error: unknown) {
  return error instanceof Error && (
    error.message.includes("zona de contenidos no está disponible") ||
    error.message.includes("DATABASE_URL") ||
    error.message.includes("Can't reach database") ||
    error.message.includes("P1001") ||
    error.message.includes("P2021")
  );
}

function fallbackLeaderboard() {
  return DEFAULT_BOTS
    .map((bot) => ({
      id: bot.name,
      name: bot.name,
        elo: bot.elo,
        winsTotal: 0,
        matchesPlayed: 0,
        matchWins: 0,
        matchLosses: 0,
        personality: bot.personality,
      }))
    .sort((left, right) => right.elo - left.elo || left.name.localeCompare(right.name));
}

type TournamentMove = {
  move: string;
  timestamp?: string;
  fen?: string;
  score?: number;
  depth?: number;
};

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function normalizeMoves(value: unknown): TournamentMove[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const moves: TournamentMove[] = [];

  for (const entry of value) {
    if (!entry || typeof entry !== "object") {
      continue;
    }

    const move = "move" in entry && typeof entry.move === "string" ? entry.move : null;
    if (!move) {
      continue;
    }

    moves.push({
      move,
      timestamp: "timestamp" in entry && typeof entry.timestamp === "string" ? entry.timestamp : undefined,
      fen: "fen" in entry && typeof entry.fen === "string" ? entry.fen : undefined,
      score: "score" in entry && typeof entry.score === "number" ? entry.score : undefined,
      depth: "depth" in entry && typeof entry.depth === "number" ? entry.depth : undefined,
    });
  }

  return moves;
}

function serializeDate(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}

function serializeMatch(match: any) {
  return {
    ...match,
    createdAt: serializeDate(match.createdAt),
    updatedAt: serializeDate(match.updatedAt),
    lastMoveAt: serializeDate(match.lastMoveAt),
    moves: normalizeMoves(match.moves),
  };
}

function serializeTournament(tournament: any) {
  if (!tournament) {
    return null;
  }

  return {
    ...tournament,
    startDate: serializeDate(tournament.startDate),
    endDate: serializeDate(tournament.endDate),
    createdAt: serializeDate(tournament.createdAt),
    updatedAt: serializeDate(tournament.updatedAt),
    endedAt: serializeDate(tournament.endedAt),
    matches: Array.isArray(tournament.matches) ? tournament.matches.map(serializeMatch) : [],
  };
}

async function loadTournament(id: string) {
  return prisma.aITournament.findUnique({
    where: { id },
    include: {
      winner: { select: { id: true, name: true, elo: true } },
      matches: {
        include: {
          player1: { select: { id: true, name: true, elo: true, personality: true, matchWins: true, matchLosses: true, winsTotal: true } },
          player2: { select: { id: true, name: true, elo: true, personality: true, matchWins: true, matchLosses: true, winsTotal: true } },
          winner: { select: { id: true, name: true, elo: true } },
        },
        orderBy: [{ round: "asc" }, { createdAt: "asc" }],
      },
    },
  });
}

export async function ensureTournamentBots() {
  for (const bot of DEFAULT_BOTS) {
    await prisma.chessBot.upsert({
      where: { name: bot.name },
      update: {
        personality: bot.personality,
        elo: bot.elo,
      },
      create: bot,
    });
  }

  return prisma.chessBot.findMany({
    orderBy: [{ elo: "desc" }, { name: "asc" }],
  });
}

export async function getTournamentLeaderboard() {
  try {
    await ensureTournamentBots();

    return prisma.chessBot.findMany({
      select: {
        id: true,
        name: true,
        elo: true,
        winsTotal: true,
        matchesPlayed: true,
        matchWins: true,
        matchLosses: true,
        personality: true,
      },
      orderBy: [{ elo: "desc" }, { winsTotal: "desc" }, { name: "asc" }],
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return fallbackLeaderboard();
    }

    throw error;
  }
}

export async function getLatestTournamentData() {
  try {
    await ensureTournamentBots();

    const tournament = await prisma.aITournament.findFirst({
      orderBy: { createdAt: "desc" },
      include: {
        winner: { select: { id: true, name: true, elo: true } },
        matches: {
          include: {
            player1: { select: { id: true, name: true, elo: true, personality: true, matchWins: true, matchLosses: true, winsTotal: true } },
            player2: { select: { id: true, name: true, elo: true, personality: true, matchWins: true, matchLosses: true, winsTotal: true } },
            winner: { select: { id: true, name: true, elo: true } },
          },
          orderBy: [{ round: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    return {
      tournament: serializeTournament(tournament),
      leaderboard: await getTournamentLeaderboard(),
    };
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return {
        tournament: null,
        leaderboard: fallbackLeaderboard(),
      };
    }

    throw error;
  }
}

export async function getFinishedTournaments() {
  try {
    await ensureTournamentBots();

    const tournaments = await prisma.aITournament.findMany({
      where: { status: "FINISHED" },
      include: {
        winner: { select: { id: true, name: true, elo: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return tournaments.map((tournament) => ({
      ...tournament,
      startDate: serializeDate(tournament.startDate),
      endDate: serializeDate(tournament.endDate),
      createdAt: serializeDate(tournament.createdAt),
      updatedAt: serializeDate(tournament.updatedAt),
      endedAt: serializeDate(tournament.endedAt),
    }));
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return [];
    }

    throw error;
  }
}

export async function getArchivedTournament(id: string) {
  try {
    const tournament = await loadTournament(id);

    if (!tournament || tournament.status !== "FINISHED") {
      return null;
    }

    return serializeTournament(tournament);
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return null;
    }

    throw error;
  }
}

export async function startTournament() {
  const bots = await ensureTournamentBots();

  if (bots.length < 8) {
    throw new Error("No hay suficientes motores registrados para iniciar el torneo.");
  }

  await prisma.aITournament.updateMany({
    where: {
      status: {
        in: ["PENDING", "ACTIVE"],
      },
    },
    data: {
      status: "FINISHED",
      endedAt: new Date(),
      endDate: new Date(),
    },
  });

  const participants = shuffle(bots).slice(0, 8);

  const tournament = await prisma.aITournament.create({
    data: {
      status: "PENDING",
      matches: {
        create: [0, 2, 4, 6].map((index) => ({
          round: 1,
          player1Id: participants[index].id,
          player2Id: participants[index + 1].id,
          status: "PENDING",
          fen: INITIAL_FEN,
          moves: [],
          lastMoveAt: null,
        })),
      },
    },
  });

  return loadTournament(tournament.id);
}

function resolveWinnerId(game: Chess, player1Id: string, player2Id: string, player1Elo: number, player2Elo: number) {
  if (game.isCheckmate()) {
    return game.turn() === "w" ? player2Id : player1Id;
  }

  if (game.isDraw()) {
    return player1Elo >= player2Elo ? player1Id : player2Id;
  }

  return null;
}

async function finishTournament(tournamentId: string, winnerId: string) {
  const now = new Date();

  await prisma.$transaction([
    prisma.aITournament.update({
      where: { id: tournamentId },
      data: {
        status: "FINISHED",
        winnerId,
        endedAt: now,
        endDate: now,
      },
    }),
    prisma.chessBot.update({
      where: { id: winnerId },
      data: {
        winsTotal: { increment: 1 },
        elo: { increment: 12 },
      },
    }),
  ]);

  await settleTournamentBets(tournamentId);
}

async function updateMatchLearning(input: {
  tournamentId: string;
  player1Id: string;
  player2Id: string;
  winnerId: string | null;
  fen: string;
  moves: TournamentMove[];
}) {
  const loserId = input.winnerId
    ? input.winnerId === input.player1Id
      ? input.player2Id
      : input.player1Id
    : null;

  const updates = [
    prisma.chessBot.update({
      where: { id: input.player1Id },
      data: {
        matchesPlayed: { increment: 1 },
        ...(input.winnerId === input.player1Id
          ? { matchWins: { increment: 1 }, elo: { increment: 4 } }
          : input.winnerId === input.player2Id
            ? { matchLosses: { increment: 1 }, elo: { decrement: 2 } }
            : {}),
      },
    }),
    prisma.chessBot.update({
      where: { id: input.player2Id },
      data: {
        matchesPlayed: { increment: 1 },
        ...(input.winnerId === input.player2Id
          ? { matchWins: { increment: 1 }, elo: { increment: 4 } }
          : input.winnerId === input.player1Id
            ? { matchLosses: { increment: 1 }, elo: { decrement: 2 } }
            : {}),
      },
    }),
  ];

  await prisma.$transaction(updates);

  const notes = {
    tournamentId: input.tournamentId,
    result: input.winnerId ? "decisive" : "draw",
    winnerId: input.winnerId,
    loserId,
    moveCount: input.moves.length,
    lastFiveMoves: input.moves.slice(-5).map((move) => move.move),
  };

  await Promise.all([
    prisma.aIBotMatchupMemory.upsert({
      where: { botId_opponentId: { botId: input.player1Id, opponentId: input.player2Id } },
      update: {
        games: { increment: 1 },
        wins: input.winnerId === input.player1Id ? { increment: 1 } : undefined,
        losses: input.winnerId === input.player2Id ? { increment: 1 } : undefined,
        draws: input.winnerId ? undefined : { increment: 1 },
        tacticalNotes: notes,
        styleBias: { pressure: input.winnerId === input.player2Id ? 1 : 0, patience: input.moves.length > 70 ? 1 : 0 },
        lastFen: input.fen,
      },
      create: {
        botId: input.player1Id,
        opponentId: input.player2Id,
        games: 1,
        wins: input.winnerId === input.player1Id ? 1 : 0,
        losses: input.winnerId === input.player2Id ? 1 : 0,
        draws: input.winnerId ? 0 : 1,
        tacticalNotes: notes,
        styleBias: { pressure: input.winnerId === input.player2Id ? 1 : 0, patience: input.moves.length > 70 ? 1 : 0 },
        lastFen: input.fen,
      },
    }),
    prisma.aIBotMatchupMemory.upsert({
      where: { botId_opponentId: { botId: input.player2Id, opponentId: input.player1Id } },
      update: {
        games: { increment: 1 },
        wins: input.winnerId === input.player2Id ? { increment: 1 } : undefined,
        losses: input.winnerId === input.player1Id ? { increment: 1 } : undefined,
        draws: input.winnerId ? undefined : { increment: 1 },
        tacticalNotes: notes,
        styleBias: { pressure: input.winnerId === input.player1Id ? 1 : 0, patience: input.moves.length > 70 ? 1 : 0 },
        lastFen: input.fen,
      },
      create: {
        botId: input.player2Id,
        opponentId: input.player1Id,
        games: 1,
        wins: input.winnerId === input.player2Id ? 1 : 0,
        losses: input.winnerId === input.player1Id ? 1 : 0,
        draws: input.winnerId ? 0 : 1,
        tacticalNotes: notes,
        styleBias: { pressure: input.winnerId === input.player1Id ? 1 : 0, patience: input.moves.length > 70 ? 1 : 0 },
        lastFen: input.fen,
      },
    }),
  ]);
}

async function advanceTournament(tournamentId: string) {
  const matches = await prisma.aITournamentMatch.findMany({
    where: { tournamentId },
    orderBy: [{ round: "asc" }, { createdAt: "asc" }],
  });

  if (matches.some((match) => match.status === "ACTIVE" || match.status === "PENDING")) {
    return;
  }

  const lastRound = Math.max(0, ...matches.map((match) => match.round));
  const lastRoundWinners = matches
    .filter((match) => match.round === lastRound && match.winnerId)
    .map((match) => match.winnerId as string);

  if (lastRoundWinners.length === 1) {
    await finishTournament(tournamentId, lastRoundWinners[0]);
    return;
  }

  if (lastRoundWinners.length < 2) {
    return;
  }

  const nextRound = lastRound + 1;
  const existingNextRound = await prisma.aITournamentMatch.count({
    where: {
      tournamentId,
      round: nextRound,
    },
  });

  if (existingNextRound > 0) {
    return;
  }

  await prisma.aITournamentMatch.createMany({
      data: Array.from({ length: Math.floor(lastRoundWinners.length / 2) }, (_, index) => ({
      tournamentId,
      round: nextRound,
      player1Id: lastRoundWinners[index * 2],
      player2Id: lastRoundWinners[index * 2 + 1],
      status: "PENDING",
      fen: INITIAL_FEN,
      moves: [],
      lastMoveAt: null,
    })),
  });
}

async function activateNextMatch(tournamentId: string) {
  const pending = await prisma.aITournamentMatch.findFirst({
    where: {
      tournamentId,
      status: "PENDING",
    },
    orderBy: [{ round: "asc" }, { createdAt: "asc" }],
  });

  if (!pending) {
    await advanceTournament(tournamentId);
    return null;
  }

  return prisma.aITournamentMatch.update({
    where: { id: pending.id },
    data: {
      status: "ACTIVE",
      lastMoveAt: new Date(),
    },
    include: {
      tournament: true,
      player1: true,
      player2: true,
    },
  });
}

export async function playTournamentMove() {
  await ensureTournamentBots();

  let match = await prisma.aITournamentMatch.findFirst({
    where: {
      status: "ACTIVE",
      tournament: {
        status: "ACTIVE",
      },
    },
    include: {
      tournament: true,
      player1: true,
      player2: true,
    },
    orderBy: [{ round: "asc" }, { updatedAt: "asc" }],
  });

  if (!match) {
    let activeTournament = await prisma.aITournament.findFirst({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });

    if (!activeTournament) {
      const pendingTournament = await prisma.aITournament.findFirst({
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
      });

      if (!pendingTournament) {
        return { message: "No hay torneos activos.", tournament: null };
      }

      activeTournament = await prisma.aITournament.update({
        where: { id: pendingTournament.id },
        data: { status: "ACTIVE", startDate: new Date() },
      });
    }

    match = await activateNextMatch(activeTournament.id);
  }

  if (!match) {
    return { message: "No hay partidas pendientes.", tournament: null };
  }

  const game = new Chess(match.fen || INITIAL_FEN);

  if (game.isGameOver()) {
    const winnerId = resolveWinnerId(game, match.player1Id, match.player2Id, match.player1.elo, match.player2.elo);

    await prisma.aITournamentMatch.update({
      where: { id: match.id },
      data: {
        status: "FINISHED",
        winnerId,
      },
    });
    await updateMatchLearning({
      tournamentId: match.tournamentId,
      player1Id: match.player1Id,
      player2Id: match.player2Id,
      winnerId,
      fen: game.fen(),
      moves: normalizeMoves(match.moves),
    });
    await settleTournamentBets(match.tournamentId);
    await advanceTournament(match.tournamentId);

    return { message: `Partida ${match.id} finalizada.`, tournament: serializeTournament(await loadTournament(match.tournamentId)) };
  }

  const currentBot = game.turn() === "w" ? match.player1 : match.player2;
  const opponentBot = game.turn() === "w" ? match.player2 : match.player1;
  const memory = await prisma.aIBotMatchupMemory.findUnique({
    where: { botId_opponentId: { botId: currentBot.id, opponentId: opponentBot.id } },
    select: { games: true, wins: true, losses: true },
  });
  const memoryAdjustment = memory && memory.games >= 2
    ? Math.max(-90, Math.min(70, (memory.wins - memory.losses) * 18))
    : 0;

  const engineMove = searchBestMove(game, {
    depth: currentBot.elo + memoryAdjustment >= 1700 ? 4 : 3,
    maxNodes: currentBot.elo + memoryAdjustment >= 1700 ? 140_000 : 80_000,
    timeLimitMs: currentBot.elo + memoryAdjustment >= 1700 ? 1_700 : 1_000,
    elo: currentBot.elo + memoryAdjustment,
    style: currentBot.personality as EngineStyle,
  });

  if (!engineMove) {
    throw new Error("El motor no encontró movimientos legales.");
  }

  const move = game.move({
    from: engineMove.from,
    to: engineMove.to,
    promotion: engineMove.promotion ?? "q",
  }) as { san: string } | null;

  if (!move) {
    throw new Error(`El motor propuso un movimiento ilegal: ${engineMove.san}`);
  }

  const now = new Date();
  const nextMoves = [
    ...normalizeMoves(match.moves),
    {
      move: move.san,
      timestamp: now.toISOString(),
      fen: game.fen(),
      score: engineMove.score,
      depth: engineMove.depth,
    },
  ];

  const isOver = game.isGameOver();
  const winnerId = isOver
    ? resolveWinnerId(game, match.player1Id, match.player2Id, match.player1.elo, match.player2.elo)
    : null;

  await prisma.aITournamentMatch.update({
    where: { id: match.id },
    data: {
      fen: game.fen(),
      pgn: game.pgn(),
      moves: nextMoves,
      lastMoveAt: now,
      status: isOver ? "FINISHED" : "ACTIVE",
      winnerId,
    },
  });

  if (isOver) {
    await updateMatchLearning({
      tournamentId: match.tournamentId,
      player1Id: match.player1Id,
      player2Id: match.player2Id,
      winnerId,
      fen: game.fen(),
      moves: nextMoves,
    });
    await settleTournamentBets(match.tournamentId);
    await advanceTournament(match.tournamentId);
  }

  return {
    message: `Movimiento ${move.san} realizado por ${currentBot.name}.`,
    tournament: serializeTournament(await loadTournament(match.tournamentId)),
  };
}
