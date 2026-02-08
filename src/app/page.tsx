import Link from 'next/link';
import { Cpu, Gamepad2, ArrowRight, Github, Linkedin, Mail, Code2, Database, Globe } from 'lucide-react';
import ParallaxBackground from '@/components/ParallaxBackground';

export default function Home() {
  return (
    <main className="min-h-screen bg-transparent text-white selection:bg-white selection:text-black overflow-x-hidden">
      
      <ParallaxBackground />

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
            Rodrigo Alonso
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
            Ingeniero de Software Full Stack & Arquitecto de Soluciones.
            <br />
            Transformando ideas complejas en realidad digital.
          </p>
          
          <div className="flex justify-center gap-8 mt-12">
            <a href="https://github.com" target="_blank" className="p-3 rounded-full bg-white/5 hover:bg-white/10 hover:text-white text-gray-400 transition-all hover:scale-110"><Github size={24} /></a>
            <a href="https://linkedin.com" target="_blank" className="p-3 rounded-full bg-white/5 hover:bg-white/10 hover:text-white text-gray-400 transition-all hover:scale-110"><Linkedin size={24} /></a>
            <a href="mailto:tu@email.com" className="p-3 rounded-full bg-white/5 hover:bg-white/10 hover:text-white text-gray-400 transition-all hover:scale-110"><Mail size={24} /></a>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-gray-600">
            <ArrowRight className="rotate-90" />
          </div>
        </div>
      </section>

      {/* --- PHILOSOPHY SECTION --- */}
      <section className="relative z-10 py-32 px-6 bg-gradient-to-b from-transparent to-black/80">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-white/80">Más allá del código</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
              <Code2 className="w-10 h-10 mb-4 text-blue-400 mx-auto" />
              <h3 className="text-xl font-bold mb-2">Arquitectura Limpia</h3>
              <p className="text-gray-400 text-sm">Código escalable, mantenible y diseñado para durar. No solo funciona, se entiende.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
              <Database className="w-10 h-10 mb-4 text-green-400 mx-auto" />
              <h3 className="text-xl font-bold mb-2">Datos en Tiempo Real</h3>
              <p className="text-gray-400 text-sm">Sistemas reactivos que cobran vida. WebSockets, Serverless y sincronización instantánea.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
              <Globe className="w-10 h-10 mb-4 text-purple-400 mx-auto" />
              <h3 className="text-xl font-bold mb-2">Experiencia Inmersiva</h3>
              <p className="text-gray-400 text-sm">Interfaces que atrapan. 3D, animaciones fluidas y diseño centrado en el usuario.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- NAVIGATION DOORS --- */}
      <section className="relative z-10 min-h-[80vh] flex flex-col items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
        <h2 className="text-4xl font-bold mb-16 text-center">Explora el Universo</h2>
        
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

      <footer className="relative z-10 py-8 text-center text-neutral-600 text-xs font-mono border-t border-white/5 bg-black">
        © {new Date().getFullYear()} Rodrigo Alonso. Built with Next.js 14, R3F & Supabase.
      </footer>
    </main>
  );
}
