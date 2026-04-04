import "server-only";

import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { getUserDisplayName } from "@/lib/profile";
import { listAllSupabaseUsers, listSupabaseUsersByIds } from "@/lib/supabase-admin";

export async function getAuthenticatedChessUser() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function buildDisplayNameMap(userIds: string[]) {
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  const result = new Map<string, string>();

  if (uniqueIds.length === 0) {
    return result;
  }

  const users = await listSupabaseUsersByIds(uniqueIds);
  users.forEach((user) => {
    result.set(user.id, getUserDisplayName(user));
  });

  return result;
}

export async function findChessUsers(query: string, currentUserId: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery.length < 2) {
    return [];
  }

  const [allUsers, existingProfiles, existingFriendships] = await Promise.all([
    listAllSupabaseUsers(),
    prisma.profile.findMany({
      select: {
        id: true,
        elo: true,
      },
    }),
    prisma.friendship.findMany({
      where: {
        OR: [{ requesterId: currentUserId }, { addresseeId: currentUserId }],
      },
      select: {
        requesterId: true,
        addresseeId: true,
        status: true,
      },
    }),
  ]);

  const profileMap = new Map(existingProfiles.map((profile) => [profile.id, profile]));
  const friendshipMap = new Map(
    existingFriendships.map((friendship) => {
      const counterpartId =
        friendship.requesterId === currentUserId ? friendship.addresseeId : friendship.requesterId;
      return [counterpartId, friendship.status];
    })
  );

  return allUsers
    .filter((user) => user.id !== currentUserId)
    .map((user) => ({
      id: user.id,
      email: user.email ?? "",
      displayName: getUserDisplayName(user),
      elo: profileMap.get(user.id)?.elo ?? 1000,
      friendshipStatus: friendshipMap.get(user.id) ?? null,
    }))
    .filter((candidate) => {
      const name = candidate.displayName.toLowerCase();
      const email = candidate.email.toLowerCase();
      return name.includes(normalizedQuery) || email.includes(normalizedQuery);
    })
    .sort((left, right) => left.displayName.localeCompare(right.displayName, "es", { sensitivity: "base" }))
    .slice(0, 12);
}

export async function findFriendshipBetweenUsers(userAId: string, userBId: string) {
  return prisma.friendship.findFirst({
    where: {
      OR: [
        {
          requesterId: userAId,
          addresseeId: userBId,
        },
        {
          requesterId: userBId,
          addresseeId: userAId,
        },
      ],
    },
  });
}
