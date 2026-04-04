import ModelGallery from "@/components/ModelGallery";
import { Cuboid, MousePointerClick, ScanLine } from "lucide-react";
import { PageHero, PageShell, SectionPanel, SectionInset } from "@/components/shell/PagePrimitives";

export const metadata = {
  title: "Galería 3D | Rodrigo Alonso",
  description: "Una colección de modelos 3D interactivos.",
};

export default function PaginaGaleria3D() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Modelos 3D"
        title="Galería 3D"
        description="Piezas y estudios tridimensionales para revisar forma, materiales y movimiento. Arrastra para rotar y usa la rueda para acercar."
        aside={
          <SectionPanel className="space-y-4">
            <div className="flex items-center gap-3">
              <Cuboid size={18} className="text-primary" />
              <p className="text-sm text-muted-foreground">El foco está en la pieza y en la lectura espacial, no en el marco alrededor.</p>
            </div>
          </SectionPanel>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="interactive-frame h-[640px] p-4 md:p-6">
          <ModelGallery />
        </div>

        <div className="space-y-4">
          <SectionInset>
            <div className="flex items-center gap-3">
              <MousePointerClick size={18} className="text-primary" />
              <p className="text-sm leading-7 text-muted-foreground">Control directo para inspeccionar volumen, silueta y detalle.</p>
            </div>
          </SectionInset>
          <SectionInset>
            <div className="flex items-center gap-3">
              <ScanLine size={18} className="text-primary" />
              <p className="text-sm leading-7 text-muted-foreground">Cada escena mantiene una lectura limpia y un marco estable.</p>
            </div>
          </SectionInset>
        </div>
      </div>
    </PageShell>
  );
}
