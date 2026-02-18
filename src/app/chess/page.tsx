import Link from 'next/link';
import { ArrowLeft, Users, Cpu } from 'lucide-react';
import FondoAjedrez from '@/components/FondoAjedrez'; // Usaremos este fondo temático

function FeatureCard({ title, description, href, icon }: { title: string, description: string, href: string, icon: React.ReactNode }) {
  return (
    <Link href={href} className="group relative overflow-hidden rounded-lg bg-secondary/50 backdrop-blur-sm border border-border p-8 transition-all duration-300 hover:border-primary/50 hover:bg-secondary/80 hover:-translate-y-1">
      <div className="relative z-10 flex flex-col text-center items-center">
        <div className="p-4 mb-4 rounded-full bg-primary/10 text-primary border border-primary/20 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
        <p className="text-muted-foreground text-sm max-w-xs">{description}</p>
        <span className="mt-6 text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          Acceder
        </span>
      </div>
    </Link>
  );
}

export default function ChessHubPage() {
  return (
    <main className="min-h-screen w-full bg-background text-foreground overflow-hidden relative flex flex-col">
      <FondoAjedrez />
      
      <div className="absolute top-6 left-6 z-50">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-mono text-sm">
          <ArrowLeft size={16} /> Volver al Portfolio
        </Link>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center flex-grow text-center p-4">
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-foreground">
            Chess Hub
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Un laboratorio de experimentación en el mundo del ajedrez.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
          <FeatureCard 
            title="Humano vs. IA" 
            description="Desafía a un motor de ajedrez personalizado basado en algoritmos de búsqueda y evaluación."
            href="/chess/human-vs-ai"
            icon={<Cpu size={32} />}
          />
          <FeatureCard 
            title="Ajedrez Comunitario" 
            description="Participa en una partida masiva donde la comunidad vota por el siguiente movimiento."
            href="/chess/community"
            icon={<Users size={32} />}
          />
        </div>
      </div>
      
      <footer className="relative z-10 py-4 text-center text-muted-foreground text-xs font-mono">
        Diseño inspirado en la dualidad y estrategia del ajedrez.
      </footer>
    </main>
  );
}
