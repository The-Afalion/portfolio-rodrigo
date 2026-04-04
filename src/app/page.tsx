import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Boxes,
  Cpu,
  Github,
  Linkedin,
  Mail,
  Network,
} from "lucide-react";
import { FEATURED_PROJECTS, PROYECTOS_CORE, type ProyectoCore } from "@/datos/proyectos";
import { siteConfig } from "@/config/site";

const featuredProjects = FEATURED_PROJECTS.slice(0, 4);
const archiveProjects = PROYECTOS_CORE.filter((project) => !project.featured).slice(0, 8);

const focusAreas = [
  {
    title: "Producto digital",
    description: "Interfaces claras, sistemas de navegación consistentes y experiencias que se pueden usar de inmediato.",
    icon: Boxes,
  },
  {
    title: "Sistemas interactivos",
    description: "Herramientas, simulaciones y visualizaciones que convierten lógica compleja en algo legible.",
    icon: Network,
  },
  {
    title: "IA aplicada",
    description: "Modelos, heurísticas y motores experimentales integrados dentro de productos reales.",
    icon: Cpu,
  },
] as const;

const hubLinks = [
  {
    title: "Blog",
    href: "/blog",
    description: "Notas técnicas, arquitectura y decisiones de producto.",
    icon: BookOpen,
  },
  {
    title: "Laboratorios",
    href: "/engineering",
    description: "Colección de simulaciones, motores y prototipos interactivos.",
    icon: Cpu,
  },
  {
    title: "Chess",
    href: "/chess",
    description: "Hub jugable con lobby, bots y modos colectivos.",
    icon: Network,
  },
  {
    title: "Galería 3D",
    href: "/modelos",
    description: "Piezas tridimensionales para revisar forma, materiales y movimiento.",
    icon: Boxes,
  },
] as const;

function ProjectCard({
  project,
  className = "",
}: {
  project: ProyectoCore;
  className?: string;
}) {
  return (
    <Link
      href={`/proyectos/${project.id}`}
      className={`group surface-panel flex h-full flex-col justify-between gap-8 p-6 transition-transform duration-200 hover:-translate-y-1 ${className}`.trim()}
    >
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <span className="eyebrow-chip">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: project.color }} />
            {project.tech[0]}
          </span>
          <ArrowUpRight size={18} className="text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{project.title}</h2>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">{project.description}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {project.tech.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-border/80 bg-background/75 px-3 py-1 text-xs font-medium text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}

function ArchiveLink({ project }: { project: ProyectoCore }) {
  return (
    <Link
      href={`/proyectos/${project.id}`}
      className="group flex items-center justify-between gap-4 rounded-[1.4rem] border border-border/80 bg-card px-5 py-4 transition-colors hover:bg-secondary"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: project.color }} />
          <span>{project.tech[0]}</span>
        </div>
        <p className="mt-2 truncate text-base font-medium text-foreground">{project.title}</p>
      </div>
      <ArrowUpRight size={16} className="shrink-0 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  );
}

export default function Home() {
  return (
    <main className="page-shell">
      <div className="page-container space-y-14">
        <section className="grid gap-8 border-b border-border/80 pb-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12 lg:pb-16">
          <div className="space-y-8">
            <p className="page-eyebrow">Portfolio 2026</p>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-semibold leading-[0.92] tracking-[-0.05em] sm:text-6xl lg:text-[5.75rem]">
                Rodrigo Alonso
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                Diseño y construyo producto digital, sistemas interactivos y experimentos técnicos con una interfaz clara y una ejecución seria.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="#trabajo" className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90">
                Ver trabajo
                <ArrowRight size={16} />
              </Link>
              <Link href="/contact" className="action-pill">
                <Mail size={16} />
                Contacto
              </Link>
              <a href={siteConfig.github} target="_blank" rel="noopener noreferrer" className="action-pill">
                <Github size={16} />
                GitHub
              </a>
            </div>
          </div>

          <aside className="surface-panel overflow-hidden p-0">
            <div className="grid divide-y divide-border/80">
              <div className="space-y-4 p-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Perfil</p>
                  <span className="rounded-full border border-border/80 bg-background/80 px-3 py-1 text-xs font-medium text-foreground">
                    Disponible para proyectos selectos
                  </span>
                </div>
                <p className="text-lg font-medium text-foreground">{siteConfig.role}</p>
                <p className="text-sm leading-7 text-muted-foreground">
                  Frontend, producto, visualización, motores interactivos y herramientas con base técnica sólida.
                </p>
              </div>

              <div className="grid sm:grid-cols-3 lg:grid-cols-1 lg:divide-y lg:divide-x-0 sm:divide-x sm:divide-y-0 divide-border/80">
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Base</p>
                  <p className="mt-3 text-base font-medium text-foreground">Web, tiempo real y UI</p>
                </div>
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Enfoque</p>
                  <p className="mt-3 text-base font-medium text-foreground">Claridad, estructura y detalle</p>
                </div>
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Contacto</p>
                  <a href={`mailto:${siteConfig.email}`} className="mt-3 block text-base font-medium text-foreground hover:text-muted-foreground">
                    {siteConfig.email}
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section id="trabajo" className="space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="page-eyebrow">Trabajo seleccionado</p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Proyectos principales</h2>
            </div>
            <Link href="/engineering" className="action-pill">
              Ver laboratorios
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid gap-5 lg:grid-cols-12">
            <ProjectCard project={featuredProjects[0]} className="lg:col-span-7 lg:row-span-2" />
            <ProjectCard project={featuredProjects[1]} className="lg:col-span-5" />
            <ProjectCard project={featuredProjects[2]} className="lg:col-span-5" />
            <ProjectCard project={featuredProjects[3]} className="lg:col-span-7" />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="page-eyebrow">Especialidad</p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Cómo organizo el trabajo</h2>
            </div>
            <div className="space-y-4">
              {focusAreas.map((area) => {
                const Icon = area.icon;

                return (
                  <div key={area.title} className="surface-panel-muted p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-[1.1rem] border border-border/80 bg-background/80 text-foreground">
                        <Icon size={18} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">{area.title}</h3>
                        <p className="text-sm leading-7 text-muted-foreground">{area.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <p className="page-eyebrow">Hubs</p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Entradas claras a cada área</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {hubLinks.map((hub) => {
                const Icon = hub.icon;

                return (
                  <Link
                    key={hub.href}
                    href={hub.href}
                    className="group surface-panel flex min-h-[220px] flex-col justify-between gap-6 p-6 transition-transform duration-200 hover:-translate-y-1"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] border border-border/80 bg-background/80 text-foreground">
                      <Icon size={20} />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-xl font-semibold text-foreground">{hub.title}</h3>
                        <ArrowUpRight size={17} className="text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </div>
                      <p className="text-sm leading-7 text-muted-foreground">{hub.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="page-eyebrow">Archivo</p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Más proyectos</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {archiveProjects.map((project) => (
                <ArchiveLink key={project.id} project={project} />
              ))}
            </div>
          </div>

          <div className="surface-panel flex h-full flex-col justify-between gap-8 p-6 md:p-8">
            <div className="space-y-4">
              <p className="page-eyebrow">Contacto</p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Si encaja, lo construimos</h2>
              <p className="max-w-xl text-base leading-8 text-muted-foreground">
                Trabajo mejor con briefs claros, objetivos concretos y ambición técnica real. Si tienes eso, podemos hablar.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90">
                Abrir contacto
                <ArrowRight size={16} />
              </Link>
              <a href={`mailto:${siteConfig.email}`} className="action-pill">
                <Mail size={16} />
                Email
              </a>
              <a href={siteConfig.linkedin} target="_blank" rel="noopener noreferrer" className="action-pill">
                <Linkedin size={16} />
                LinkedIn
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
