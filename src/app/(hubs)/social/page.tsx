import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowLeft, MessageSquare, Users2, Gamepad2 } from "lucide-react";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { ensureProfileForUserSafely, getUserDisplayName } from "@/lib/profile";
import SocialHubClient from "./SocialHubClient";

export const dynamic = "force-dynamic";

export default async function SocialHubPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center px-4">
        <div className="surface-panel w-full max-w-2xl p-8 text-center bento-card">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neon-cyan">Hub Social</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">
            Identificación Requerida
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/50">
            Debes iniciar sesión para unirte al chat global, hacer amigos y retarlos a una partida.
          </p>
          <Link
            href="/blog/login?redirect=/social"
            className="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-sm font-medium text-black hover:bg-neon-cyan transition-colors"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  const profile = await ensureProfileForUserSafely(user);
  
  // Obtener amistades
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { requesterId: user.id },
        { addresseeId: user.id }
      ]
    },
    include: {
      requester: true,
      addressee: true
    }
  });

  // Obtener mensajes del lobby (Chat global) - Últimos 50
  const lobbyMessages = await prisma.lobbyMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col bg-[#010103] selection:bg-neon-cyan/30 selection:text-neon-cyan">
      <main className="flex-1 flex flex-col w-full max-w-[1600px] mx-auto p-4 sm:p-6 overflow-hidden">
        
        {/* HEADER COMPACTO */}
        <div className="flex items-center justify-between shrink-0 mb-6">
          <div className="flex items-center gap-6">
             <Link
               href="/"
               className="inline-flex items-center gap-2 text-sm font-medium text-white/50 transition-colors hover:text-white bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:border-white/30"
             >
               <ArrowLeft size={16} />
               <span>Volver</span>
             </Link>
             <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
               <Gamepad2 className="text-neon-cyan w-6 h-6" />
               Nexus Social
             </h1>
          </div>
          <div className="text-right">
             <p className="text-xs text-white/40 uppercase tracking-widest font-mono">Conectado como</p>
             <p className="text-sm font-bold text-neon-pink">{getUserDisplayName(user)}</p>
          </div>
        </div>

        {/* HUB CLIENTE (GRID) */}
        <SocialHubClient
           currentUser={{
             id: user.id,
             name: getUserDisplayName(user),
           }}
           initialMessages={lobbyMessages}
           initialFriendships={friendships}
        />
      </main>
    </div>
  );
}
