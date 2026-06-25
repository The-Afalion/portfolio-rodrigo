import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { ensureProfileForUser, getUserDisplayName } from "@/lib/profile";
import { listSupabaseUsersByIds } from "@/lib/supabase-admin";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const GAMES = [
  { key: "chrono-dasher", label: "Chrono Dasher" },
  { key: "physics-pachinko", label: "Pachinko" },
  { key: "physics-pinball", label: "Pinball" },
] as const;

type GameKey = (typeof GAMES)[number]["key"];

function isGameKey(value: unknown): value is GameKey {
  return typeof value === "string" && GAMES.some((game) => game.key === value);
}

function shortName(userId: string) {
  return `Piloto-${userId.slice(0, 5)}`;
}

async function currentUser() {
  try {
    const supabase = createClient(cookies());
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user ?? null;
  } catch {
    return null;
  }
}

async function namesFor(userIds: string[]) {
  const uniqueIds = Array.from(new Set(userIds));
  const names = new Map(uniqueIds.map((id) => [id, shortName(id)]));

  try {
    const users = await listSupabaseUsersByIds(uniqueIds);
    users.forEach((user) => names.set(user.id, getUserDisplayName(user)));
  } catch {
    // The leaderboard still works without the service role key; short IDs are enough as fallback.
  }

  return names;
}

async function leaderboardFor(gameKey: GameKey) {
  const rows = await prisma.arcadeScore.findMany({
    where: { gameKey, bestScore: { gt: 0 } },
    orderBy: [{ bestScore: "desc" }, { updatedAt: "asc" }],
    take: 10,
  });
  const names = await namesFor(rows.map((row) => row.userId));

  return rows.map((row, index) => ({
    rank: index + 1,
    userId: row.userId,
    name: names.get(row.userId) ?? shortName(row.userId),
    bestScore: row.bestScore,
    lastScore: row.lastScore,
    attempts: row.attempts,
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestedGame = url.searchParams.get("gameKey");
  const user = await currentUser();

  try {
    if (requestedGame) {
      if (!isGameKey(requestedGame)) {
        return NextResponse.json({ error: "Juego no soportado." }, { status: 400 });
      }

      const [personal, leaderboard] = await Promise.all([
        user
          ? prisma.arcadeScore.findUnique({
              where: { userId_gameKey: { userId: user.id, gameKey: requestedGame } },
            })
          : null,
        leaderboardFor(requestedGame),
      ]);

      return NextResponse.json({
        gameKey: requestedGame,
        label: GAMES.find((game) => game.key === requestedGame)?.label ?? requestedGame,
        personalBest: personal?.bestScore ?? 0,
        attempts: personal?.attempts ?? 0,
        leaderboard,
      });
    }

    const personalRows = user
      ? await prisma.arcadeScore.findMany({
          where: { userId: user.id },
        })
      : [];
    const personalByGame = new Map(personalRows.map((row) => [row.gameKey, row]));
    const games = await Promise.all(
      GAMES.map(async (game) => ({
        gameKey: game.key,
        label: game.label,
        personalBest: personalByGame.get(game.key)?.bestScore ?? 0,
        attempts: personalByGame.get(game.key)?.attempts ?? 0,
        leaderboard: await leaderboardFor(game.key),
      }))
    );

    return NextResponse.json({ games });
  } catch (error) {
    console.error("Error loading arcade scores:", error);
    return NextResponse.json({ error: "Ranking no disponible." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !isGameKey(body.gameKey) || typeof body.score !== "number") {
    return NextResponse.json({ error: "Puntuación no válida." }, { status: 400 });
  }

  const score = Math.max(0, Math.floor(body.score));

  try {
    await ensureProfileForUser(user);
    const existing = await prisma.arcadeScore.findUnique({
      where: { userId_gameKey: { userId: user.id, gameKey: body.gameKey } },
    });

    if (!existing) {
      const created = await prisma.arcadeScore.create({
        data: {
          userId: user.id,
          gameKey: body.gameKey,
          bestScore: score,
          lastScore: score,
          attempts: 1,
        },
      });

      return NextResponse.json({ personalBest: created.bestScore, improved: score > 0 });
    }

    const nextBest = Math.max(existing.bestScore, score);
    const saved = await prisma.arcadeScore.update({
      where: { id: existing.id },
      data: {
        bestScore: nextBest,
        lastScore: score,
        attempts: { increment: 1 },
      },
    });

    return NextResponse.json({
      personalBest: saved.bestScore,
      improved: nextBest > existing.bestScore,
    });
  } catch (error) {
    console.error("Error saving arcade score:", error);
    return NextResponse.json({ error: "No se pudo guardar la puntuación." }, { status: 500 });
  }
}
