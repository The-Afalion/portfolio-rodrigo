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
    <main className="relative h-screen w-screen overflow-hidden bg-[#1a120e] font-serif text-[#e8dcc4]">
      <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_58%,rgba(26,18,14,0.58)_100%)]" />

      <div className="absolute left-4 top-4 z-30 md:left-6 md:top-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-[#8c673d] bg-[#fdfbf7]/96 px-4 py-2.5 text-xs font-bold text-[#453628] shadow-[0_14px_30px_rgba(46,26,14,0.24)] transition-transform hover:-translate-y-0.5"
        >
          <ArrowLeft size={16} className="text-[#8c673d]" />
          Volver
        </Link>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 z-30 max-w-[min(88vw,360px)] border border-[#8c673d] bg-[#fcfaf4]/94 p-5 shadow-[0_18px_48px_rgba(60,40,30,0.28)] md:bottom-6 md:left-6 md:max-w-[380px]">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#a68659]">Engineering Core</p>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-[#3e2b22] md:text-[2rem]">Atlas de proyectos</h1>
        <p className="mt-3 text-sm leading-7 text-[#5c4033]">
          Explora la escena o pulsa un nodo. El modo nave sigue disponible, pero ahora la interfaz deja respirar la vista.
        </p>
      </div>

      <div className="absolute inset-0 z-10">
        <GalaxyScene />
      </div>
    </main>
  );
}
