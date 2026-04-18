"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Github, Globe, Linkedin, Mail, Swords } from "lucide-react";
import { FEATURED_PROJECTS } from "@/datos/proyectos";
import { siteConfig } from "@/config/site";

const selectedProjects = FEATURED_PROJECTS.slice(0, 4);

const hubs = [
  {
    title: "Engineering Core",
    href: "/projects",
    description: "Experimentos 3D, simulaciones y laboratorios interactivos reunidos en un atlas navegable.",
    icon: Globe,
  },
  {
    title: "Chess Club",
    href: "/chess",
    description: "Matchmaking, amistades y entrenamiento contra bots en una interfaz más directa.",
    icon: Swords,
  },
  {
    title: "Contacto",
    href: "/contact",
    description: "Propuestas, colaboraciones y conversaciones sobre producto, frontend e IA aplicada.",
    icon: Mail,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function StudioHome() {
  return (
    <main className="relative overflow-hidden">
      <div className="glow-blob right-[-9rem] top-[-7rem] h-[22rem] w-[22rem] bg-[hsl(var(--primary))]" />
      <div className="glow-blob bottom-[6rem] left-[-7rem] h-[18rem] w-[18rem] bg-[hsl(var(--accent))]" />

      <div className="page-container relative z-10 pb-24 pt-28">
        <motion.section
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="grid gap-8 border-b border-border/70 pb-12 lg:grid-cols-[minmax(0,1.2fr)_320px]"
        >
          <div className="space-y-7">
            <p className="page-eyebrow">Rodrigo Alonso</p>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Producto digital con <span className="gradient-text">carácter</span>, claridad y juego.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                Construyo interfaces, sistemas interactivos y experiencias técnicas que quieren ser útiles antes que
                ruidosas, pero sin perder personalidad.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/projects" className="action-pill">
                Ver laboratorios
                <ArrowRight size={16} />
              </Link>
              <Link href="/blog" className="action-pill">
                Leer el blog
              </Link>
            </div>
          </div>

          <aside className="surface-panel p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Enlaces directos</p>
            <div className="mt-6 space-y-3">
              <a
                href={`mailto:${siteConfig.email}`}
                className="flex items-center justify-between border-b border-border/60 pb-3 text-sm text-foreground"
              >
                <span className="inline-flex items-center gap-3">
                  <Mail size={16} />
                  {siteConfig.email}
                </span>
                <ArrowUpRight size={16} />
              </a>
              <a
                href={siteConfig.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between border-b border-border/60 pb-3 text-sm text-foreground"
              >
                <span className="inline-flex items-center gap-3">
                  <Github size={16} />
                  GitHub
                </span>
                <ArrowUpRight size={16} />
              </a>
              <a
                href={siteConfig.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between text-sm text-foreground"
              >
                <span className="inline-flex items-center gap-3">
                  <Linkedin size={16} />
                  LinkedIn
                </span>
                <ArrowUpRight size={16} />
              </a>
            </div>
          </aside>
        </motion.section>

        <motion.section
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="mt-10 grid gap-5 lg:grid-cols-3"
        >
          {hubs.map((hub) => {
            const Icon = hub.icon;

            return (
              <Link key={hub.href} href={hub.href} className="surface-panel group p-6 hover:-translate-y-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Acceso</p>
                    <h2 className="mt-4 text-2xl font-semibold text-foreground">{hub.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{hub.description}</p>
                  </div>
                  <div className="rounded-full border border-border/70 p-3 text-[hsl(var(--accent))] transition-transform group-hover:translate-x-1">
                    <Icon size={18} />
                  </div>
                </div>
              </Link>
            );
          })}
        </motion.section>

        <motion.section
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="mt-14"
        >
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="page-eyebrow">Destacados</p>
              <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">Una selección corta y navegable.</h2>
            </div>
            <Link href="/projects" className="text-sm font-medium text-foreground underline underline-offset-4">
              Abrir todos los laboratorios
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {selectedProjects.map((project) => (
              <Link
                key={project.id}
                href={`/proyectos/${project.id}`}
                className="surface-panel group flex min-h-[220px] flex-col justify-between p-6 hover:-translate-y-1"
              >
                <div>
                  <div className="mb-4 h-2 w-16 rounded-full" style={{ backgroundColor: project.color }} />
                  <h3 className="text-2xl font-semibold text-foreground">{project.title}</h3>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">{project.description}</p>
                </div>
                <div className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-foreground">
                  Ver proyecto
                  <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </motion.section>
      </div>
    </main>
  );
}
