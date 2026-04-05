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
    <div className="page-shell min-h-screen">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-white/50 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          Volver a Inicio
        </Link>

        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl mb-2 flex items-center gap-4">
            <Gamepad2 className="text-neon-cyan w-10 h-10" />
            Nexus Social
          </h1>
          <p className="text-white/60 mb-10 max-w-2xl">
            Bienvenido al nodo central, <strong className="text-neon-pink">{getUserDisplayName(user)}</strong>. Chatea globalmente, expande tu lista de contactos o invita a jugar.
          </p>
        </div>

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
