import { NextResponse } from "next/server";
import { playTournamentMove } from "@/lib/ai-tournament-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.NODE_ENV === "production" && authHeader !== `Bearer ${process.env.CRON_SECRET_MOVE}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    return NextResponse.json(await playTournamentMove());
  } catch (error) {
    console.error("No se pudo ejecutar la jugada del torneo:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "No se pudo ejecutar la jugada del torneo." },
      { status: 500 }
    );
  }
}

