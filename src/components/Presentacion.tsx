"use client";
import { motion } from "framer-motion";
import { Terminal, Cpu, ArrowDown } from "lucide-react";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  },
};

const BotonAnimado = ({ href, icono: Icono, texto, className = "" }: { href: string, icono: React.ElementType, texto: string, className?: string }) => (
  <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
    <Link href={href} className={`group flex py-4 px-8 font-mono text-sm tracking-widest uppercase rounded-none border transition-all items-center gap-3 ${className}`}>
      <Icono size={16} strokeWidth={1.5} className="group-hover:rotate-12 transition-transform" /> {texto}
    </Link>
  </motion.div>
);

export default function Presentacion() {
  return (
    <section className="relative min-h-[90vh] w-full flex flex-col justify-center items-center text-center px-6 overflow-hidden">

      {/* Fondo Sutil Radian */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0" />

      {/* Grid Overlay sutil para textura */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0"></div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="z-20 w-full max-w-4xl flex flex-col items-center mt-12"
      >

        {/* Etiqueta Minimalista */}
        <motion.div variants={itemVariants} className="mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 font-mono text-[10px] sm:text-xs tracking-[0.2em] uppercase border-b border-primary/30 text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Ingeniero de Software
          </span>
        </motion.div>

        {/* Titular Principal Brutalista */}
        <motion.h1
          variants={itemVariants}
          className="text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] font-display tracking-tighter leading-[0.85] text-foreground mb-10 font-bold uppercase"
        >
          RODRIGO
          <br />
          <span className="text-muted-foreground tracking-tight">
            ALONSO.
          </span>
        </motion.h1>

        {/* Subtítulo Limpio */}
        <motion.p
          variants={itemVariants}
          className="font-sans text-muted-foreground text-base md:text-xl max-w-2xl mx-auto mb-14 font-light tracking-wide leading-relaxed"
        >
          Construyendo arquitectura digital <br className="hidden sm:block" />
          con precisión milimétrica y diseño impecable.
        </motion.p>

        {/* Botonera Editorial */}
        <motion.div className="flex flex-col sm:flex-row justify-center gap-6 w-full sm:w-auto">
          <BotonAnimado
            href="#proyectos"
            icono={Terminal}
            texto="Explorar Trabajo"
            className="border-foreground bg-foreground text-background hover:bg-transparent hover:text-foreground"
          />
          <BotonAnimado
            href="/engineering"
            icono={Cpu}
            texto="Pensamiento"
            className="border-border bg-transparent text-foreground hover:border-foreground"
          />
        </motion.div>
      </motion.div>

      {/* Indicador Minimalista */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0], y: [0, 20, 0] }}
        transition={{ delay: 2, duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-12 text-muted-foreground/30 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] font-mono tracking-widest uppercase rotate-90 mb-4">Descubrir</span>
        <ArrowDown size={14} strokeWidth={1} />
      </motion.div>

    </section>
  );
}
