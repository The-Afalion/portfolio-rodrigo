import Link from "next/link";
import { ArrowRight, ArrowUpRight, Atom, Cpu, Network } from "lucide-react";
import { PROYECTOS_CORE, type ProyectoCore } from "@/datos/proyectos";
import { PageHero, PageShell, SectionInset, SectionPanel } from "@/components/shell/PagePrimitives";

export const metadata = {
  title: "Laboratorios | Rodrigo Alonso",
  description: "Colección de laboratorios interactivos, simulaciones y motores experimentales.",
};

const coreLabs = PROYECTOS_CORE.filter((project) => project.link.startsWith("/engineering/"));

const additionalLabs = [
  {
    title: "Algo Vision",
    href: "/algorithms",
    description: "Visualizador de algoritmos de ordenación.",
    tech: ["React", "Algorithms", "Visualization"],
  },
  {
    title: "Galton Physics",
    href: "/physics",
    description: "Tablero de Galton y distribución normal.",
    tech: ["Matter.js", "Canvas API", "Physics"],
  },
  {
    title: "Sonic Canvas",
    href: "/sonic",
    description: "Sintetizador visual controlado desde un lienzo.",
    tech: ["Web Audio", "Canvas", "DSP"],
  },
  {
    title: "Urban Pulse",
    href: "/urban",
    description: "Escena 3D para tráfico, energía y red.",
    tech: ["Three.js", "Data Viz", "WebGL"],
  },
  {
    title: "Chrono Dasher",
    href: "/chrono-dasher",
    description: "Runner 3D con generación procedural.",
    tech: ["R3F", "Gameplay", "Rendering"],
  },
  {
    title: "Pi Vault",
    href: "/pi-vault",
    description: "Experimento criptográfico con clave derivada de pi.",
    tech: ["TypeScript", "Crypto", "Utilities"],
  },
] as const;

const tracks = [
  {
    title: "Simulación",
    description: "Sistemas con comportamiento emergente, física, tráfico y agentes.",
    icon: Atom,
  },
  {
    title: "IA aplicada",
    description: "Motores heurísticos, evolución genética y aprendizaje sobre interfaz real.",
    icon: Cpu,
  },
  {
    title: "Visualización",
    description: "Formas de hacer visible la lógica técnica sin perder legibilidad.",
    icon: Network,
  },
] as const;

function LabCard({ project }: { project: ProyectoCore }) {
  return (
    <Link
      href={project.link}
      className="group surface-panel flex h-full flex-col justify-between gap-6 p-6 transition-transform duration-200 hover:-translate-y-1"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <span className="eyebrow-chip">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: project.color }} />
            {project.tech[0]}
          </span>
          <ArrowUpRight size={17} className="text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">{project.title}</h2>
          <p className="text-sm leading-7 text-muted-foreground">{project.description}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {project.tech.slice(0, 3).map((tag) => (
          <span key={tag} className="rounded-full border border-border/80 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}

export default function EngineeringPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Laboratorios"
        title="Simulaciones, motores y prototipos construidos para explorar ideas técnicas."
        description="Esta sección agrupa mis experimentos más densos: inteligencia artificial, sistemas generativos, visualización y herramientas interactivas."
        actions={
          <Link href="/contact" className="action-pill">
            Proponer proyecto
            <ArrowRight size={16} />
          </Link>
        }
        aside={
          <SectionPanel className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Uso</p>
            <p className="text-sm leading-7 text-muted-foreground">
              Cada laboratorio tiene su propia interfaz y contexto. Aquí están ordenados como un catálogo, no como una lista de demos sueltas.
            </p>
          </SectionPanel>
        }
      />

      <section className="space-y-6">
        <div className="space-y-2">
          <p className="page-eyebrow">Colección central</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Experimentos principales</h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {coreLabs.map((project) => (
            <LabCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-4">
          {tracks.map((track) => {
            const Icon = track.icon;

            return (
              <SectionInset key={track.title}>
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[1.1rem] border border-border/80 bg-background/80 text-foreground">
                    <Icon size={18} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">{track.title}</h3>
                    <p className="text-sm leading-7 text-muted-foreground">{track.description}</p>
                  </div>
                </div>
              </SectionInset>
            );
          })}
        </div>

        <SectionPanel className="space-y-5">
          <div className="space-y-2">
            <p className="page-eyebrow">Más laboratorios</p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Herramientas y demos públicas</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {additionalLabs.map((lab) => (
              <Link
                key={lab.href}
                href={lab.href}
                className="group rounded-[1.5rem] border border-border/80 bg-background/70 p-5 transition-colors hover:bg-secondary"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">{lab.title}</h3>
                    <p className="text-sm leading-7 text-muted-foreground">{lab.description}</p>
                  </div>
                  <ArrowUpRight size={16} className="shrink-0 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {lab.tech.map((tag) => (
                    <span key={tag} className="rounded-full border border-border/80 bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </SectionPanel>
      </section>
    </PageShell>
  );
}
