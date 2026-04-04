import Link from "next/link";
import { ArrowRight, Boxes, BrainCircuit, LineChart, Music4, Orbit, Sigma, Wind } from "lucide-react";
import { PageHero, PageShell, SectionPanel, SectionInset } from "@/components/shell/PagePrimitives";

const labs = [
  {
    href: "/algorithms",
    title: "Algo Vision",
    description: "Visualización de algoritmos con una interfaz más analítica y menos arcade.",
    icon: Sigma,
  },
  {
    href: "/physics",
    title: "Galton Board",
    description: "Simulación de probabilidad presentada como instrumento de laboratorio.",
    icon: LineChart,
  },
  {
    href: "/sonic",
    title: "Sonic Canvas",
    description: "Exploración audiovisual con una piel más sobria y controlada.",
    icon: Music4,
  },
  {
    href: "/urban",
    title: "Urban Pulse",
    description: "Modelo urbano en tiempo real con telemetría legible y limpia.",
    icon: Orbit,
  },
  {
    href: "/chrono-dasher",
    title: "Chrono Dasher",
    description: "Simulación de velocidad integrada en un marco más editorial.",
    icon: Wind,
  },
  {
    href: "/pi-vault",
    title: "Pi Vault",
    description: "Experimento criptográfico con una UI menos temática y más producto.",
    icon: BrainCircuit,
  },
];

export default function EngineeringPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Laboratorios"
        title="Un hub profesional para sistemas interactivos, simulación y prototipos técnicos."
        description="Aquí conviven visualización, juegos, interfaces experimentales y pequeños motores. La diferencia ahora es que todo comparte un mismo tono visual: elegante, legible y coherente."
        aside={
          <SectionPanel className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Principio</p>
            <p className="text-sm leading-7 text-muted-foreground">
              Cada demo puede seguir siendo compleja, pero la interfaz que la contiene ya no necesita disfrazarse de sistema ficticio para parecer sofisticada.
            </p>
          </SectionPanel>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-6 md:grid-cols-2">
          {labs.map((lab) => {
            const Icon = lab.icon;

            return (
              <Link key={lab.href} href={lab.href} className="group block">
                <SectionPanel className="flex h-full flex-col justify-between gap-8 transition-transform duration-200 group-hover:-translate-y-1">
                  <div className="space-y-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/80 bg-background/75 text-primary">
                      <Icon size={22} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold">{lab.title}</h2>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">{lab.description}</p>
                    </div>
                  </div>
                  <div className="surface-divider flex items-center justify-between pt-4 text-sm font-medium text-foreground">
                    <span>Abrir experiencia</span>
                    <ArrowRight size={16} />
                  </div>
                </SectionPanel>
              </Link>
            );
          })}
        </div>

        <div className="space-y-4">
          <SectionInset>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Selección</p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              El criterio no es llenar la pantalla de efectos, sino hacer que cada experiencia se entienda mejor desde el primer vistazo.
            </p>
          </SectionInset>
          <SectionInset>
            <div className="flex items-center gap-3">
              <Boxes size={18} className="text-primary" />
              <p className="text-sm font-medium text-foreground">Base compartida de color, composición y navegación.</p>
            </div>
          </SectionInset>
        </div>
      </div>
    </PageShell>
  );
}
