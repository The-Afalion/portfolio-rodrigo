import { NextResponse } from "next/server";
import {
  cancelDrawOffer,
  offerOrAcceptDraw,
  resignChessGame,
  serializeChessGameForUser,
} from "@/lib/chess-game-server";
import { getAuthenticatedChessUser } from "@/lib/chess-social";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: { gameId: string } }) {
  const user = await getAuthenticatedChessUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const action = typeof payload?.action === "string" ? payload.action : "";

  const result =
    action === "resign"
      ? await resignChessGame(params.gameId, user.id)
      : action === "offer_draw"
        ? await offerOrAcceptDraw(params.gameId, user.id)
        : action === "cancel_draw"
          ? await cancelDrawOffer(params.gameId, user.id)
          : { error: "Acción no reconocida.", status: 400 as const };

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const game = await serializeChessGameForUser(params.gameId, user.id);

  return NextResponse.json({
    ...result,
    game,
  });
}
