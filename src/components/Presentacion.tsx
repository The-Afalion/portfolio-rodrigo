"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useTransform, MotionValue } from "framer-motion";
import { Terminal, Cpu, ChevronDown, Box } from "lucide-react";
import Link from "next/link";
// import FondoPlexo from "./FondoPlexo"; // Desactivado para usar el fondo global

type PresentacionProps = {
  progresoScrollY: MotionValue<number>;
};

const TituloAnimado = ({ texto }: { texto: string }) => {
  return (
    <span className="inline-block">
      {texto.split("").map((caracter, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 + i * 0.05 }}
          className="inline-block"
        >
          {caracter}
        </motion.span>
      ))}
    </span>
  );
};

const BotonAnimado = ({ href, icono: Icono, texto }: { href: string, icono: React.ElementType, texto: string }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
  >
    <Link href={href} className="group relative px-8 py-4 font-mono font-bold rounded-lg bg-foreground text-background overflow-hidden transition-all flex items-center gap-2">
      <Icono size={18} /> {texto}
    </Link>
  </motion.div>
);

export default function Presentacion({ progresoScrollY }: PresentacionProps) {
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);

  const handleAdminClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 10) {
      router.push('/admin');
    }
  };

  const yTitulo = useTransform(progresoScrollY, [0, 0.5], ["0%", "-50%"]);
  const escalaTitulo = useTransform(progresoScrollY, [0, 0.5], [1, 0.8]);
  const opacidadTitulo = useTransform(progresoScrollY, [0, 0.4, 0.5], [1, 1, 0]);
  const opacidadContenido = useTransform(progresoScrollY, [0, 0.2], [1, 0]);
  const opacidadElementosUI = useTransform(progresoScrollY, [0, 0.05], [1, 0]);

  return (
    <section className="relative h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-transparent text-foreground">
      {/* Fondo desactivado
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ 
          scale: useTransform(progresoScrollY, [0, 1], [1, 1.5]),
          opacity: useTransform(progresoScrollY, [0, 0.8], [1, 0]),
        }}
      >
        <FondoPlexo progresoScrollY={progresoScrollY} />
      </motion.div>
      */}
      
      <div className="z-10 text-center">
        <motion.div style={{ opacity: opacidadElementosUI }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-mono mb-8 cursor-pointer"
            onClick={handleAdminClick}
            title={`Admin clicks: ${clickCount}`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            SISTEMA EN LÍNEA // v3.0
          </motion.div>
        </motion.div>

        <motion.h1 
          style={{ y: yTitulo, scale: escalaTitulo, opacity: opacidadTitulo }}
          className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 text-white"
        >
          <TituloAnimado texto="RODRIGO" />{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
            <TituloAnimado texto="ALONSO" />
          </span>
        </motion.h1>

        <motion.div style={{ opacity: opacidadContenido }}>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="font-mono text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10"
          >
            Ingeniero de Software. <br />
            Construyendo puentes entre{" "}
            <span className="text-white font-bold">Sistemas de Precisión</span> y{" "}
            <span className="text-white font-bold">Experiencias Inmersivas</span>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, delay: 1.2 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <BotonAnimado href="#proyectos" icono={Terminal} texto="VER PROYECTOS" />
            <BotonAnimado href="/engineering" icono={Box} texto="ENGINEERING CORE" />
            <BotonAnimado href="/chess" icono={Cpu} texto="CHESS HUB" />
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        style={{ opacity: opacidadElementosUI }}
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
