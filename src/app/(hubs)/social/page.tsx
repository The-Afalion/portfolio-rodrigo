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
      <div className="page-shell flex h-screen pt-16 items-center justify-center px-4 bg-[#f4ead5] font-serif">
        <div className="bg-[#fcfaf4] border border-[#d6c4a5] shadow-[5px_8px_15px_rgba(100,70,40,0.15)] w-full max-w-lg p-10 text-center rounded-sm transform rotate-1 relative">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#cc6640] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)] border border-[#a64020]" />
          <p className="text-xs font-bold uppercase tracking-widest text-[#8a765f] mt-2">Tablón Comunal</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#3e3024]">
            Identidad Postal Requerida
          </h1>
          <p className="mt-6 text-sm leading-7 text-[#5c4033] max-w-sm mx-auto">
            Por favor, inicie sesión o deposite sus credenciales para acceder a la correspondencia global, firmar telegramas o retar a otros miembros de la sociedad.
          </p>
          <Link
            href="/blog/login?redirect=/social"
            className="mt-10 inline-flex items-center justify-center bg-[#8c4030] px-8 py-3 text-sm font-bold font-mono uppercase tracking-widest text-[#fdfbf7] hover:bg-[#a64020] transition-colors shadow-sm"
          >
            Sellar Credenciales
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
    <div className="h-screen pt-16 max-h-screen overflow-hidden flex flex-col bg-[#f4ead5] font-serif selection:bg-[#cc6640]/30 selection:text-[#3e3024]">
      <main className="flex-1 min-h-0 flex flex-col w-full mx-auto overflow-hidden relative">
        <SocialHubClient
           currentUser={{
             id: user!.id,
             name: getUserDisplayName(user!),
           }}
           initialMessages={lobbyMessages}
           initialFriendships={friendships}
        />
      </main>
    </div>
  );
}
