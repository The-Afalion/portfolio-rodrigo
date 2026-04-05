import StudioHome from "@/components/home/StudioHome";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { ensureProfileForUserSafely, getUserDisplayName } from "@/lib/profile";

export const dynamic = "force-dynamic";

export default async function Home() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  let currentUserData = null;
  let friendships: any[] = [];
  let lobbyMessages: any[] = [];

  if (user) {
    const profile = await ensureProfileForUserSafely(user);
    currentUserData = { id: user.id, name: getUserDisplayName(user) };

    friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ requesterId: user.id }, { addresseeId: user.id }]
      },
      include: { requester: true, addressee: true }
    });
    
    lobbyMessages = await prisma.lobbyMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }

  return (
    <StudioHome 
       currentUser={currentUserData} 
       initialFriendships={friendships} 
       initialMessages={lobbyMessages} 
    />
  );
}
