"use client";

import { useScroll, useMotionValueEvent } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Presentacion from "@/components/Presentacion";
import Proyectos from "@/components/Proyectos";
import SobreMi from "@/components/SobreMi";
import Trayectoria from "@/components/Trayectoria";
import SeccionBoletin from "@/components/SeccionBoletin";
import LaboratoriosSection from "@/components/LaboratoriosSection";
import FondoPlexo from "@/components/FondoPlexo";
import GridBackground from "@/components/backgrounds/GridBackground";

export default function Home() {
  const refContenedor = useRef(null);
  const { scrollYProgress } = useScroll({
    target: refContenedor,
    offset: ["start start", "end end"],
  });

  const [showPlexus, setShowPlexus] = useState(true);

  // Ocultar el fondo 3D pesado cuando el usuario hace scroll hacia abajo
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest > 0.1) {
      setShowPlexus(false);
    } else {
      setShowPlexus(true);
    }
  });

  return (
    <main ref={refContenedor} className="bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      
      {/* Gestión de Fondos Optimizada */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {showPlexus ? (
          <FondoPlexo progresoScrollY={scrollYProgress} />
        ) : (
          <GridBackground />
        )}
      </div>

      <div className="relative z-10">
        <Presentacion progresoScrollY={scrollYProgress} />
        <SobreMi />
        <Trayectoria />
        <Proyectos />
        <LaboratoriosSection />
        <SeccionBoletin />
      </div>
      
      <footer className="relative z-10 py-8 text-center text-muted-foreground text-xs font-mono border-t bg-background/50 backdrop-blur-sm">
        © {new Date().getFullYear()} Rodrigo Alonso. Built with Next.js 14, R3F & Supabase.
      </footer>
    </main>
  );
}
