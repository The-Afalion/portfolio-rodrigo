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
    // El color de fondo y texto principal ahora viene de las variables de tema
    <main ref={refContenedor} className="bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      
      <BackgroundManager progresoScrollY={progresoScrollY} />

      {/* El resto de los componentes usarán las clases de Tailwind que heredan los colores */}
      <Presentacion progresoScrollY={progresoScrollY} />
      <SobreMi />
      <Trayectoria />
      <Proyectos />
      <LaboratoriosSection />
      <SeccionBoletin />
      
      <footer className="relative z-10 py-8 text-center text-muted-foreground text-xs font-mono border-t bg-background/50 backdrop-blur-sm">
        © {new Date().getFullYear()} Rodrigo Alonso. Built with Next.js 14, R3F & Supabase.
      </footer>
    </main>
  );
}
