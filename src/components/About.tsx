"use client";
import { motion } from "framer-motion";
import { Terminal, Cpu, Server, Wind, Medal, Anchor, Box } from "lucide-react";

export default function About() {
  const badgeBase = "px-3 py-1 text-[11px] font-mono border rounded-md transition-colors cursor-default";

  return (
    <section className="py-24 px-4 md:px-10 bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white relative overflow-hidden transition-colors duration-300">

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">

        {/* --- INGENIERO --- */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="p-8 rounded-3xl border border-gray-200 dark:border-green-500/20 bg-white dark:bg-[#111] shadow-xl dark:shadow-green-900/5 relative group"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-green-100 dark:bg-green-500/10 rounded-xl text-green-600 dark:text-green-400">
              <Terminal size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold font-mono tracking-tight">
                INGENIERÍA<span className="text-green-600 dark:text-green-500">.exe</span>
              </h3>
              <p className="text-xs text-gray-500 font-mono">UAM Student // Full Stack</p>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed text-sm">
            Estudiante de <strong className="text-black dark:text-white">Ingeniería Informática en la UAM</strong>.
            Mi enfoque no es solo "que funcione", sino entender por qué funciona.
          </p>

          {/* Stack Grid */}
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Core Systems</h4>
              <div className="flex flex-wrap gap-2">
                <span className={`${badgeBase} border-gray-200 dark:border-green-500/20 bg-gray-50 dark:bg-green-500/5 text-gray-700 dark:text-green-200`}>C / C++</span>
                <span className={`${badgeBase} border-gray-200 dark:border-orange-500/20 bg-gray-50 dark:bg-orange-500/5 text-gray-700 dark:text-orange-200`}>Rust</span>
                <span className={`${badgeBase} border-gray-200 dark:border-blue-500/20 bg-gray-50 dark:bg-blue-500/5 text-gray-700 dark:text-blue-200`}>Python</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Infrastructure</h4>
              <div className="flex flex-wrap gap-2">
                 <span className={`${badgeBase} border-gray-200 dark:border-purple-500/20 bg-gray-50 dark:bg-purple-500/5 text-gray-700 dark:text-purple-200`}>Docker</span>
                 <span className={`${badgeBase} border-gray-200 dark:border-yellow-500/20 bg-gray-50 dark:bg-yellow-500/5 text-gray-700 dark:text-yellow-200`}>Firebase</span>
                 <span className={`${badgeBase} border-gray-200 dark:border-cyan-500/20 bg-gray-50 dark:bg-cyan-500/5 text-gray-700 dark:text-cyan-200`}>MariaDB</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* --- DEPORTISTA --- */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="p-8 rounded-3xl border border-gray-200 dark:border-cyan-500/20 bg-white dark:bg-[#0c1214] shadow-xl relative overflow-hidden group"
        >
          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="p-3 bg-cyan-100 dark:bg-cyan-500/10 rounded-xl text-cyan-600 dark:text-cyan-400">
              <Wind size={24} />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">
              ALTO RENDIMIENTO
            </h3>
          </div>

          <ul className="space-y-4 relative z-10">
             <li className="flex gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                <Medal className="text-yellow-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Equipo de Élite Madrileño</h4>
                  <p className="text-xs text-gray-500 mt-1">Ex-deportista de competición. Disciplina y gestión de presión.</p>
                </div>
             </li>
             <li className="flex gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                <Anchor className="text-cyan-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Árbitro & Entrenador</h4>
                  <p className="text-xs text-gray-500 mt-1">Liderazgo, responsabilidad y toma de decisiones.</p>
                </div>
             </li>
          </ul>
        </motion.div>

      </div>
    </section>
  );
}