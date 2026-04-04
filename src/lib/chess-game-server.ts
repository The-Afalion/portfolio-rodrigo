import "server-only";

import { Chess } from "chess.js";
import prisma from "@/lib/prisma";
import { buildDisplayNameMap } from "@/lib/chess-social";
import { formatDurationMs, formatRemainingDays, getChessModeConfig } from "@/lib/chess-modes";

type DbGame = Awaited<ReturnType<typeof loadGame>>;

export async function loadGame(gameId: string) {
  return prisma.chessGame.findUnique({
    where: {
      id: gameId,
    },
  });
}

function getPlayerColor(game: NonNullable<DbGame>, userId: string) {
  if (game.whitePlayerId === userId) {
    return "w" as const;
  }

  if (game.blackPlayerId === userId) {
    return "b" as const;
  }

  return null;
}

function getTimeoutResult(forPlayer: "w" | "b") {
  return forPlayer === "w" ? "0-1" : "1-0";
}

function getResultFromGame(chess: Chess) {
  if (chess.isCheckmate()) {
    return chess.turn() === "w" ? "0-1" : "1-0";
  }

  return "1/2-1/2";
}

function computeActiveRealtimeSnapshot(game: NonNullable<DbGame>) {
  if (!game.currentTurnStartedAt) {
    return {
      whiteTimeMs: game.whiteTimeMs,
      blackTimeMs: game.blackTimeMs,
      expiredColor: null as "w" | "b" | null,
    };
  }

  const chess = new Chess(game.fen ?? undefined);
  const activeTurn = chess.turn() as "w" | "b";
  const elapsed = Date.now() - game.currentTurnStartedAt.getTime();
  const whiteBase = game.whiteTimeMs ?? game.initialTimeMs ?? 0;
  const blackBase = game.blackTimeMs ?? game.initialTimeMs ?? 0;

  const whiteTimeMs = activeTurn === "w" ? whiteBase - elapsed : whiteBase;
  const blackTimeMs = activeTurn === "b" ? blackBase - elapsed : blackBase;

  return {
    whiteTimeMs,
    blackTimeMs,
    expiredColor: (whiteTimeMs <= 0 ? "w" : blackTimeMs <= 0 ? "b" : null) as "w" | "b" | null,
  };
}

async function expireGameIfNeeded(game: NonNullable<DbGame>) {
  if (game.status !== "IN_PROGRESS" || !game.currentTurnStartedAt) {
    return game;
  }

  if (game.timeControlType === "REALTIME") {
    const snapshot = computeActiveRealtimeSnapshot(game);

    if (snapshot.expiredColor) {
      return prisma.chessGame.update({
        where: { id: game.id },
        data: {
          status: "COMPLETED",
          result: getTimeoutResult(snapshot.expiredColor),
          whiteTimeMs: Math.max(0, snapshot.whiteTimeMs ?? 0),
          blackTimeMs: Math.max(0, snapshot.blackTimeMs ?? 0),
          currentTurnStartedAt: null,
        },
      });
    }

    return game;
  }

  if (game.timeControlType === "CORRESPONDENCE" && game.correspondenceTurnMs && game.currentTurnStartedAt) {
    const deadline = game.currentTurnStartedAt.getTime() + game.correspondenceTurnMs;

    if (Date.now() > deadline) {
      const chess = new Chess(game.fen ?? undefined);
      return prisma.chessGame.update({
        where: { id: game.id },
        data: {
          status: "COMPLETED",
          result: getTimeoutResult(chess.turn() as "w" | "b"),
          currentTurnStartedAt: null,
        },
      });
    }
  }

  return game;
}

export async function serializeChessGameForUser(gameId: string, userId: string) {
  const loadedGame = await loadGame(gameId);

  if (!loadedGame) {
    return null;
  }

  const game = await expireGameIfNeeded(loadedGame);
  const playerColor = getPlayerColor(game, userId);

  if (!playerColor) {
    return null;
  }

  const names = await buildDisplayNameMap(
    [game.whitePlayerId, game.blackPlayerId].filter((value): value is string => Boolean(value))
  );

  const chess = new Chess(game.fen ?? undefined);
  const modeConfig = getChessModeConfig(game.modeKey);
  const realtimeSnapshot =
    game.timeControlType === "REALTIME" ? computeActiveRealtimeSnapshot(game) : null;
  const deadlineAt =
    game.timeControlType === "CORRESPONDENCE" && game.currentTurnStartedAt && game.correspondenceTurnMs
      ? new Date(game.currentTurnStartedAt.getTime() + game.correspondenceTurnMs)
      : null;

  return {
    id: game.id,
    fen: chess.fen(),
    moves: game.moves,
    status: game.status,
    result: game.result,
    turn: chess.turn() as "w" | "b",
    playerColor,
    whitePlayerId: game.whitePlayerId,
    blackPlayerId: game.blackPlayerId,
    whitePlayerName: game.whitePlayerId ? names.get(game.whitePlayerId) ?? "Blancas" : "Blancas",
    blackPlayerName: game.blackPlayerId ? names.get(game.blackPlayerId) ?? "Negras" : "Negras",
    modeKey: game.modeKey,
    modeLabel: game.modeLabel,
    modeDescription: modeConfig.description,
    timeControlType: game.timeControlType,
    initialTimeMs: game.initialTimeMs,
    whiteTimeMs: realtimeSnapshot ? Math.max(0, realtimeSnapshot.whiteTimeMs ?? 0) : null,
    blackTimeMs: realtimeSnapshot ? Math.max(0, realtimeSnapshot.blackTimeMs ?? 0) : null,
    whiteClockLabel:
      realtimeSnapshot?.whiteTimeMs != null ? formatDurationMs(Math.max(0, realtimeSnapshot.whiteTimeMs)) : null,
    blackClockLabel:
      realtimeSnapshot?.blackTimeMs != null ? formatDurationMs(Math.max(0, realtimeSnapshot.blackTimeMs)) : null,
    correspondenceTurnMs: game.correspondenceTurnMs,
    deadlineAt: deadlineAt?.toISOString() ?? null,
    deadlineLabel:
      deadlineAt && game.currentTurnStartedAt
        ? formatRemainingDays(deadlineAt.getTime() - Date.now())
        : null,
    currentTurnStartedAt: game.currentTurnStartedAt?.toISOString() ?? null,
    createdAt: game.createdAt.toISOString(),
    updatedAt: game.updatedAt.toISOString(),
  };
}

export async function applyMoveToGame(gameId: string, userId: string, moveInput: { from: string; to: string; promotion?: string }) {
  const existingGame = await loadGame(gameId);

  if (!existingGame) {
    return { error: "Partida no encontrada.", status: 404 as const };
  }

  const game = await expireGameIfNeeded(existingGame);
  const playerColor = getPlayerColor(game, userId);

  if (!playerColor) {
    return { error: "No perteneces a esta partida.", status: 403 as const };
  }

  if (game.status !== "IN_PROGRESS") {
    return { error: "La partida no está en curso.", status: 409 as const };
  }

  const chess = new Chess(game.fen ?? undefined);
  const turn = chess.turn() as "w" | "b";

  if (turn !== playerColor) {
    return { error: "No es tu turno.", status: 409 as const };
  }

  const now = new Date();
  let nextWhiteTime = game.whiteTimeMs ?? game.initialTimeMs ?? null;
  let nextBlackTime = game.blackTimeMs ?? game.initialTimeMs ?? null;

  if (game.timeControlType === "REALTIME") {
    if (!game.currentTurnStartedAt) {
      return { error: "El reloj aún no se ha iniciado.", status: 409 as const };
    }

    const elapsed = now.getTime() - game.currentTurnStartedAt.getTime();

    if (playerColor === "w" && nextWhiteTime != null) {
      nextWhiteTime -= elapsed;
      if (nextWhiteTime <= 0) {
        await prisma.chessGame.update({
          where: { id: game.id },
          data: {
            status: "COMPLETED",
            result: "0-1",
            whiteTimeMs: 0,
            currentTurnStartedAt: null,
          },
        });
        return { error: "Se te ha agotado el tiempo.", status: 409 as const };
      }
      nextWhiteTime += game.incrementMs;
    }

    if (playerColor === "b" && nextBlackTime != null) {
      nextBlackTime -= elapsed;
      if (nextBlackTime <= 0) {
        await prisma.chessGame.update({
          where: { id: game.id },
          data: {
            status: "COMPLETED",
            result: "1-0",
            blackTimeMs: 0,
            currentTurnStartedAt: null,
          },
        });
        return { error: "Se te ha agotado el tiempo.", status: 409 as const };
      }
      nextBlackTime += game.incrementMs;
    }
  }

  if (game.timeControlType === "CORRESPONDENCE" && game.currentTurnStartedAt && game.correspondenceTurnMs) {
    const deadline = game.currentTurnStartedAt.getTime() + game.correspondenceTurnMs;

    if (now.getTime() > deadline) {
      await prisma.chessGame.update({
        where: { id: game.id },
        data: {
          status: "COMPLETED",
          result: getTimeoutResult(playerColor),
          currentTurnStartedAt: null,
        },
      });
      return { error: "Tu turno por correspondencia ha caducado.", status: 409 as const };
    }
  }

  const move = chess.move({
    from: moveInput.from,
    to: moveInput.to,
    promotion: moveInput.promotion ?? "q",
  });

  if (!move) {
    return { error: "Movimiento ilegal.", status: 400 as const };
  }

  const isGameOver = chess.isGameOver();
  const nextStatus = isGameOver ? "COMPLETED" : "IN_PROGRESS";
  const nextResult = isGameOver ? getResultFromGame(chess) : null;

  await prisma.chessGame.update({
    where: {
      id: game.id,
    },
    data: {
      fen: chess.fen(),
      moves: chess.pgn(),
      status: nextStatus,
      result: nextResult,
      whiteTimeMs: nextWhiteTime,
      blackTimeMs: nextBlackTime,
      currentTurnStartedAt: isGameOver ? null : now,
    },
  });

  return { success: true as const };
}
