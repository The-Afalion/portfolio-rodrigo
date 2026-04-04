import dynamic from "next/dynamic";
import { Gauge, MoveRight } from "lucide-react";
import { PageHero, PageShell, SectionInset } from "@/components/shell/PagePrimitives";

const Game = dynamic(() => import("./Game"), {
  ssr: false,
  loading: () => <div className="interactive-frame flex min-h-[520px] items-center justify-center text-sm text-muted-foreground">Cargando simulación de vuelo...</div>,
});

export default function ChronoDasherPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Laboratorio"
        title="Chrono Dasher"
        description="La experiencia sigue siendo rápida e inmersiva, pero ahora vive dentro de una presentación más limpia y profesional."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="interactive-frame min-h-[640px]">
          <Game />
        </div>
        <div className="space-y-4">
          <SectionInset>
            <div className="flex items-center gap-3">
              <Gauge size={18} className="text-primary" />
              <p className="text-sm leading-7 text-muted-foreground">El juego mantiene su energía sin arrastrar un HUD estridente por toda la página.</p>
            </div>
          </SectionInset>
          <SectionInset>
            <div className="flex items-center gap-3">
              <MoveRight size={18} className="text-primary" />
              <p className="text-sm leading-7 text-muted-foreground">Controles: flechas izquierda y derecha para moverse.</p>
            </div>
          </SectionInset>
        </div>
      </div>
    </PageShell>
  );
}
