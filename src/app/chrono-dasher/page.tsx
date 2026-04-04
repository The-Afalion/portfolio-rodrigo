import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';

const Game = dynamic(() => import('./Game'), {
  ssr: false,
  loading: () => <div className="h-screen w-screen bg-black flex items-center justify-center text-orange-500 font-mono">CARGANDO SIMULACIÓN DE VUELO...</div>,
});

export default function ChronoDasherPage() {
  return (
    <main className="h-screen w-screen bg-black text-orange-400 font-mono relative overflow-hidden">
      
      {/* Escena 3D del juego */}
      <div className="absolute inset-0 z-0">
        <Game />
      </div>

      {/* Interfaz superpuesta (HUD) */}
      <div className="absolute inset-0 z-10 p-6 flex flex-col justify-between pointer-events-none">
        <header className="flex items-center justify-between">
          <Link href="/engineering" className="inline-flex items-center gap-2 text-orange-700 hover:text-orange-400 transition-colors text-sm pointer-events-auto">
            <ArrowLeft size={16} /> SALIR DE LA SIMULACIÓN
          </Link>
          <div className="text-right">
            <p className="text-lg font-bold text-white">PUNTUACIÓN: <span id="score">0</span></p>
          </div>
        </header>
        
        <div id="game-status" className="text-center text-4xl font-bold text-white animate-pulse">
          PULSA ESPACIO PARA EMPEZAR
        </div>

        <footer className="text-center text-xs text-orange-800">
          CONTROLES: Flechas Izquierda/Derecha para moverse.
        </footer>
      </div>
    </main>
  );
}
