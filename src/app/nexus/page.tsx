import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';

const NexusDashboard = dynamic(() => import('./NexusDashboard'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-black flex items-center justify-center text-green-500 font-mono">Inicializando Sistema NEXUS...</div>,
});

export default function NexusPage() {
  return (
    <main className="min-h-screen bg-black text-green-500 font-mono p-6 relative overflow-hidden">
      {/* Fondo Matrix/Cyberpunk */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 255, 0, .3) 25%, rgba(0, 255, 0, .3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, .3) 75%, rgba(0, 255, 0, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 255, 0, .3) 25%, rgba(0, 255, 0, .3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, .3) 75%, rgba(0, 255, 0, .3) 76%, transparent 77%, transparent)', backgroundSize: '50px 50px' }}>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8 border-b border-green-900/50 pb-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-green-700 hover:text-green-500 transition-colors text-sm mb-2">
              <ArrowLeft size={16} /> SYSTEM_EXIT
            </Link>
            <h1 className="text-3xl font-bold tracking-tighter text-white">NEXUS <span className="text-green-500 text-sm font-normal">v1.0.4</span></h1>
            <p className="text-green-800 text-xs">Distributed File System Simulator</p>
          </div>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              SYSTEM ONLINE
            </div>
          </div>
        </header>

        <NexusDashboard />
      </div>
    </main>
  );
}
