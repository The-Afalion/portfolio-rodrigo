"use client";

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const SandboxScene = dynamic(() => import('./SandboxScene'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-black flex items-center justify-center text-white font-mono">Iniciando Simulación 6DOF...</div>,
});

export default function SpaceSandboxPage() {
  return (
    <main className="h-screen w-screen bg-black overflow-hidden relative">
      <div className="absolute top-6 left-6 z-50">
        <Link href="/engineering" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors font-mono text-sm">
          <ArrowLeft size={16} /> ABANDONAR SIMULACIÓN
        </Link>
      </div>

      <div className="absolute inset-0 z-0">
        <SandboxScene />
      </div>
    </main>
  );
}
