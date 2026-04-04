import { NextResponse } from "next/server";
import { getAuthenticatedChessUser } from "@/lib/chess-social";
import { serializeChessGameForUser } from "@/lib/chess-game-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: { gameId: string } }) {
  const user = await getAuthenticatedChessUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const game = await serializeChessGameForUser(params.gameId, user.id);

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  return NextResponse.json(game);
}
