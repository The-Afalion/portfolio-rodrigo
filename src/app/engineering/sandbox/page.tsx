"use client";

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const SandboxScene = dynamic(() => import('./SandboxScene'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),_rgba(2,6,23,0.96)_55%,_rgba(2,6,23,1)_100%)] text-white">
      <div className="rounded-[28px] border border-cyan-400/25 bg-slate-950/70 px-8 py-6 text-center shadow-[0_0_60px_rgba(34,211,238,0.15)] backdrop-blur-xl">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-cyan-300/80">Loading</p>
        <p className="mt-3 text-2xl font-semibold tracking-tight">Sincronizando el sector Aurora...</p>
      </div>
    </div>
  ),
});

export default function SpaceSandboxPage() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      <div className="absolute left-6 top-6 z-50">
        <Link
          href="/engineering"
          className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/55 px-4 py-2 text-sm text-white/70 backdrop-blur-md transition-colors hover:text-white"
        >
          <ArrowLeft size={16} /> Volver al hub
        </Link>
      </div>

      <div className="absolute inset-0 z-0">
        <SandboxScene />
      </div>
    </main>
  );
}
