import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { buildDisplayNameMap, getAuthenticatedChessUser } from "@/lib/chess-social";
import { getChessModeConfig } from "@/lib/chess-modes";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function resultLabel(result: string | null, userColor: "w" | "b" | null) {
  if (!result) {
    return "En curso";
  }

  if (result === "1/2-1/2") {
    return "Tablas";
  }

  if (!userColor) {
    return result;
  }

  const userWon = (result === "1-0" && userColor === "w") || (result === "0-1" && userColor === "b");
  return userWon ? "Victoria" : "Derrota";
}

export async function GET() {
  const user = await getAuthenticatedChessUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const games = await prisma.chessGame.findMany({
    where: {
      OR: [{ whitePlayerId: user.id }, { blackPlayerId: user.id }],
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 60,
  });

  const participantIds = games.flatMap((game) => [game.whitePlayerId, game.blackPlayerId]).filter(Boolean) as string[];
  const names = await buildDisplayNameMap(participantIds);

  return NextResponse.json({
    games: games.map((game) => {
      const userColor = game.whitePlayerId === user.id ? "w" : game.blackPlayerId === user.id ? "b" : null;
      const opponentId = userColor === "w" ? game.blackPlayerId : game.whitePlayerId;
      const mode = getChessModeConfig(game.modeKey);

      return {
        id: game.id,
        status: game.status,
        result: game.result,
        resultLabel: resultLabel(game.result, userColor),
        modeLabel: game.modeLabel || mode.label,
        opponentId,
        opponentName: opponentId ? names.get(opponentId) ?? `Jugador ${opponentId.slice(0, 6)}` : "Rival",
        color: userColor,
        createdAt: game.createdAt.toISOString(),
        updatedAt: game.updatedAt.toISOString(),
      };
    }),
  });
}
