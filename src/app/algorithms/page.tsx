import dynamic from "next/dynamic";
import { Binary, Braces } from "lucide-react";
import { PageHero, PageShell, SectionInset } from "@/components/shell/PagePrimitives";

const SortingVisualizer = dynamic(() => import("./SortingVisualizer"), {
  ssr: false,
});

export default function AlgorithmsPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Laboratorio"
        title="Algo Vision"
        description="Visualizador de algoritmos de ordenación para seguir comparaciones, intercambios y ritmo de ejecución."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="interactive-frame p-4 md:p-6">
          <SortingVisualizer />
        </div>
        <div className="space-y-4">
          <SectionInset>
            <div className="flex items-center gap-3">
              <Binary size={18} className="text-primary" />
              <p className="text-sm leading-7 text-muted-foreground">Prueba diferentes algoritmos y observa cómo cambia el patrón de trabajo.</p>
            </div>
          </SectionInset>
          <SectionInset>
            <div className="flex items-center gap-3">
              <Braces size={18} className="text-primary" />
              <p className="text-sm leading-7 text-muted-foreground">El objetivo es leer la lógica, no decorar la pantalla.</p>
            </div>
          </SectionInset>
        </div>
      </div>
    </PageShell>
  );
}
