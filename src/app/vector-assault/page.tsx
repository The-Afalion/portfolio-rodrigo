import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';

const GameScene = dynamic(() => import('./GameScene'), {
  ssr: false,
  loading: () => <div className="h-screen w-screen bg-black flex items-center justify-center text-pink-500 font-mono">CARGANDO SIMULADOR DE COMBATE...</div>,
});

export default function VectorAssaultPage() {
  return (
    <main className="h-screen w-screen bg-black text-pink-400 font-mono relative overflow-hidden">
      
      {/* Escena 3D del juego */}
      <div className="absolute inset-0 z-0">
        <GameScene />
      </div>

      {/* Interfaz superpuesta (HUD) */}
      <div className="absolute inset-0 z-10 p-6 flex flex-col justify-between pointer-events-none">
        <header className="flex items-center justify-between">
          <Link href="/engineering" className="inline-flex items-center gap-2 text-pink-700 hover:text-pink-400 transition-colors text-sm pointer-events-auto">
            <ArrowLeft size={16} /> SALIR DE LA SIMULACIÓN
          </Link>
          <div className="text-right">
            <p className="text-lg font-bold text-white">PUNTUACIÓN: <span id="score">0</span></p>
          </div>
        </header>
        
        <footer className="text-center text-xs text-pink-800">
          CONTROLES: Mover ratón para apuntar, Clic para disparar.
        </footer>
      </div>
    </main>
  );
}
