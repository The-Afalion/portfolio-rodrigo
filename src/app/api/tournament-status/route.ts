import { NextResponse } from "next/server";
import { getLatestTournamentData } from "@/lib/ai-tournament-server";
import { getBettingMarkets } from "@/lib/tournament-betting";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await getLatestTournamentData();
    return NextResponse.json({
      ...data,
      betting: getBettingMarkets(data.tournament, null),
    });
  } catch (error) {
    console.error("No se pudo leer el estado del torneo:", error);
    return NextResponse.json({ tournament: null, leaderboard: [] }, { status: 500 });
  }
}
