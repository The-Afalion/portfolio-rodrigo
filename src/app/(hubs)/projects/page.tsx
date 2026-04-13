"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const GalaxyScene = dynamic(() => import("./GalaxyScene"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-black font-mono text-white">
      Inicializando atlas estelar...
    </div>
  ),
});

export default function EngineeringPage() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#1a120e] text-[#e8dcc4] font-serif">
      <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_50%,rgba(26,18,14,0.7)_100%)]" />

      <div className="absolute left-5 top-5 z-30 md:left-6 md:top-6">
        <Link
          href="/"
          className="inline-flex items-center gap-3 bg-[#fdfbf7] px-6 py-3 text-sm font-bold text-[#453628] shadow-[2px_4px_0px_#a68659] border-2 border-[#8c673d] transition-transform hover:-translate-y-1 hover:shadow-[2px_6px_0px_#a68659] active:translate-y-1 active:shadow-none"
        >
          <ArrowLeft size={16} className="text-[#8c673d]" />
          RETIRARSE
        </Link>
      </div>

      <div className="pointer-events-none absolute bottom-5 left-5 z-30 max-w-[320px] bg-[#fcfaf4] border-2 border-[#8c673d] shadow-[8px_12px_20px_rgba(60,40,30,0.4)] p-7 md:bottom-8 md:left-8 md:max-w-[420px] relative">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#cc6640] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)] border border-[#a64020]" />
        
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#a68659] mt-3">Cartografía de Proyectos</p>
        <h1 className="text-2xl font-black tracking-tight text-[#3e2b22] md:text-3xl uppercase">Atlas de Desarrollo</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#5c4033] font-medium border-t-2 border-dashed border-[#e3d5b8] pt-3">
          Orbita libremente. Colisione su nave de madera contra cualquier orbe para examinar los documentos de la expedición técnica.
        </p>
      </div>

      <div className="absolute inset-0 z-10">
        <GalaxyScene />
      </div>
    </main>
  );
}
