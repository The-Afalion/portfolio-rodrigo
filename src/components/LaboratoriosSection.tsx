"use client";
import Link from 'next/link';
import { Cpu, Gamepad2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import TituloSeccion from './TituloSeccion';

const Card = ({ href, icon, title, description, accentColor, children }: any) => (
  <Link href={href}>
    <motion.div
      whileHover={{ y: -5, boxShadow: `0 10px 25px -5px rgba(${accentColor}, 0.1), 0 8px 10px -6px rgba(${accentColor}, 0.1)` }}
      className="group relative overflow-hidden rounded-xl bg-secondary border border-border p-8 h-full flex flex-col"
    >
      <div className="relative z-10">
        <div className={`mb-6 inline-block p-4 rounded-lg bg-primary/10 text-primary`}>
          {icon}
        </div>
        <h3 className="text-2xl font-bold mb-3 text-foreground">{title}</h3>
        <p className="text-muted-foreground leading-relaxed mb-6">{description}</p>
      </div>
      <div className="mt-auto relative z-10">
        <span className="inline-flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider group-hover:gap-3 transition-all">
          {children} <ArrowRight size={16} />
        </span>
      </div>
    </motion.div>
  </Link>
);

export default function LaboratoriosSection() {
  return (
    <section className="py-32 px-4">
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
              href="/engineering"
              icon={<Cpu size={32} />}
              title="Engineering Core"
              description="Un espacio para la experimentación técnica. Incluye simulaciones de físicas, algoritmos visuales y herramientas de software."
              accentColor="59, 130, 246"
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
              icon={<Gamepad2 size={32} />}
              title="Chess Hub"
              description="Un laboratorio de ajedrez con un motor de IA propio, análisis de partidas y visualizaciones de datos."
              accentColor="245, 158, 11"
            >
              Visitar Hub
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
