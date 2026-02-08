"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useTransform, MotionValue } from "framer-motion";
import { Terminal, Cpu, ChevronDown, Box } from "lucide-react";
import Link from "next/link";
import FondoPlexo from "./FondoPlexo"; // Reactivado

type PresentacionProps = {
  progresoScrollY: MotionValue<number>;
};

const TituloAnimado = ({ texto, className }: { texto: string, className?: string }) => {
  return (
    <span className={`inline-block ${className}`}>
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

  const opacidadContenido = useTransform(progresoScrollY, [0, 0.1], [1, 0]);

  return (
    <section className="relative h-screen w-full flex flex-col justify-center items-center overflow-hidden text-foreground">
      
      {/* El fondo 3D ahora vive y muere aquí */}
      <FondoPlexo progresoScrollY={progresoScrollY} />
      
      <div className="z-10 text-center">
        <motion.div style={{ opacity: opacidadContenido }}>
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono mb-8 cursor-pointer"
            onClick={handleAdminClick}
            title={`Admin clicks: ${clickCount}`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            SISTEMA EN LÍNEA // v3.1
          </div>
        </motion.div>

        <motion.h1 
          style={{ opacity: opacidadContenido }}
          className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 text-foreground"
        >
          <TituloAnimado texto="RODRIGO" />{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
            <TituloAnimado texto="ALONSO" />
          </span>
        </motion.h1>

        <motion.div style={{ opacity: opacidadContenido }}>
          <p className="font-mono text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Ingeniero de Software. <br />
            Construyendo puentes entre{" "}
            <span className="text-foreground font-bold">Sistemas de Precisión</span> y{" "}
            <span className="text-foreground font-bold">Experiencias Inmersivas</span>.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <BotonAnimado href="#proyectos" icono={Terminal} texto="VER PROYECTOS" />
            <BotonAnimado href="/engineering" icono={Box} texto="ENGINEERING CORE" />
            <BotonAnimado href="/chess" icono={Cpu} texto="CHESS HUB" />
          </div>
        </motion.div>
      </div>

      <motion.div
        style={{ opacity: opacidadContenido }}
        className="absolute bottom-10 text-muted-foreground animate-bounce"
      >
        <ChevronDown size={24} />
      </motion.div>
    </section>
  );
}
