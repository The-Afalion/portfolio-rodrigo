import Link from 'next/link';
import { Cpu, Gamepad2, ArrowRight, Github, Linkedin, Mail, Code2, Database, Globe } from 'lucide-react';
import Presentacion from "@/components/Presentacion";
import Proyectos from "@/components/Proyectos";
import SobreMi from "@/components/SobreMi";
import Trayectoria from "@/components/Trayectoria";
import SeccionBoletin from "@/components/SeccionBoletin";
import LaboratoriosSection from "@/components/LaboratoriosSection";

export default function Home() {
  return (
    <main className="bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      
      {/* El fondo ahora es un gradiente sutil definido en globals.css */}

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
