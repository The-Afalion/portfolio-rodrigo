"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const GalaxyScene = dynamic(() => import("./GalaxyScene"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-black font-mono text-white">
      Inicializando núcleo...
    </div>
  ),
});

export default function EngineeringPage() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      <div className="absolute left-6 top-6 z-50">
        <Link
          href="/"
          className="flex items-center gap-2 font-mono text-sm text-white/55 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          SYSTEM_EXIT
        </Link>
      </div>

      <div className="pointer-events-none absolute bottom-6 left-6 z-50">
        <h1 className="text-4xl font-bold tracking-tighter text-white">PROCEDURAL AI HUB</h1>
        <p className="mt-1 font-mono text-xs text-white/55">
          Click &amp; drag para orbitar. Activa la nave y toca un planeta para entrar en hiperspacio.
        </p>
      </div>

      <div className="absolute inset-0 z-0">
        <GalaxyScene />
      </div>
    </main>
  );
}
