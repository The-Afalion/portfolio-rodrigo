import Link from 'next/link';
import { Cpu, Gamepad2, ArrowRight } from 'lucide-react';

export default function LaboratoriosSection() {
  return (
    <section className="relative z-10 min-h-[80vh] flex flex-col items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
      <h2 className="text-4xl font-bold mb-16 text-center text-white">Explora el Universo</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        
        {/* Puerta 1: Engineering Core */}
        <Link href="/engineering" className="group relative overflow-hidden rounded-3xl bg-neutral-900 border border-neutral-800 p-10 hover:border-blue-500/50 transition-all duration-500 hover:shadow-[0_0_50px_rgba(59,130,246,0.2)]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col h-full items-center text-center">
            <div className="mb-6 p-5 bg-blue-500/10 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform duration-300">
              <Cpu size={48} />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-white group-hover:text-blue-400 transition-colors">Engineering Core</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              El núcleo técnico. Simulaciones distribuidas, herramientas CAD, algoritmos visuales y experimentos 3D.
            </p>
            <span className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-blue-400 uppercase tracking-wider group-hover:gap-4 transition-all">
              Entrar al Núcleo <ArrowRight size={16} />
            </span>
          </div>
        </Link>

        {/* Puerta 2: Chess Hub */}
        <Link href="/chess" className="group relative overflow-hidden rounded-3xl bg-neutral-900 border border-neutral-800 p-10 hover:border-amber-500/50 transition-all duration-500 hover:shadow-[0_0_50px_rgba(245,158,11,0.2)]">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col h-full items-center text-center">
            <div className="mb-6 p-5 bg-amber-500/10 rounded-2xl text-amber-400 group-hover:scale-110 transition-transform duration-300">
              <Gamepad2 size={48} />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-white group-hover:text-amber-400 transition-colors">Chess Hub</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              El laboratorio estratégico. Torneos de IA en tiempo real, partidas comunitarias masivas y análisis de datos.
            </p>
            <span className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-amber-400 uppercase tracking-wider group-hover:gap-4 transition-all">
              Entrar al Laboratorio <ArrowRight size={16} />
            </span>
          </div>
        </Link>

      </div>
    </section>
  );
}
