import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedChessUser } from "@/lib/chess-social";
import { ensureProfileForUserSafely, getUserDisplayName } from "@/lib/profile";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_MESSAGES = 120;

async function loadParticipantGame(gameId: string, userId: string) {
  return prisma.chessGame.findFirst({
    where: {
      id: gameId,
      OR: [{ whitePlayerId: userId }, { blackPlayerId: userId }],
    },
    select: {
      id: true,
      whitePlayerId: true,
      blackPlayerId: true,
    },
  });
}

function serializeMessage(message: {
  id: string;
  senderId: string;
  content: string;
  createdAt: Date;
}) {
  return {
    id: message.id,
    senderId: message.senderId,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
    timestamp: message.createdAt.getTime(),
  };
}

export async function GET(_request: Request, { params }: { params: { gameId: string } }) {
  const user = await getAuthenticatedChessUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const game = await loadParticipantGame(params.gameId, user.id);

  if (!game) {
    return NextResponse.json({ error: "Partida no disponible." }, { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: {
      gameId: params.gameId,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: MAX_MESSAGES,
  });

  return NextResponse.json({
    messages: messages.map(serializeMessage),
  });
}

export async function POST(request: Request, { params }: { params: { gameId: string } }) {
  const user = await getAuthenticatedChessUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const game = await loadParticipantGame(params.gameId, user.id);

  if (!game) {
    return NextResponse.json({ error: "No puedes escribir en esta partida." }, { status: 404 });
  }

  const payload = await request.json().catch(() => null);
  const content = typeof payload?.content === "string" ? payload.content.trim() : "";

  if (!content) {
    return NextResponse.json({ error: "El mensaje no puede estar vacío." }, { status: 400 });
  }

  if (content.length > 500) {
    return NextResponse.json({ error: "El mensaje es demasiado largo." }, { status: 400 });
  }

  await ensureProfileForUserSafely(user);

  const message = await prisma.message.create({
    data: {
      gameId: params.gameId,
      senderId: user.id,
      content,
    },
  });

  return NextResponse.json({
    message: {
      ...serializeMessage(message),
      senderName: getUserDisplayName(user),
    },
  });
}
