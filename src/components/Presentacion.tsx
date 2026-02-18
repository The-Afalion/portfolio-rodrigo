"use client";
import { motion } from "framer-motion";
import { Terminal, Cpu, ChevronDown } from "lucide-react";
import Link from "next/link";
import PlexusBackground from "./PlexusBackground";

const BotonAnimado = ({ href, icono: Icono, texto }: { href: string, icono: React.ElementType, texto: string }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
  >
    <Link href={href} className="group relative px-6 py-3 font-mono font-bold rounded-lg bg-foreground text-background overflow-hidden transition-all flex items-center gap-2 text-sm">
      <Icono size={16} /> {texto}
    </Link>
  </motion.div>
);

export default function Presentacion() {
  return (
    <section className="relative h-screen w-full flex flex-col justify-center items-center text-center overflow-hidden p-6 bg-black">
      <PlexusBackground />
      <div className="z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          DISPONIBLE PARA TRABAJAR
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.4 }}
          className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-white"
        >
          RODRIGO{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
            ALONSO
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="font-sans text-white/70 text-lg md:text-xl max-w-2xl mx-auto mb-10"
        >
          Ingeniero de Software Full Stack.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, delay: 1 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <BotonAnimado href="#proyectos" icono={Terminal} texto="Mis Proyectos" />
          <BotonAnimado href="/engineering" icono={Cpu} texto="Sobre Ingeniería" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
        className="absolute bottom-10 text-white/50"
      >
        <ChevronDown size={24} />
      </motion.div>
    </section>
  );
}
