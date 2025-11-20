"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ModelGallery from "@/components/ModelGallery";

export default function ModelsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 pt-24 relative overflow-hidden">
      <div className="absolute top-6 left-6 z-20">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-mono">
          <ArrowLeft size={20} />
          cd ..
        </Link>
      </div>

      <div className="z-10 w-full flex flex-col items-center text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-2 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground to-muted-foreground">
          Galería de Modelos 3D
        </h1>
        <p className="text-muted-foreground font-mono mb-8 text-sm">
          Una colección de assets y modelos. Arrastra para explorar.
        </p>

        <div className="w-full h-[60vh]">
          <ModelGallery />
        </div>
      </div>
    </main>
  );
}
