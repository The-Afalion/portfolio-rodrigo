"use client";

import React from "react";
import { AnimatePresence } from "framer-motion";
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

  return (
    <>
      <GestorDeEventosGlobales />
      <GestorDeEventosRandy />
      
      <BarraNavegacion />
      {children}
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
