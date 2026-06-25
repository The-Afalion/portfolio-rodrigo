import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowLeft } from "lucide-react";
import type { Friendship, LobbyMessage, Profile } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getSupabaseBrowserEnv } from "@/lib/supabase-env";
import { createClient } from "@/utils/supabase/server";
import { ensureProfileForUserSafely, getUserDisplayName } from "@/lib/profile";
import ProjectsSocialClient from "./ProjectsSocialClient";

export const dynamic = "force-dynamic";

export default async function ProjectsSocialPage() {
  const supabaseEnv = getSupabaseBrowserEnv();
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch (err) {
    console.warn("Auth check failed or database unavailable, running in guest/offline mode:", err);
  }

  // Fallback info if guest/offline
  const currentUserInfo = user
    ? { id: user.id, name: getUserDisplayName(user) }
    : { id: "guest-" + Math.floor(Math.random() * 10000), name: "Cadete Espacial" };

  let friendships: Array<Friendship & { requester: Profile; addressee: Profile }> = [];
  let lobbyMessages: LobbyMessage[] = [];

  if (user) {
    try {
      await ensureProfileForUserSafely(user);

      friendships = await prisma.friendship.findMany({
        where: {
          OR: [{ requesterId: user.id }, { addresseeId: user.id }],
        },
        include: {
          requester: true,
          addressee: true,
        },
      });

      lobbyMessages = await prisma.lobbyMessage.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    } catch (dbError) {
      console.warn("Database error loading social page data, using mock/offline fallbacks:", dbError);
    }
  }

  return (
    <div className="relative min-h-screen w-screen bg-[#020205] text-[#38bdf8] overflow-x-hidden font-mono">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.08)_0%,transparent_70%)]" />



      <header className="relative z-30 flex items-center justify-between border-b border-cyan-500/20 bg-black/40 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 border border-cyan-500/30 bg-black/50 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-cyan-400 hover:border-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 rounded-md transition-all"
          >
            <ArrowLeft size={16} />
            Volver a la Galaxia
          </Link>
          <div className="h-6 w-px bg-cyan-500/20" />
          <div>
            <h1 className="text-sm font-bold uppercase tracking-[0.25em] text-white">Estación Nexus Social</h1>
            <p className="text-[10px] text-cyan-500/60 uppercase tracking-widest mt-0.5">Módulo de Enlace y Telecomunicaciones</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">En Órbita</span>
        </div>
      </header>

      <main className="relative z-10 p-4 lg:p-6 h-[calc(100vh-65px)] max-h-[calc(100vh-65px)] overflow-hidden">
        <ProjectsSocialClient
          currentUser={currentUserInfo}
          initialMessages={lobbyMessages}
          initialFriendships={friendships}
          isDbOffline={!user}
        />
      </main>
    </div>
  );
}
