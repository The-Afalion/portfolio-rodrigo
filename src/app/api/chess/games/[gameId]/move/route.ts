import { NextResponse } from "next/server";
import { applyMoveToGame, serializeChessGameForUser } from "@/lib/chess-game-server";
import { getAuthenticatedChessUser } from "@/lib/chess-social";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: { gameId: string } }) {
  const user = await getAuthenticatedChessUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const from = typeof payload?.from === "string" ? payload.from : "";
  const to = typeof payload?.to === "string" ? payload.to : "";
  const promotion = typeof payload?.promotion === "string" ? payload.promotion : "q";

  if (!from || !to) {
    return NextResponse.json({ error: "Movimiento incompleto." }, { status: 400 });
  }

  const result = await applyMoveToGame(params.gameId, user.id, { from, to, promotion });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const game = await serializeChessGameForUser(params.gameId, user.id);

  return NextResponse.json({ success: true, game });
}
