"use client";
import { motion } from "framer-motion";
import { Terminal, Wind, Medal, Anchor } from "lucide-react";
import CubeGridScene from "./scenes/CubeGridScene";

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function About() {
  const badgeBase = "px-3 py-1 text-xs font-mono border rounded-md transition-colors cursor-default";

  return (
    <section id="about" className="relative py-32 px-4 md:px-10 bg-background text-foreground overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20">
        <CubeGridScene />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="p-8 rounded-3xl border border-border bg-background/80 backdrop-blur-sm shadow-2xl"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-secondary rounded-xl text-blue-500">
              <Terminal size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold font-mono tracking-tight">
                INGENIERÍA<span className="text-blue-500">.dev</span>
              </h3>
              <p className="text-xs text-muted-foreground font-mono">UAM // Software & Systems</p>
            </div>
          </motion.div>

          <motion.p variants={itemVariants} className="text-muted-foreground mb-8 leading-relaxed">
            Graduado en <strong className="text-foreground">Ingeniería Informática</strong>, mi pasión es construir software robusto y eficiente, desde el metal hasta la nube.
          </motion.p>

          <motion.div variants={itemVariants} className="space-y-6">
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Core Systems</h4>
              <div className="flex flex-wrap gap-2">
                <span className={`${badgeBase} border-blue-500/20 bg-blue-500/10 text-blue-300`}>C / C++</span>
                <span className={`${badgeBase} border-orange-500/20 bg-orange-500/10 text-orange-300`}>Rust</span>
                <span className={`${badgeBase} border-yellow-500/20 bg-yellow-500/10 text-yellow-300`}>Python</span>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Infrastructure</h4>
              <div className="flex flex-wrap gap-2">
                 <span className={`${badgeBase} border-purple-500/20 bg-purple-500/10 text-purple-300`}>Docker</span>
                 <span className={`${badgeBase} border-red-500/20 bg-red-500/10 text-red-300`}>Firebase</span>
                 <span className={`${badgeBase} border-cyan-500/20 bg-cyan-500/10 text-cyan-300`}>MariaDB</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="p-8 rounded-3xl border border-border bg-background/80 backdrop-blur-sm shadow-2xl"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-secondary rounded-xl text-cyan-400">
              <Wind size={24} />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">
              MENTALIDAD DE ATLETA
            </h3>
          </motion.div>

          <motion.ul variants={itemVariants} className="space-y-4">
             <li className="flex gap-4 p-4 rounded-2xl bg-secondary">
                <Medal className="text-yellow-500 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold">Disciplina y Resiliencia</h4>
                  <p className="text-sm text-muted-foreground mt-1">Forjadas en años de competición deportiva de alto rendimiento.</p>
                </div>
             </li>
             <li className="flex gap-4 p-4 rounded-2xl bg-secondary">
                <Anchor className="text-cyan-500 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold">Liderazgo y Decisión</h4>
                  <p className="text-sm text-muted-foreground mt-1">Experiencia como árbitro y entrenador en entornos de alta presión.</p>
                </div>
             </li>
          </motion.ul>
        </motion.div>
      </div>
    </section>
  );
}
