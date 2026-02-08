import { supabaseAdmin } from '@/lib/db';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import FondoAjedrez from '@/components/FondoAjedrez';
import ForceStartButton from './ForceStartButton';

export const dynamic = 'force-dynamic';

// Temporalmente, no renderizaremos el cliente para aislar el problema.
// Solo mostraremos el botón de inicio.

export default async function AiBattlePage() {
  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8 relative overflow-hidden">
      <FondoAjedrez />
      <div className="absolute top-6 left-6 z-20">
        <Link href="/#chess-hub" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-mono">
          <ArrowLeft size={20} />
          Volver al Laboratorio
        </Link>
      </div>

      <div className="text-center mb-12 z-10 relative">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground to-muted-foreground">
          Torneo de Titanes
        </h1>
        <p className="text-muted-foreground font-mono mt-2">Las IAs combaten por la supremacía. Cada hora, una nueva batalla.</p>
      </div>

      <div className="max-w-7xl mx-auto z-10 relative">
        <div className="text-center bg-secondary/50 backdrop-blur-sm border border-border p-8 rounded-lg flex flex-col items-center">
          <h2 className="text-2xl font-bold font-mono">Panel de Control del Torneo</h2>
          <p className="text-muted-foreground mt-2">Usa este botón para iniciar un nuevo torneo y simular la primera ronda.</p>
          <ForceStartButton />
        </div>
      </div>
    </main>
  );
}
