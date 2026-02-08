import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';

const SonicCanvas = dynamic(() => import('./SonicCanvas'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-black flex items-center justify-center text-cyan-500 font-mono">INICIALIZANDO MOTOR DE AUDIO...</div>,
});

export default function SonicPage() {
  return (
    <main className="min-h-screen bg-black text-cyan-400 font-mono p-6 relative overflow-hidden flex flex-col">
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <header className="flex items-center justify-between mb-8 border-b border-cyan-900/50 pb-4">
          <div>
            <Link href="/engineering" className="inline-flex items-center gap-2 text-cyan-700 hover:text-cyan-400 transition-colors text-sm mb-2">
              <ArrowLeft size={16} /> VOLVER AL CORE
            </Link>
            <h1 className="text-3xl font-bold tracking-tighter text-white">SONIC CANVAS</h1>
            <p className="text-cyan-800 text-xs">Sintetizador Visual Experimental</p>
          </div>
        </header>
      </div>

      <div className="relative z-10 flex-grow flex items-center justify-center">
        <SonicCanvas />
      </div>
    </main>
  );
}
