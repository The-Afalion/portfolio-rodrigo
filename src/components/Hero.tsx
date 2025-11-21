"use client";
import { motion, useTransform, MotionValue } from "framer-motion";
import { Terminal, Cpu, ChevronDown, Box } from "lucide-react";
import Link from "next/link";
import PlexusBackground from "./PlexusBackground";

type HeroProps = {
  scrollYProgress: MotionValue<number>;
};

const Title = ({ text }: { text: string }) => {
  return (
    <span className="inline-block">
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.05 }}
          className="inline-block"
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
};

export default function Hero({ scrollYProgress }: HeroProps) {
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <section className="relative h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-background text-foreground">
      <PlexusBackground scrollYProgress={scrollYProgress} />
      
      <motion.div style={{ y }} className="z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-mono mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          SYSTEM ONLINE // v3.0
        </motion.div>

        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6">
          <Title text="RODRIGO" />{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
            <Title text="ALONSO" />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="font-mono text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10"
        >
          Ingeniero de Software. <br />
          Construyendo puentes entre{" "}
          <span className="text-foreground font-bold">
            Sistemas de Precisión
          </span>{" "}
          y{" "}
          <span className="text-foreground font-bold">
            Experiencias Inmersivas
          </span>
          .
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Link
            href="#projects"
            className="group relative px-8 py-4 font-mono font-bold rounded-lg bg-foreground text-background overflow-hidden transition-all hover:scale-105 flex items-center gap-2"
          >
            <Terminal size={18} /> VER PROYECTOS
          </Link>
          <Link
            href="/models"
            className="px-8 py-4 font-mono font-bold rounded-lg border border-border hover:bg-secondary transition-all flex items-center gap-2"
          >
            <Box size={18} /> MODELOS 3D
          </Link>
          <Link
            href="/chess"
            className="px-8 py-4 font-mono font-bold rounded-lg border border-border hover:bg-secondary transition-all flex items-center gap-2"
          >
            <Cpu size={18} /> LABS IA
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ delay: 2, duration: 2, repeat: Infinity }}
        className="absolute bottom-10 text-muted-foreground"
      >
        <ChevronDown size={24} />
      </motion.div>
    </section>
  );
}
