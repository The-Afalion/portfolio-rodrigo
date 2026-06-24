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
    const result = await prisma.gameInvitation.updateMany({
      where: {
        id: invitationId,
        inviteeId: user.id,
        status: "PENDING",
      },
      data: {
        status: "DECLINED",
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Invitation declined" });
  } catch (error) {
    console.error("Error declining invitation:", error);
    return NextResponse.json(
      { error: "Failed to decline invitation" },
      { status: 500 }
    );
  }
}
