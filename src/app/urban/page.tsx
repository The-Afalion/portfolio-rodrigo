import Link from 'next/link';
import { ArrowLeft, Building, Zap, Network } from 'lucide-react';
import dynamic from 'next/dynamic';

const UrbanScene = dynamic(() => import('./UrbanScene'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-black flex items-center justify-center text-violet-500 font-mono">CARGANDO SIMULACIÓN URBANA...</div>,
});

export default function UrbanPage() {
  return (
    <main className="h-screen w-screen bg-black text-violet-400 font-mono relative overflow-hidden">
      
      {/* Escena 3D de fondo */}
      <div className="absolute inset-0 z-0">
        <UrbanScene />
      </div>

      {/* Interfaz superpuesta (HUD) */}
      <div className="relative z-10 p-6 flex flex-col justify-between h-full pointer-events-none">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <Link href="/engineering" className="inline-flex items-center gap-2 text-violet-700 hover:text-violet-400 transition-colors text-sm pointer-events-auto">
              <ArrowLeft size={16} /> VOLVER AL CORE
            </Link>
            <h1 className="text-3xl font-bold tracking-tighter text-white mt-2">URBAN PULSE</h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-violet-500">ESTADO: <span className="text-green-400 font-bold">EN LÍNEA</span></p>
            <p className="text-xs text-violet-800">LATENCIA: 12ms</p>
          </div>
        </header>

        {/* Footer / Stats */}
        <footer className="grid grid-cols-3 gap-4 text-white">
          <div className="p-4 bg-black/50 backdrop-blur-sm border border-violet-900/50 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-violet-400 mb-1">
              <Building size={14} />
              <span>CONSUMO ENERGÉTICO</span>
            </div>
            <p className="text-2xl font-bold">7.2 GW</p>
          </div>
          <div className="p-4 bg-black/50 backdrop-blur-sm border border-violet-900/50 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-violet-400 mb-1">
              <Zap size={14} />
              <span>FLUJO DE TRÁFICO</span>
            </div>
            <p className="text-2xl font-bold">8,129 <span className="text-sm font-normal text-violet-400">veh/h</span></p>
          </div>
          <div className="p-4 bg-black/50 backdrop-blur-sm border border-violet-900/50 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-violet-400 mb-1">
              <Network size={14} />
              <span>NODOS DE RED</span>
            </div>
            <p className="text-2xl font-bold">99.8% <span className="text-sm font-normal text-violet-400">UP</span></p>
          </div>
        </footer>
      </div>
    </main>
  );
}
