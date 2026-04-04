import dynamic from "next/dynamic";
import { Activity, Sigma } from "lucide-react";
import { PageHero, PageShell, SectionInset } from "@/components/shell/PagePrimitives";

const GaltonBoard = dynamic(() => import("./GaltonBoard"), {
  ssr: false,
  loading: () => <div className="interactive-frame flex min-h-[420px] items-center justify-center text-sm text-muted-foreground">Cargando motor de físicas...</div>,
});

export default function PhysicsPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Laboratorio"
        title="Galton Board"
        description="Simulación del tablero de Galton para observar probabilidad, dispersión y distribución normal."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="interactive-frame min-h-[640px] overflow-hidden">
          <GaltonBoard />
        </div>
        <div className="space-y-4">
          <SectionInset>
            <div className="flex items-center gap-3">
              <Sigma size={18} className="text-primary" />
              <p className="text-sm leading-7 text-muted-foreground">La lectura se centra en el patrón estadístico que aparece al caer las bolas.</p>
            </div>
          </SectionInset>
          <SectionInset>
            <div className="flex items-center gap-3">
              <Activity size={18} className="text-primary" />
              <p className="text-sm leading-7 text-muted-foreground">Útil para explicar visualmente el límite central y la acumulación de frecuencias.</p>
            </div>
          </SectionInset>
        </div>
      </div>
    </PageShell>
  );
}
