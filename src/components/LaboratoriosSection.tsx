"use client";
import Link from 'next/link';
import { Cpu, Gamepad2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import TituloSeccion from './TituloSeccion';

const Card = ({ href, icon, title, description, accentColorText, children }: any) => (
  <Link href={href} className="group block h-full">
    <div className="relative overflow-hidden bg-card border-[1px] border-border p-8 h-full flex flex-col transition-colors duration-300 hover:bg-foreground hover:border-foreground">
      <div className="relative z-10">
        <div className="mb-8 inline-block p-4 border border-border group-hover:border-background group-hover:bg-background text-foreground transition-colors duration-300">
          {icon}
        </div>
        <h3 className="text-3xl font-display font-bold mb-4 text-foreground group-hover:text-background transition-colors duration-300 uppercase tracking-tight">{title}</h3>
        <p className="font-sans text-muted-foreground group-hover:text-background/80 leading-relaxed mb-10 transition-colors duration-300">
          {description}
        </p>
      </div>
      <div className="mt-auto relative z-10 pt-4 border-t border-border group-hover:border-background/20 transition-colors duration-300">
        <span className="inline-flex items-center gap-2 text-xs font-mono font-bold text-foreground group-hover:text-background uppercase tracking-widest transition-colors duration-300">
          {children} <ArrowRight size={16} />
        </span>
      </div>
    </div>
  </Link>
);

export default function LaboratoriosSection() {
  return (
    <section id="laboratorios" className="py-32 px-4">
      <div className="max-w-5xl mx-auto">
        <TituloSeccion>Laboratorios Interactivos</TituloSeccion>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card
              href="/projects"
              icon={<Cpu size={32} strokeWidth={1} />}
              title="Engineering Core"
              description="Un espacio para la experimentación técnica severa. Incluye simulaciones de físicas, algoritmos visuales e infraestructura."
            >
              Explorar Core
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card
              href="/chess"
              icon={<Gamepad2 size={32} strokeWidth={1} />}
              title="Chess Hub"
              description="Laboratorio táctico con motor de IA propio, análisis de partidas y visualizaciones algorítmicas de datos en tiempo real."
            >
              Visitar Hub
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

