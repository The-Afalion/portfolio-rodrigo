"use client";

import { useScroll } from "framer-motion";
import { useRef } from "react";
import Presentacion from "@/components/Presentacion";
import Proyectos from "@/components/Proyectos";
import SobreMi from "@/components/SobreMi";
import Trayectoria from "@/components/Trayectoria";
import SeccionBoletin from "@/components/SeccionBoletin";
import LaboratoriosSection from "@/components/LaboratoriosSection";
import FondoPlexo from "@/components/FondoPlexo";

export default function Home() {
  const refContenedor = useRef(null);
  const { scrollYProgress } = useScroll({
    target: refContenedor,
    offset: ["start start", "end end"],
  });

  return (
    <main ref={refContenedor} className="bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      
      {/* Fondo 3D permanente y optimizado */}
      <FondoPlexo />

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
