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


      <div className="absolute inset-0 z-10">
        <GalaxyScene />
      </div>
    </main>
  );
}
