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
  const friendshipId = typeof payload?.friendshipId === "string" ? payload.friendshipId.trim() : "";

  if (!friendshipId) {
    return NextResponse.json({ error: "Falta la solicitud." }, { status: 400 });
  }

  const friendship = await prisma.friendship.updateMany({
    where: {
      id: friendshipId,
      addresseeId: user.id,
      status: "PENDING",
    },
    data: {
      status: "ACCEPTED",
      acceptedAt: new Date(),
    },
  });

  if (friendship.count === 0) {
    return NextResponse.json({ error: "No se pudo aceptar la solicitud." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
