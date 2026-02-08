import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Cargamos el componente 3D dinámicamente para evitar errores de SSR (Server Side Rendering)
// ya que Three.js necesita acceso al objeto 'window' del navegador.
const GalaxyScene = dynamic(() => import('./GalaxyScene'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-black flex items-center justify-center text-white font-mono">Inicializando Núcleo...</div>,
});

export default function EngineeringPage() {
  return (
    <main className="h-screen w-screen bg-black overflow-hidden relative">
      {/* UI Superpuesta (HUD) */}
      <div className="absolute top-6 left-6 z-50">
        <Link href="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors font-mono text-sm">
          <ArrowLeft size={16} /> SYSTEM_EXIT
        </Link>
      </div>

      <div className="absolute bottom-6 left-6 z-50 pointer-events-none">
        <h1 className="text-4xl font-bold text-white tracking-tighter">ENGINEERING CORE</h1>
        <p className="text-white/50 font-mono text-xs mt-1">Navegación: Scroll / Drag</p>
      </div>

      {/* Escena 3D */}
      <div className="absolute inset-0 z-0">
        <GalaxyScene />
      </div>
    </main>
  );
}
