import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedChessUser } from "@/lib/chess-social";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getAuthenticatedChessUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const invitationId = typeof payload?.invitationId === "string" ? payload.invitationId : "";

  if (!invitationId) {
    return NextResponse.json({ error: "Falta la invitación." }, { status: 400 });
  }

  try {
    const accepted = await prisma.$transaction(async (tx) => {
      const invitation = await tx.gameInvitation.findFirst({
        where: {
          id: invitationId,
          inviteeId: user.id,
          status: "PENDING",
        },
        include: { game: true },
      });

      if (!invitation) {
        return null;
      }

      await tx.gameInvitation.update({
        where: {
          id: invitationId,
        },
        data: {
          status: "ACCEPTED",
        },
      });

      const game = invitation.game
        ? await tx.chessGame.update({
            where: {
              id: invitation.game.id,
            },
            data: {
              status: "IN_PROGRESS",
              currentTurnStartedAt: new Date(),
            },
          })
        : null;

      return { invitation, game };
    });

    if (!accepted) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    return NextResponse.json({ gameId: accepted.game?.id ?? accepted.invitation.game?.id ?? null });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    );
  }
}
