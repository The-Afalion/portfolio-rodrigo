import dynamic from "next/dynamic";
import { AudioWaveform, SlidersHorizontal } from "lucide-react";
import { PageHero, PageShell, SectionInset } from "@/components/shell/PagePrimitives";

const SonicCanvas = dynamic(() => import("./SonicCanvas"), {
  ssr: false,
  loading: () => <div className="interactive-frame flex min-h-[520px] items-center justify-center text-sm text-muted-foreground">Inicializando motor de audio...</div>,
});

export default function SonicPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Laboratorio"
        title="Sonic Canvas"
        description="Dibuja sobre el lienzo para generar sonido y alterar el comportamiento del sintetizador en tiempo real."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="interactive-frame p-4 md:p-6">
          <SonicCanvas />
        </div>
        <div className="space-y-4">
          <SectionInset>
            <div className="flex items-center gap-3">
              <AudioWaveform size={18} className="text-primary" />
              <p className="text-sm leading-7 text-muted-foreground">Cada gesto produce una respuesta sonora inmediata.</p>
            </div>
          </SectionInset>
          <SectionInset>
            <div className="flex items-center gap-3">
              <SlidersHorizontal size={18} className="text-primary" />
              <p className="text-sm leading-7 text-muted-foreground">Pensado para explorar ritmo, densidad y timbre desde una interfaz directa.</p>
            </div>
          </SectionInset>
        </div>
      </div>
    </PageShell>
  );
}
