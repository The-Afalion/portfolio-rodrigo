import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedChessUser } from "@/lib/chess-social";
import { ensureProfileForUserSafely, getUserDisplayName } from "@/lib/profile";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function loadFriendshipForUser(friendshipId: string, userId: string) {
  return prisma.friendship.findFirst({
    where: {
      id: friendshipId,
      status: "ACCEPTED",
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
  });
}

export async function GET(request: Request) {
  const user = await getAuthenticatedChessUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const friendshipId = searchParams.get("friendshipId")?.trim() ?? "";

  if (!friendshipId) {
    return NextResponse.json({ error: "Falta la conversación." }, { status: 400 });
  }

  const friendship = await loadFriendshipForUser(friendshipId, user.id);

  if (!friendship) {
    return NextResponse.json({ error: "Conversación no disponible." }, { status: 404 });
  }

  const messages = await prisma.friendDirectMessage.findMany({
    where: {
      friendshipId,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 120,
  });

  return NextResponse.json({
    messages: messages.map((message) => ({
      id: message.id,
      friendshipId: message.friendshipId,
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const user = await getAuthenticatedChessUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureProfileForUserSafely(user);

  const payload = await request.json().catch(() => null);
  const friendshipId = typeof payload?.friendshipId === "string" ? payload.friendshipId.trim() : "";
  const content = typeof payload?.content === "string" ? payload.content.trim() : "";

  if (!friendshipId) {
    return NextResponse.json({ error: "Falta la conversación." }, { status: 400 });
  }

  if (!content) {
    return NextResponse.json({ error: "El mensaje está vacío." }, { status: 400 });
  }

  if (content.length > 500) {
    return NextResponse.json({ error: "El mensaje es demasiado largo." }, { status: 400 });
  }

  const friendship = await loadFriendshipForUser(friendshipId, user.id);

  if (!friendship) {
    return NextResponse.json({ error: "No puedes escribir en esta conversación." }, { status: 404 });
  }

  const [message] = await prisma.$transaction([
    prisma.friendDirectMessage.create({
      data: {
        friendshipId,
        senderId: user.id,
        content,
      },
    }),
    prisma.friendship.update({
      where: {
        id: friendshipId,
      },
      data: {
        lastMessageAt: new Date(),
      },
    }),
  ]);

  return NextResponse.json({
    message: {
      id: message.id,
      friendshipId: message.friendshipId,
      senderId: message.senderId,
      senderName: getUserDisplayName(user),
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    },
  });
}
