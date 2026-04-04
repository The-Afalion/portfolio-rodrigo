import dynamic from "next/dynamic";
import { Building2, Network, Zap } from "lucide-react";
import { PageHero, PageShell, SectionInset } from "@/components/shell/PagePrimitives";

const UrbanScene = dynamic(() => import("./UrbanScene"), {
  ssr: false,
  loading: () => <div className="interactive-frame flex min-h-[520px] items-center justify-center text-sm text-muted-foreground">Cargando simulación urbana...</div>,
});

export default function UrbanPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Laboratorio"
        title="Urban Pulse"
        description="Lectura urbana en 3D para seguir tráfico, consumo energético y estado de red dentro de una misma escena."
      />

      <div className="space-y-6">
        <div className="interactive-frame min-h-[640px] overflow-hidden">
          <UrbanScene />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <SectionInset>
            <div className="flex items-center gap-3">
              <Building2 size={18} className="text-primary" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Consumo</p>
                <p className="mt-2 text-sm text-foreground">7.2 GW</p>
              </div>
            </div>
          </SectionInset>
          <SectionInset>
            <div className="flex items-center gap-3">
              <Zap size={18} className="text-primary" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Tráfico</p>
                <p className="mt-2 text-sm text-foreground">8.129 veh/h</p>
              </div>
            </div>
          </SectionInset>
          <SectionInset>
            <div className="flex items-center gap-3">
              <Network size={18} className="text-primary" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Nodos</p>
                <p className="mt-2 text-sm text-foreground">99.8% up</p>
              </div>
            </div>
          </SectionInset>
        </div>
      </div>
    </PageShell>
  );
}
