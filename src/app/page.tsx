"use client";
import { useScroll } from "framer-motion";
import { useRef } from "react";
import Presentacion from "@/components/Presentacion";
import Proyectos from "@/components/Proyectos";
import SobreMi from "@/components/SobreMi";
import Trayectoria from "@/components/Trayectoria";
import SeccionBoletin from "@/components/SeccionBoletin";

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
      <SeccionBoletin />
    </main>
  );
}
