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
        description="Una simulación de probabilidad presentada como instrumento de estudio, con más aire y menos teatralidad visual."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="interactive-frame min-h-[640px] overflow-hidden">
          <GaltonBoard />
        </div>
        <div className="space-y-4">
          <SectionInset>
            <div className="flex items-center gap-3">
              <Sigma size={18} className="text-primary" />
              <p className="text-sm leading-7 text-muted-foreground">La interfaz acompaña al fenómeno en lugar de competir con él.</p>
            </div>
          </SectionInset>
          <SectionInset>
            <div className="flex items-center gap-3">
              <Activity size={18} className="text-primary" />
              <p className="text-sm leading-7 text-muted-foreground">Tonos reales y una estructura de producto para que la experiencia se sienta más madura.</p>
            </div>
          </SectionInset>
        </div>
      </div>
    </PageShell>
  );
}
