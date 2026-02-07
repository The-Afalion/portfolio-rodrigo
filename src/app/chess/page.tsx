"use client"; // Necesario para Framer Motion

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

export default function ChessHubPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8">
      <div className="text-center mb-16">
        <h1 className="text-6xl font-bold tracking-tighter mb-4">Laboratorio de Ajedrez</h1>
        <p className="text-lg text-muted-foreground font-mono">Explora las fronteras de la estrategia y la inteligencia artificial.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
    </main>
  );
}
