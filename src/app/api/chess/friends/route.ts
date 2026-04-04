import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { buildDisplayNameMap, getAuthenticatedChessUser, findFriendshipBetweenUsers } from "@/lib/chess-social";
import { ensureProfileForUserSafely } from "@/lib/profile";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function serializeTimestamp(value?: Date | null) {
  return value ? value.toISOString() : null;
}

export async function GET() {
  const user = await getAuthenticatedChessUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureProfileForUserSafely(user);

  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ requesterId: user.id }, { addresseeId: user.id }],
    },
    include: {
      requester: true,
      addressee: true,
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
  });

  const counterpartIds = friendships.map((friendship) =>
    friendship.requesterId === user.id ? friendship.addresseeId : friendship.requesterId
  );
  const nameMap = await buildDisplayNameMap(counterpartIds);

  const friends = friendships
    .filter((friendship) => friendship.status === "ACCEPTED")
    .map((friendship) => {
      const isRequester = friendship.requesterId === user.id;
      const counterpart = isRequester ? friendship.addressee : friendship.requester;
      const lastMessage = friendship.messages[0] ?? null;

      return {
        id: friendship.id,
        friendId: counterpart.id,
        friendName: nameMap.get(counterpart.id) ?? `Jugador ${counterpart.id.slice(0, 6)}`,
        friendElo: counterpart.elo,
        createdAt: friendship.createdAt.toISOString(),
        acceptedAt: serializeTimestamp(friendship.acceptedAt),
        lastMessageAt: serializeTimestamp(friendship.lastMessageAt ?? lastMessage?.createdAt),
        lastMessagePreview: lastMessage?.content ?? null,
      };
    });

  const incomingRequests = friendships
    .filter((friendship) => friendship.status === "PENDING" && friendship.addresseeId === user.id)
    .map((friendship) => ({
      id: friendship.id,
      userId: friendship.requester.id,
      name: nameMap.get(friendship.requester.id) ?? `Jugador ${friendship.requester.id.slice(0, 6)}`,
      elo: friendship.requester.elo,
      createdAt: friendship.createdAt.toISOString(),
    }));

  const outgoingRequests = friendships
    .filter((friendship) => friendship.status === "PENDING" && friendship.requesterId === user.id)
    .map((friendship) => ({
      id: friendship.id,
      userId: friendship.addressee.id,
      name: nameMap.get(friendship.addressee.id) ?? `Jugador ${friendship.addressee.id.slice(0, 6)}`,
      elo: friendship.addressee.elo,
      createdAt: friendship.createdAt.toISOString(),
    }));

  return NextResponse.json({
    friends,
    incomingRequests,
    outgoingRequests,
  });
}

export async function POST(request: Request) {
  const user = await getAuthenticatedChessUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const targetUserId = typeof payload?.targetUserId === "string" ? payload.targetUserId.trim() : "";

  if (!targetUserId) {
    return NextResponse.json({ error: "Falta el usuario objetivo." }, { status: 400 });
  }

  if (targetUserId === user.id) {
    return NextResponse.json({ error: "No puedes enviarte amistad a ti mismo." }, { status: 400 });
  }

  await ensureProfileForUserSafely(user);
  const targetProfile = await prisma.profile.findUnique({
    where: {
      id: targetUserId,
    },
  });

  if (!targetProfile) {
    return NextResponse.json({ error: "Ese usuario ya no está disponible." }, { status: 404 });
  }

  const existingFriendship = await findFriendshipBetweenUsers(user.id, targetUserId);

  if (existingFriendship?.status === "ACCEPTED") {
    return NextResponse.json({ error: "Ya sois amigos." }, { status: 409 });
  }

  if (existingFriendship?.status === "PENDING") {
    if (existingFriendship.addresseeId === user.id) {
      return NextResponse.json(
        { error: "Esa persona ya te ha enviado solicitud. Acéptala desde la bandeja." },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "Ya has enviado una solicitud pendiente." }, { status: 409 });
  }

  const friendship = existingFriendship
    ? await prisma.friendship.update({
        where: { id: existingFriendship.id },
        data: {
          requesterId: user.id,
          addresseeId: targetUserId,
          status: "PENDING",
          acceptedAt: null,
        },
      })
    : await prisma.friendship.create({
        data: {
          requesterId: user.id,
          addresseeId: targetUserId,
          status: "PENDING",
        },
      });

  return NextResponse.json({
    id: friendship.id,
    status: friendship.status,
  });
}
