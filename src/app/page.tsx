import Link from 'next/link';
import { Cpu, Gamepad2, ArrowRight, Github, Linkedin, Mail, Code2, Database, Globe } from 'lucide-react';
import Presentacion from "@/components/Presentacion";
import Proyectos from "@/components/Proyectos";
import SobreMi from "@/components/SobreMi";
import Trayectoria from "@/components/Trayectoria";
import SeccionBoletin from "@/components/SeccionBoletin";
import LaboratoriosSection from "@/components/LaboratoriosSection";
import DynamicThemeBackground from "@/components/backgrounds/DynamicThemeBackground";

export default function Home() {
  return (
    <main className="bg-transparent text-foreground selection:bg-primary/20 selection:text-foreground overflow-x-hidden min-h-screen">

      <DynamicThemeBackground />

      <div className="relative z-10">
        {/* La Presentacion ya no necesita el scrollYProgress para el fondo */}
        <Presentacion />
        <SobreMi />
        <Trayectoria />
        <Proyectos />
        <LaboratoriosSection />
        <SeccionBoletin />
      </div>

      {/* Footer eliminado de aquí porque ya está en layout.tsx o PieDePagina.tsx */}
    </main>
  );
}
