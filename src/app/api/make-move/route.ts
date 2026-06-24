import { NextResponse } from "next/server";
import { playTournamentMove } from "@/lib/ai-tournament-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function handleMove() {
  try {
    return NextResponse.json(await playTournamentMove());
  } catch (error) {
    console.error("No se pudo avanzar el torneo:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "No se pudo avanzar el torneo." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return handleMove();
}

export async function POST() {
  return handleMove();
}

