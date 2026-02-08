import Link from 'next/link';
import { Cpu, Gamepad2, ArrowRight, Github, Linkedin, Mail } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black overflow-hidden relative">
      
      {/* Fondo sutil */}
      <div className="absolute inset-0 z-0 opacity-20" 
           style={{ backgroundImage: 'radial-gradient(circle at center, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        
        {/* Header / Intro */}
        <div className="text-center max-w-2xl mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
            Rodrigo Hernández
          </h1>
          <p className="text-xl text-gray-400 font-light leading-relaxed">
            Full Stack Developer & AI Engineer. <br/>
            Construyendo experiencias digitales complejas, interactivas y escalables.
          </p>
          
          {/* Social Links */}
          <div className="flex justify-center gap-6 mt-8">
            <a href="https://github.com" target="_blank" className="text-gray-500 hover:text-white transition-colors"><Github /></a>
            <a href="https://linkedin.com" target="_blank" className="text-gray-500 hover:text-white transition-colors"><Linkedin /></a>
            <a href="mailto:tu@email.com" className="text-gray-500 hover:text-white transition-colors"><Mail /></a>
          </div>
        </div>

        {/* Las Dos Puertas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          
          {/* Puerta 1: Engineering Core */}
          <Link href="/engineering" className="group relative overflow-hidden rounded-2xl bg-neutral-900/50 border border-neutral-800 p-8 hover:border-neutral-600 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="mb-6 p-4 bg-black/50 w-fit rounded-xl border border-neutral-800 group-hover:border-white/20 transition-colors">
                <Cpu size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2 group-hover:translate-x-2 transition-transform duration-300">Engineering Core</h2>
              <p className="text-gray-400 mb-8 flex-grow">
                Explora mis proyectos técnicos más avanzados en un entorno 3D inmersivo. Simulaciones distribuidas, herramientas CAD y algoritmos complejos.
              </p>
              <div className="flex items-center gap-2 text-sm font-mono text-white/50 group-hover:text-white transition-colors">
                ENTRAR AL NÚCLEO <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Puerta 2: Chess Hub */}
          <Link href="/chess" className="group relative overflow-hidden rounded-2xl bg-neutral-900/50 border border-neutral-800 p-8 hover:border-neutral-600 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="mb-6 p-4 bg-black/50 w-fit rounded-xl border border-neutral-800 group-hover:border-white/20 transition-colors">
                <Gamepad2 size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2 group-hover:translate-x-2 transition-transform duration-300">Chess Hub</h2>
              <p className="text-gray-400 mb-8 flex-grow">
                Un ecosistema completo de ajedrez. Torneos de IA en tiempo real, partidas comunitarias masivas y análisis de datos.
              </p>
              <div className="flex items-center gap-2 text-sm font-mono text-white/50 group-hover:text-white transition-colors">
                ENTRAR AL LABORATORIO <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

        </div>

        <footer className="absolute bottom-6 text-neutral-600 text-xs font-mono">
          © {new Date().getFullYear()} Rodrigo Hernández. Built with Next.js 14, R3F & Supabase.
        </footer>
      </div>
    </main>
  );
}
