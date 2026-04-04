import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';

const GaltonBoard = dynamic(() => import('./GaltonBoard'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-black flex items-center justify-center text-white font-mono">Cargando Motor de Físicas...</div>,
});

export default function PhysicsPage() {
  return (
    <main className="min-h-screen bg-black text-white font-mono p-6 relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col">
        <header className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm mb-2">
              <ArrowLeft size={16} /> SYSTEM_EXIT
            </Link>
            <h1 className="text-3xl font-bold tracking-tighter">GALTON BOARD</h1>
            <p className="text-white/50 text-xs">Simulación del Teorema del Límite Central</p>
          </div>
        </header>

        <div className="flex-grow bg-white/5 rounded-xl border border-white/10 overflow-hidden relative">
          <GaltonBoard />
        </div>
      </div>
    </main>
  );
}
