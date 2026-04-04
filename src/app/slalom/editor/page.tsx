import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';

// Cargamos el editor dinámicamente para evitar problemas de SSR con el canvas
const SlalomEditor = dynamic(() => import('./SlalomEditor'), {
  ssr: false,
  loading: () => <div className="flex h-[600px] items-center justify-center text-muted-foreground font-mono">Cargando herramientas de diseño...</div>,
});

export default function EditorPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header Minimalista */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/slalom" className="p-2 hover:bg-secondary rounded-md transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-bold text-sm md:text-base">Nuevo Diseño</h1>
            <p className="text-xs text-muted-foreground hidden md:block">Canal Olímpico Estándar</p>
          </div>
        </div>
        
        {/* Aquí irán los controles de guardado dentro del cliente */}
      </header>

      {/* Área de Trabajo */}
      <div className="flex-grow relative overflow-hidden bg-secondary/10">
        <SlalomEditor />
      </div>
    </main>
  );
}
