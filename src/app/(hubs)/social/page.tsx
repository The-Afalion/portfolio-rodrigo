import Link from "next/link";
import { cookies } from "next/headers";
import { MessageSquare, Users2, Gamepad2 } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSupabaseBrowserEnv } from "@/lib/supabase-env";
import { createClient } from "@/utils/supabase/server";
import { ensureProfileForUserSafely, getUserDisplayName } from "@/lib/profile";
import SocialHubClient from "./SocialHubClient";

export const dynamic = "force-dynamic";

export default async function SocialHubPage() {
  const supabaseEnv = getSupabaseBrowserEnv();

  if (!supabaseEnv) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center bg-[#f4ead5] px-4 pt-16 font-serif">
        <div className="relative w-full max-w-2xl border border-[#d6c4a5] bg-[#fcfaf4] p-8 text-center shadow-[5px_8px_15px_rgba(100,70,40,0.15)] md:p-12">
          <div className="absolute left-1/2 top-2 h-4 w-4 -translate-x-1/2 rounded-full border border-[#a64020] bg-[#cc6640] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)]" />
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-[#8a765f]">Tablón Comunal</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#3e3024] md:text-4xl">Sala social no disponible aún</h1>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-[#5c4033]">
            Esta sección depende de Supabase para autenticación y mensajería en tiempo real. En esta copia local faltan
            las variables públicas necesarias, así que en vez de romper la página mostramos este estado de espera.
          </p>
          <div className="mt-8 grid gap-4 text-left md:grid-cols-3">
            <div className="border border-[#e3d5b8] bg-[#fffaf1] p-4">
              <div className="flex items-center gap-2 text-[#8c4030]">
                <Users2 size={16} />
                <span className="text-xs font-bold uppercase tracking-[0.2em]">Amigos</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#5c4033]">Bandeja social, amistades y retos directos.</p>
            </div>
            <div className="border border-[#e3d5b8] bg-[#fffaf1] p-4">
              <div className="flex items-center gap-2 text-[#8c4030]">
                <MessageSquare size={16} />
                <span className="text-xs font-bold uppercase tracking-[0.2em]">Chat</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#5c4033]">Mensajería global y correspondencia entre jugadores.</p>
            </div>
            <div className="border border-[#e3d5b8] bg-[#fffaf1] p-4">
              <div className="flex items-center gap-2 text-[#8c4030]">
                <Gamepad2 size={16} />
                <span className="text-xs font-bold uppercase tracking-[0.2em]">Juegos</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#5c4033]">Puente hacia los minijuegos y modos sociales.</p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/games" className="inline-flex items-center justify-center bg-[#8c4030] px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-[#fdfbf7] transition-colors hover:bg-[#a64020]">
              Ir a juegos
            </Link>
            <Link href="/" className="inline-flex items-center justify-center border border-[#d6c4a5] bg-[#fdfbf7] px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-[#453628] transition-colors hover:bg-[#f4ead5]">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

  await ensureProfileForUserSafely(user);
  
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
