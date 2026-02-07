"use client";

import Link from 'next/link';
import { Users, Cpu, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

const GameModeCard = ({ href, icon: Icon, title, description }: any) => (
  <Link href={href}>
    <motion.div 
      className="p-8 rounded-2xl border border-border bg-secondary/50 h-full flex flex-col items-center text-center hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all"
      whileHover={{ y: -5 }}
    >
      <Icon size={48} className="mb-4 text-blue-500" />
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </motion.div>
  </Link>
);

export default function ChessHubSection() {
  return (
    <section id="chess-hub" className="py-32 px-4 md:px-10 bg-background text-foreground">
      <div className="max-w-6xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 100 }}
          className="text-4xl md:text-5xl font-bold mb-16 text-center"
        >
          Laboratorio de Ajedrez
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <GameModeCard 
            href="/chess/community"
            icon={Users}
            title="Ajedrez Comunitario"
            description="Únete a un bando y vota por el próximo movimiento en una partida global que dura semanas."
          />
          <GameModeCard 
            href="/chess/ai-battle"
            icon={Bot}
            title="Batalla de IAs"
            description="Observa un torneo diario de eliminación directa entre 8 IAs con personalidades únicas."
          />
          <GameModeCard 
            href="/chess/human-vs-ai"
            icon={Cpu}
            title="Humano vs. IA"
            description="Pon a prueba tu habilidad contra una IA configurable. El modo clásico."
          />
        </div>
      </div>
    </section>
  );
}
