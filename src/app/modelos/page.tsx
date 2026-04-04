import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ModelGallery from "@/components/ModelGallery";

export const metadata = {
  title: 'Galería 3D | Rodrigo Alonso',
  description: 'Una colección de modelos 3D interactivos.',
};

export default function PaginaGaleria3D() {
  return (
    <main className="bg-background text-foreground min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-24 sm:py-32">
        
        <div className="mb-12">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-mono text-sm mb-8">
            <ArrowLeft size={18} />
            Volver al inicio
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter mb-2">Galería de Modelos 3D</h1>
          <p className="text-lg text-muted-foreground">
            Una colección de modelos 3D con los que puedes interactuar. Arrastra para rotar y usa la rueda del ratón para hacer zoom.
          </p>
        </div>

        <div className="w-full h-[600px]">
          <ModelGallery />
        </div>

      </div>
    </main>
  );
}
