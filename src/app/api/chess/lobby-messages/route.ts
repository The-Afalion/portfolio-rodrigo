import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureProfileForUserSafely, getUserDisplayName } from "@/lib/profile";
import { getAuthenticatedChessUser } from "@/lib/chess-social";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_MESSAGES = 60;

function serializeMessage(message: {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: Date;
}) {
  return {
    id: message.id,
    senderId: message.senderId,
    senderName: message.senderName,
    content: message.content,
    timestamp: message.createdAt.getTime(),
    type: "chat" as const,
  };
}

export async function GET() {
  const user = await getAuthenticatedChessUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const messages = await prisma.lobbyMessage.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: MAX_MESSAGES,
    });

    return NextResponse.json({
      messages: messages.reverse().map(serializeMessage),
    });
  } catch (error) {
    console.warn("Database error fetching lobby messages, returning empty list:", error);
    return NextResponse.json({
      messages: [],
    });
  }
}

export async function POST(request: Request) {
  const user = await getAuthenticatedChessUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const content = typeof payload?.content === "string" ? payload.content.trim() : "";

  if (!content) {
    return NextResponse.json({ error: "El mensaje no puede estar vacío." }, { status: 400 });
  }

  if (content.length > 400) {
    return NextResponse.json(
      { error: "El mensaje es demasiado largo. Máximo 400 caracteres." },
      { status: 400 }
    );
  }

  await ensureProfileForUserSafely(user);

  try {
    const message = await prisma.lobbyMessage.create({
      data: {
        content,
        senderId: user.id,
        senderName: getUserDisplayName(user),
      },
    });

    return NextResponse.json({
      message: serializeMessage(message),
    });
  } catch (error) {
    console.warn("Database error creating lobby message, returning simulated response:", error);
    return NextResponse.json({
      message: {
        id: "offline-" + Date.now(),
        senderId: user.id,
        senderName: getUserDisplayName(user),
        content,
        timestamp: Date.now(),
        type: "chat" as const,
      },
    });
  }
}
