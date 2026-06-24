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
    <main className="relative h-screen w-screen overflow-hidden bg-black font-mono text-cyan-300">
      <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_70%,rgba(0,0,0,0.85)_100%)]" />

      <div className="absolute left-4 top-4 z-30 md:left-6 md:top-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-cyan-500/30 bg-black/70 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-cyan-400 shadow-[0_4px_20px_rgba(6,182,212,0.2)] backdrop-blur-md transition-all hover:border-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 rounded-md hover:-translate-y-0.5"
        >
          <ArrowLeft size={16} className="text-cyan-400" />
          Volver
        </Link>
      </div>

      <div className="absolute inset-0 z-10">
        <GalaxyScene />
      </div>
    </main>
  );
}
