"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, Github, Linkedin, Mail } from "lucide-react";
import { FEATURED_PROJECTS, type ProyectoCore } from "@/datos/proyectos";
import { siteConfig } from "@/config/site";
import { useRef } from "react";

const selectedProjects = FEATURED_PROJECTS.slice(0, 5);

const hubIndex = [
  {
    title: "Laboratorios",
    href: "/engineering",
    description: "Atlas interactivo con simulaciones, motores y prototipos.",
  },
  {
    title: "Chess",
    href: "/chess",
    description: "Lobby, bots y modos colectivos dentro del mismo hub.",
  },
  {
    title: "Blog",
    href: "/blog",
    description: "Notas técnicas, decisiones de producto y arquitectura.",
  },
  {
    title: "3D",
    href: "/modelos",
    description: "Piezas y estudios tridimensionales con control directo.",
  },
] as const;

const studioIndex = [
  ["Rol", siteConfig.role],
  ["Base", "Producto, interacción, visualización"],
  ["Ámbito", "Web, tiempo real, IA aplicada"],
] as const;

function ProjectRow({ project, index }: { project: ProyectoCore; index: number }) {
  return (
    <Link
      href={`/proyectos/${project.id}`}
      className="group grid gap-5 py-7 md:grid-cols-[72px,minmax(0,1fr),auto] md:items-start md:gap-8"
    >
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
        {String(index + 1).padStart(2, "0")}
      </p>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: project.color }} />
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{project.title}</h2>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">{project.description}</p>
        <div className="flex flex-wrap gap-2">
          {project.tech.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="hidden pt-1 md:block">
        <ArrowUpRight
          size={18}
          className="text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </div>
    </Link>
  );
}

function HubRow({
  title,
  href,
  description,
}: {
  title: string;
  href: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group grid gap-4 py-6 md:grid-cols-[minmax(0,1fr),auto] md:items-start md:gap-8"
    >
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
  const atlasRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const { scrollYProgress: atlasProgress } = useScroll({
    target: atlasRef,
    offset: ["start end", "end start"],
  });

  const heroPlaneY = useTransform(heroProgress, [0, 1], [0, prefersReducedMotion ? 0 : 150]);
  const heroPlaneSecondaryY = useTransform(heroProgress, [0, 1], [0, prefersReducedMotion ? 0 : 90]);
  const heroWordX = useTransform(heroProgress, [0, 1], [0, prefersReducedMotion ? 0 : 120]);
  const heroContentY = useTransform(heroProgress, [0, 1], [0, prefersReducedMotion ? 0 : 40]);

  const atlasPanelY = useTransform(atlasProgress, [0, 1], [prefersReducedMotion ? 0 : 60, prefersReducedMotion ? 0 : -60]);
  const atlasWordY = useTransform(atlasProgress, [0, 1], [prefersReducedMotion ? 0 : 40, prefersReducedMotion ? 0 : -90]);

  return (
    <main className="relative">
      <section ref={heroRef} className="relative min-h-[100svh] overflow-hidden border-b border-border/80">
        <div className="absolute inset-0">
          <motion.div
            aria-hidden="true"
            style={{ y: heroPlaneY }}
            className="absolute right-[6%] top-[18%] hidden h-[56vh] min-h-[360px] w-[38vw] min-w-[360px] rounded-[3rem] border border-border/80 bg-card/92 lg:block"
          />
          <motion.div
            aria-hidden="true"
            style={{ y: heroPlaneSecondaryY }}
            className="absolute right-[17%] top-[28%] hidden h-[24vh] min-h-[180px] w-[24vw] min-w-[260px] rounded-[2.2rem] border border-border/80 bg-secondary/90 lg:block"
          />
          <motion.div
            aria-hidden="true"
            style={{ y: heroPlaneY }}
            className="absolute left-[58%] top-[58%] hidden h-[16vh] min-h-[120px] w-[14vw] min-w-[180px] rounded-[1.8rem] border border-border/80 bg-background lg:block"
          />
          <motion.p
            aria-hidden="true"
            style={{ x: heroWordX }}
            className="absolute bottom-[10%] right-[6%] hidden font-display text-[12vw] font-semibold leading-none tracking-[-0.08em] text-foreground/[0.05] lg:block"
          >
            SYSTEMS
          </motion.p>
        </div>

        <motion.div style={{ y: heroContentY }} className="page-container relative z-10 flex min-h-[100svh] flex-col justify-end pb-16 pt-28">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.75fr] lg:items-end">
            <div className="space-y-7">
              <p className="page-eyebrow">Rodrigo Alonso</p>
              <div className="space-y-4">
                <h1 className="max-w-5xl text-5xl font-semibold leading-[0.9] tracking-[-0.06em] sm:text-6xl lg:text-[6.2rem]">
                  Software con criterio visual.
                </h1>
                <p className="max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
                  Producto digital, interacción y sistemas técnicos construidos con orden, detalle y claridad.
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
                <Link href="/engineering" className="action-pill">
                  Abrir atlas
                </Link>
              </div>
            </div>

            <div className="border border-border/80 bg-background/82">
              {studioIndex.map(([label, value], index) => (
                <div
                  key={label}
                  className={`grid gap-2 px-5 py-5 sm:grid-cols-[96px,minmax(0,1fr)] ${
                    index !== studioIndex.length - 1 ? "border-b border-border/80" : ""
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
        </motion.div>
      </section>

      <section id="work" className="border-b border-border/80 py-20 md:py-24">
        <div className="page-container grid gap-12 lg:grid-cols-[0.68fr_1.32fr]">
          <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <p className="page-eyebrow">Selected Work</p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Trabajo principal</h2>
            <p className="max-w-sm text-base leading-8 text-muted-foreground">
              Una selección reducida de proyectos donde se cruza producto, interacción y sistema técnico.
            </p>
          </div>

          <div className="divide-y divide-border/80 border-y border-border/80">
            {selectedProjects.map((project, index) => (
              <ProjectRow key={project.id} project={project} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section ref={atlasRef} className="relative h-[120svh] border-b border-border/80">
        <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden bg-background">
          <motion.div
            aria-hidden="true"
            style={{ y: atlasPanelY }}
            className="absolute right-[6%] top-[16%] hidden h-[68vh] min-h-[460px] w-[30vw] min-w-[300px] rounded-[3rem] border border-border/80 bg-secondary/86 lg:block"
          />
          <motion.p
            aria-hidden="true"
            style={{ y: atlasWordY }}
            className="absolute left-[4%] top-[14%] hidden font-display text-[10vw] font-semibold leading-none tracking-[-0.08em] text-foreground/[0.05] lg:block"
          >
            ATLAS
          </motion.p>

          <div className="page-container relative z-10 grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
            <div className="space-y-4">
              <p className="page-eyebrow">Índice</p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Entradas claras para cada área.</h2>
              <p className="max-w-sm text-base leading-8 text-muted-foreground">
                La web queda organizada como un estudio: un portfolio central y cuatro hubs con identidad propia.
              </p>
            </div>

            <div className="divide-y divide-border/80 border-y border-border/80">
              {hubIndex.map((hub) => (
                <HubRow
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
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Si hay una idea buena, la construimos bien.</h2>
              <p className="max-w-xl text-base leading-8 text-muted-foreground">
                Trabajo mejor con objetivos claros, ambición técnica y margen para cuidar la ejecución.
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
