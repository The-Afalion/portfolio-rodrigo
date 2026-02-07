"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from 'next/navigation';
import BarraNavegacion from "@/components/BarraNavegacion";
import PieDePagina from "@/components/PieDePagina";
import VentanaBoletin from "@/components/VentanaBoletin";
import GestorDeEventosGlobales from "@/components/GestorDeEventosGlobales";
import EfectoMatrix from "@/components/EfectoMatrix";
import GestorDeEventosRandy from "@/components/GestorDeEventosRandy";
import OjoVigilante from "@/components/OjoVigilante";
import Minijuego1984 from "@/components/Minijuego1984";
import { usarContextoGlobal } from "@/context/ContextoGlobal";

export default function ContenidoPrincipal({ children }: { children: React.ReactNode }) {
  const { efectoMatrixVisible, estado1984 } = usarContextoGlobal();
  const pathname = usePathname();

  return (
    <>
      <GestorDeEventosGlobales />
      <GestorDeEventosRandy />
      
      <BarraNavegacion />
      
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname} // La clave es la ruta, para que se anime al cambiar
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.main>
      </AnimatePresence>

      <VentanaBoletin />
      <PieDePagina />
      
      <AnimatePresence>
        {efectoMatrixVisible && <EfectoMatrix />}
        {estado1984 !== 'inactivo' && estado1984 !== 'minijuego' && <OjoVigilante />}
        {estado1984 === 'minijuego' && <Minijuego1984 />}
      </AnimatePresence>
    </>
  );
}
