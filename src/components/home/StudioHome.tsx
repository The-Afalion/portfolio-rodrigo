"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, Github, Linkedin, Mail } from "lucide-react";
import { FEATURED_PROJECTS, type ProyectoCore } from "@/datos/proyectos";
import { siteConfig } from "@/config/site";
import { useRef } from "react";

const selectedProjects = FEATURED_PROJECTS.slice(0, 4);

const hubs = [
  {
    title: "Laboratorios",
    href: "/engineering",
    description: "Atlas espacial con motores, simulaciones y prototipos interactivos.",
  },
  {
    title: "Chess",
    href: "/chess",
    description: "Lobby, bots y modos colectivos dentro del mismo producto.",
  },
  {
    title: "Blog",
    href: "/blog",
    description: "Notas técnicas, decisiones de producto y proceso.",
  },
  {
    title: "3D",
    href: "/modelos",
    description: "Piezas y estudios tridimensionales con control directo.",
  },
] as const;

const studioFacts = [
  ["Rol", siteConfig.role],
  ["Foco", "Producto, interacción y sistema"],
  ["Trabajo", "Web, tiempo real e IA aplicada"],
] as const;

function ProjectItem({ project, index }: { project: ProyectoCore; index: number }) {
  return (
    <Link
      href={`/proyectos/${project.id}`}
      className="group grid gap-5 py-7 md:grid-cols-[72px,minmax(0,1fr),auto] md:items-start md:gap-8"
    >
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
        {String(index + 1).padStart(2, "0")}
      </p>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: project.color }} />
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{project.title}</h2>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">{project.description}</p>
      </div>

      <ArrowUpRight
        size={18}
        className="hidden text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 md:block"
      />
    </Link>
  );
}

function HubItem({
  title,
  href,
  description,
}: {
  title: string;
  href: string;
  description: string;
}) {
  return (
    <Link href={href} className="group grid gap-4 py-6 md:grid-cols-[minmax(0,1fr),auto] md:items-start md:gap-8">
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h3>
        <p className="max-w-xl text-sm leading-7 text-muted-foreground">{description}</p>
      </div>
      <ArrowUpRight
        size={18}
        className="mt-1 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      />
    </Link>
  );
}

export default function StudioHome() {
  const heroRef = useRef<HTMLElement>(null);
  const hubsRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const { scrollYProgress: hubsProgress } = useScroll({
    target: hubsRef,
    offset: ["start end", "end start"],
  });

  const heroBlockY = useTransform(heroProgress, [0, 1], [0, reduceMotion ? 0 : 140]);
  const heroSmallBlockY = useTransform(heroProgress, [0, 1], [0, reduceMotion ? 0 : 70]);
  const heroWordX = useTransform(heroProgress, [0, 1], [0, reduceMotion ? 0 : 80]);
  const hubBlockY = useTransform(hubsProgress, [0, 1], [reduceMotion ? 0 : 40, reduceMotion ? 0 : -60]);
  const hubWordY = useTransform(hubsProgress, [0, 1], [reduceMotion ? 0 : 10, reduceMotion ? 0 : -100]);

  return (
    <main className="relative">
      <section ref={heroRef} className="relative min-h-[100svh] overflow-hidden border-b border-border/80">
        <motion.div
          aria-hidden="true"
          style={{ y: heroBlockY }}
          className="absolute right-[4%] top-[15%] hidden h-[60vh] min-h-[360px] w-[32vw] min-w-[320px] bg-secondary lg:block"
        />
        <motion.div
          aria-hidden="true"
          style={{ y: heroSmallBlockY }}
          className="absolute bottom-[18%] right-[24%] hidden h-[20vh] min-h-[120px] w-[14vw] min-w-[170px] bg-accent/70 lg:block"
        />
        <motion.p
          aria-hidden="true"
          style={{ x: heroWordX }}
          className="absolute bottom-[8%] right-[4%] hidden font-display text-[11vw] font-semibold leading-none tracking-[-0.08em] text-foreground/[0.05] lg:block"
        >
          STUDIO
        </motion.p>

        <div className="page-container relative flex min-h-[100svh] flex-col justify-end pb-16 pt-24">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.8fr] lg:items-end">
            <div className="space-y-7">
              <p className="page-eyebrow">Rodrigo Alonso</p>
              <div className="space-y-4">
                <h1 className="max-w-5xl text-5xl font-semibold leading-[0.9] tracking-[-0.06em] sm:text-6xl lg:text-[6.4rem]">
                  Software claro. Interacción precisa.
                </h1>
                <p className="max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
                  Diseño y construyo producto digital, sistemas interactivos y experiencias técnicas con una ejecución sobria y bien ordenada.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="#work"
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
                >
                  Ver trabajo
                  <ArrowRight size={16} />
                </Link>
                <Link href="/contact" className="action-pill">
                  Contacto
                </Link>
              </div>
            </div>

            <div className="border-t border-border/80 lg:border-t-0 lg:border-l lg:pl-10">
              {studioFacts.map(([label, value], index) => (
                <div
                  key={label}
                  className={`grid gap-2 py-5 sm:grid-cols-[96px,minmax(0,1fr)] ${
                    index !== studioFacts.length - 1 ? "border-b border-border/80" : ""
                  }`}
                >
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                    {label}
                  </p>
                  <p className="text-sm leading-7 text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="work" className="border-b border-border/80 py-20 md:py-24">
        <div className="page-container grid gap-12 lg:grid-cols-[300px,minmax(0,1fr)]">
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <p className="page-eyebrow">Trabajo</p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Proyectos principales</h2>
            <p className="max-w-sm text-base leading-8 text-muted-foreground">
              Selección breve de piezas donde se cruzan producto, sistema y ejecución visual.
            </p>
          </div>

          <div className="divide-y divide-border/80 border-y border-border/80">
            {selectedProjects.map((project, index) => (
              <ProjectItem key={project.id} project={project} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section ref={hubsRef} className="relative min-h-[118svh] border-b border-border/80">
        <div className="sticky top-0 flex min-h-[100svh] items-center overflow-hidden">
          <motion.div
            aria-hidden="true"
            style={{ y: hubBlockY }}
            className="absolute right-[6%] top-[16%] hidden h-[62vh] min-h-[420px] w-[26vw] min-w-[260px] bg-secondary lg:block"
          />
          <motion.p
            aria-hidden="true"
            style={{ y: hubWordY }}
            className="absolute left-[4%] top-[14%] hidden font-display text-[10vw] font-semibold leading-none tracking-[-0.08em] text-foreground/[0.05] lg:block"
          >
            INDEX
          </motion.p>

          <div className="page-container relative z-10 grid gap-12 lg:grid-cols-[300px,minmax(0,1fr)]">
            <div className="space-y-4">
              <p className="page-eyebrow">Índice</p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Cada área tiene su propio hub.</h2>
              <p className="max-w-sm text-base leading-8 text-muted-foreground">
                El portfolio principal se mantiene limpio y el resto del trabajo se organiza en entradas específicas.
              </p>
            </div>

            <div className="divide-y divide-border/80 border-y border-border/80">
              {hubs.map((hub) => (
                <HubItem
                  key={hub.href}
                  title={hub.title}
                  href={hub.href}
                  description={hub.description}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="page-container">
          <div className="grid gap-10 border-t border-border/80 pt-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="space-y-4">
              <p className="page-eyebrow">Contacto</p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Si la idea merece cuidado, hablemos.</h2>
              <p className="max-w-xl text-base leading-8 text-muted-foreground">
                Trabajo mejor con objetivos claros, ambición técnica y margen para hacer las cosas bien.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Abrir contacto
                <ArrowRight size={16} />
              </Link>
              <a href={`mailto:${siteConfig.email}`} className="action-pill">
                <Mail size={16} />
                Email
              </a>
              <a href={siteConfig.github} target="_blank" rel="noopener noreferrer" className="action-pill">
                <Github size={16} />
                GitHub
              </a>
              <a href={siteConfig.linkedin} target="_blank" rel="noopener noreferrer" className="action-pill">
                <Linkedin size={16} />
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
