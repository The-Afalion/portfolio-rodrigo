import Link from 'next/link';
import { ArrowLeft, Music, Construction } from 'lucide-react';

export default function SonicPage() {
  return (
    <main className="min-h-screen bg-black text-cyan-400 font-mono p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at center, #06b6d4 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto h-full flex flex-col text-center items-center justify-center">
        <header className="flex items-center justify-between mb-12 w-full">
          <Link href="/engineering" className="inline-flex items-center gap-2 text-cyan-700 hover:text-cyan-400 transition-colors text-sm">
            <ArrowLeft size={16} /> VOLVER AL CORE
          </Link>
        </header>

        <div className="p-6 bg-cyan-950/20 border border-cyan-800/50 rounded-xl flex flex-col items-center">
          <div className="p-4 bg-cyan-500/10 rounded-full mb-6">
            <Music size={48} />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter text-white">Sonic Canvas</h1>
          <p className="text-cyan-700 text-xs mt-1 mb-8">Sintetizador Visual Experimental</p>
          
          <div className="flex items-center gap-4 text-amber-400 border border-amber-400/30 bg-amber-500/10 px-6 py-4 rounded-lg">
            <Construction size={24} />
            <div>
              <h2 className="font-bold">EN CONSTRUCCIÓN</h2>
              <p className="text-xs text-amber-400/80">Este laboratorio está siendo ensamblado. ¡Vuelve pronto!</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
