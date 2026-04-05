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
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-4 py-2 font-mono text-xs uppercase tracking-[0.24em] text-white/72 backdrop-blur-md transition-colors hover:text-white"
        >
          <ArrowLeft size={14} />
          Exit
        </Link>
      </div>

      <div className="pointer-events-none absolute bottom-5 left-5 z-30 max-w-[320px] rounded-[1.8rem] border border-white/12 bg-black/28 p-5 backdrop-blur-md md:bottom-6 md:left-6 md:max-w-[420px]">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.32em] text-white/48">Engineering Atlas</p>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-4xl">Explora el espacio de proyectos.</h1>
        <p className="mt-3 text-sm leading-7 text-white/62">
          Orbita libremente, activa la nave y entra en una esfera para saltar por hiperespacio al laboratorio.
        </p>
      </div>

      <div className="absolute inset-0 z-10">
        <GalaxyScene />
      </div>
    </main>
  );
}
