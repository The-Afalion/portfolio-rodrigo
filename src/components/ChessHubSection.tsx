"use client";

import Link from "next/link";
import { ArrowRight, Bot, BrainCircuit, History, Inbox, Swords, Users } from "lucide-react";
import { motion } from "framer-motion";

const chessLinks = [
  {
    href: "/chess",
    icon: Swords,
    title: "Club online",
    description: "Lobby, amigos, partidas activas y retos directos desde el panel principal.",
  },
  {
    href: "/chess/invitations",
    icon: Inbox,
    title: "Invitaciones",
    description: "Acepta o revisa retos pendientes sin perder el hilo de tus partidas.",
  },
  {
    href: "/chess/history",
    icon: History,
    title: "Historial",
    description: "Reanuda tableros activos y consulta partidas recientes.",
  },
  {
    href: "/chess/community",
    icon: Users,
    title: "Ajedrez comunal",
    description: "Una partida colectiva con votación de jugadas y progreso diario.",
  },
  {
    href: "/chess/ai-battle",
    icon: Bot,
    title: "Batalla de IAs",
    description: "Torneo entre bots con archivo de enfrentamientos y narración táctica.",
  },
  {
    href: "/chess/human-vs-ai",
    icon: BrainCircuit,
    title: "Humano vs IA",
    description: "Entrenamiento directo contra una IA configurable.",
  },
];

export default function ChessHubSection() {
  return (
    <section id="chess-hub" className="bg-[#070b12] px-4 py-20 text-white md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-200/70">Chess Hub</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">Todas las salas de ajedrez</h2>
          </div>
          <Link
            href="/chess"
            className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
          >
            Abrir hub
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {chessLinks.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: index * 0.04 }}
              >
                <Link
                  href={item.href}
                  className="group block h-full rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-6 transition hover:-translate-y-1 hover:border-amber-200/35 hover:bg-white/[0.06]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200/15 bg-amber-300/10 text-amber-100">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-amber-200">
                    Entrar
                    <ArrowRight size={15} className="transition group-hover:translate-x-1" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
