"use client";
import { useScroll } from "framer-motion";
import { useRef } from "react";
import dynamic from 'next/dynamic';

import Presentacion from "@/components/Presentacion";
import Proyectos from "@/components/Proyectos";
import SobreMi from "@/components/SobreMi";
import Trayectoria from "@/components/Trayectoria";
import SeccionBoletin from "@/components/SeccionBoletin";

// Carga dinámica de la sección de ajedrez para evitar errores de renderizado en el servidor
const ChessHubSection = dynamic(() => import('@/components/ChessHubSection'), {
  ssr: false,
  loading: () => <div className="h-96 w-full" /> // Un placeholder para evitar saltos de layout
});

export default function PaginaPrincipal() {
  const refContenedor = useRef(null);
  const { scrollYProgress: progresoScrollY } = useScroll({
    target: refContenedor,
    offset: ["start start", "end start"],
  });

  return (
    <main ref={refContenedor} className="bg-background selection:bg-blue-500/30">
      <Presentacion progresoScrollY={progresoScrollY} />
      <SobreMi />
      <Trayectoria />
      <Proyectos />
      <ChessHubSection />
      <SeccionBoletin />
    </main>
  );
}
