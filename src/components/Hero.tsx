"use client";
import { motion } from "framer-motion";
import { Terminal, Code2, Cpu } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-[#050505] text-white">

      {/* --- FONDO TÉCNICO (GRID) --- */}
      <div className="absolute inset-0 z-0 opacity-20"
           style={{
             backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`,
             backgroundSize: '50px 50px'
           }}
      ></div>

      {/* Efecto de viñeta para oscurecer bordes */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]"></div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="z-10 text-center px-4">

        {/* Badge de estado */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-xs font-mono mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          SYSTEM ONLINE // v2.0.4
        </motion.div>

        {/* Título Principal */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-8xl font-bold tracking-tighter mb-6"
        >
          RODRIGO <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">ALONSO</span>
        </motion.h1>

        {/* Subtítulo / Descripción */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="font-mono text-gray-400 max-w-2xl mx-auto text-sm md:text-base space-y-2"
        >
          <p>Estudiante de <span className="text-white font-bold">Ingeniería Informática</span>.</p>
          <p>
            Explorando los límites entre el <span className="text-blue-400">Full-Stack</span> y la <span className="text-purple-400">Inteligencia Artificial</span>.
          </p>
        </motion.div>

        {/* Botones de Acción */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <button className="group relative px-6 py-3 font-mono font-bold rounded bg-white text-black overflow-hidden transition-all hover:bg-gray-200">
            <div className="absolute inset-0 w-0 bg-green-400 transition-all duration-[250ms] ease-out group-hover:w-full opacity-10"></div>
            <span className="relative flex items-center gap-2">
              <Terminal size={18} /> PROYECTOS
            </span>
          </button>

          <button className="px-6 py-3 font-mono font-bold rounded border border-white/20 hover:bg-white/5 transition-colors flex items-center gap-2">
            <Cpu size={18} /> IA LABS
          </button>
        </motion.div>
      </div>
    </section>
  );
}