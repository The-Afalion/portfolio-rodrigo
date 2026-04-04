import prisma from "@/lib/prisma";
import { PlayerList } from "./PlayerList";
import { cookies } from "next/headers";
import { hasSupabaseBrowserEnv } from "@/lib/supabase-env";
import { createClient } from "@/utils/supabase/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function CommunityPage() {
  if (!hasSupabaseBrowserEnv()) {
    return <div className="container mx-auto p-4">Configura Supabase para cargar la comunidad.</div>;
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch all users except the current one
  const players = await prisma.profile.findMany({
    where: {
      id: {
        not: user?.id,
      },
    },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Community Players</h1>
      <PlayerList players={players} currentUser={user} />
    </div>
  );
}
