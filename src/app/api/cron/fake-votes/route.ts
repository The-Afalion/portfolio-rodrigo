import { NextResponse } from "next/server";
import { buildSyntheticVotePlan, ensureCommunityGame, ensureSyntheticVotes } from "@/lib/community-chess";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.NODE_ENV === "production" && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const game = await ensureCommunityGame();
    const votePlan = buildSyntheticVotePlan(game.fen);
    const storedVotes = await ensureSyntheticVotes(game.id, game.fen);

    return NextResponse.json({
      success: true,
      generatedVotes: storedVotes.length,
      plan: votePlan,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
