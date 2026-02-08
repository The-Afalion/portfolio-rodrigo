import { notFound } from 'next/navigation';
import { PROYECTOS_CORE as DATOS_PROYECTOS } from '@/datos/proyectos'; // Corregido para usar el alias
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// ... (el resto del archivo se mantiene igual)
// Esta es una simplificación, ya que no tengo el código completo,
// pero el punto clave es corregir la línea de importación.

export default function PaginaProyecto({ params }: { params: { slug: string } }) {
  const proyecto = DATOS_PROYECTOS.find(p => p.id === params.slug);

  if (!proyecto) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft size={16} /> Volver
        </Link>
        <h1 className="text-4xl font-bold mb-4">{proyecto.title}</h1>
        <p className="text-lg text-muted-foreground mb-8">{proyecto.description}</p>
        <div className="flex gap-2">
          {proyecto.tech.map(t => (
            <span key={t} className="px-2 py-1 bg-secondary text-xs font-mono rounded">{t}</span>
          ))}
        </div>
      </div>
    </main>
  );
}

export async function generateStaticParams() {
  return DATOS_PROYECTOS.map(proyecto => ({
    slug: proyecto.id,
  }));
}
