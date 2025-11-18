"use client";
import { motion } from "framer-motion";
import { Terminal, Cpu, ChevronDown } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white transition-colors duration-300">

      {/* --- FONDO TÉCNICO (GRID ADAPTATIVO) --- */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-20"
           style={{
             backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
             backgroundSize: '50px 50px'
           }}
      ></div>

      {/* Efecto Vignette */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-gray-50 via-transparent to-gray-50 dark:from-[#050505] dark:to-[#050505]"></div>

      {/* --- CONTENIDO --- */}
      <div className="z-10 text-center px-4 max-w-4xl">

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-mono mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          SYSTEM ONLINE // v2.1
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl md:text-9xl font-bold tracking-tighter mb-6"
        >
          RODRIGO <br className="md:hidden"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 dark:from-blue-400 dark:to-purple-500">
            ALONSO
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="font-mono text-gray-600 dark:text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10"
        >
          Ingeniero Informático UAM. <br/>
          Fusionando <span className="text-black dark:text-white font-bold">Sistemas Críticos</span> con <span className="text-black dark:text-white font-bold">Experiencias Digitales</span>.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Link href="#projects">
            <button className="group relative px-8 py-4 font-mono font-bold rounded-lg bg-black dark:bg-white text-white dark:text-black overflow-hidden transition-all hover:scale-105">
              <span className="relative flex items-center gap-2">
                <Terminal size={18} /> VER PROYECTOS
              </span>
            </button>
          </Link>

          <Link href="/chess">
            <button className="px-8 py-4 font-mono font-bold rounded-lg border border-gray-300 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/10 transition-all flex items-center gap-2">
              <Cpu size={18} /> LABS IA
            </button>
          </Link>
        </motion.div>
      </div>

      {/* Indicador de Scroll */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ delay: 2, duration: 2, repeat: Infinity }}
        className="absolute bottom-10 text-gray-400"
      >
        <ChevronDown size={24} />
      </motion.div>
    </section>
  );
}