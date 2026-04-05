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
    <main className="relative h-screen w-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_52%,rgba(0,0,0,0.42)_100%)]" />

      <div className="absolute left-5 top-5 z-30 md:left-6 md:top-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-lg transition-transform hover:scale-105"
        >
          <ArrowLeft size={16} />
          Nexus Principal
        </Link>
      </div>

      <div className="pointer-events-none absolute bottom-5 left-5 z-30 max-w-[320px] rounded-[1.5rem] bg-white p-7 shadow-2xl md:bottom-8 md:left-8 md:max-w-[400px]">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Hub de Proyectos</p>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 md:text-3xl">Atlas de Desarrollo</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600 font-medium">
          Orbita libremente y colisiona con cualquier esfera para revisar la documentación de ingeniería.
        </p>
      </div>

      <div className="absolute inset-0 z-10">
        <GalaxyScene />
      </div>
    </main>
  );
}
