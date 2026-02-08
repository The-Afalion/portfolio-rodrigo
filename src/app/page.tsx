"use client";

import { useScroll } from "framer-motion";
import { useRef } from "react";
import BackgroundManager from '@/components/BackgroundManager';
import Presentacion from "@/components/Presentacion";
import Proyectos from "@/components/Proyectos";
import SobreMi from "@/components/SobreMi";
import Trayectoria from "@/components/Trayectoria";
import SeccionBoletin from "@/components/SeccionBoletin";
import LaboratoriosSection from "@/components/LaboratoriosSection";

export default function Home() {
  const refContenedor = useRef(null);
  const { scrollYProgress: progresoScrollY } = useScroll({
    target: refContenedor,
    offset: ["start start", "end start"],
  });

  return (
    <main ref={refContenedor} className="min-h-screen bg-transparent text-white selection:bg-white selection:text-black overflow-x-hidden">
      
      {/* Fondo Global Interactivo (Plexo / Network) */}
      <BackgroundManager progresoScrollY={progresoScrollY} />

      {/* Hero Section */}
      <Presentacion progresoScrollY={progresoScrollY} />

      {/* Secciones de Contenido */}
      <SobreMi />
      <Trayectoria />
      <Proyectos />

      {/* Nueva Sección de Laboratorios (Las Dos Puertas) */}
      <LaboratoriosSection />

      {/* Boletín y Footer */}
      <SeccionBoletin />
      
      <footer className="relative z-10 py-8 text-center text-neutral-600 text-xs font-mono border-t border-white/5 bg-black/50 backdrop-blur-sm">
        © {new Date().getFullYear()} Rodrigo Alonso. Built with Next.js 14, R3F & Supabase.
      </footer>
    </main>
  );
}
