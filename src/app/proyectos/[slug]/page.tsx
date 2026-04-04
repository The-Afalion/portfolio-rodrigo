import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import DetalleProyecto from '@/components/DetalleProyecto';
import { PROYECTOS_CORE as DATOS_PROYECTOS } from '@/datos/proyectos';

type PageProps = {
  params: { slug: string };
};

export function generateMetadata({ params }: PageProps): Metadata {
  const proyecto = DATOS_PROYECTOS.find((item) => item.id === params.slug);

  if (!proyecto) {
    return {
      title: 'Proyecto no encontrado',
    };
  }

  return {
    title: proyecto.title,
    description: proyecto.description,
  };
}

export default function PaginaProyecto({ params }: PageProps) {
  const proyecto = DATOS_PROYECTOS.find(p => p.id === params.slug);

  if (!proyecto) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background px-4 py-12 md:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft size={16} /> Volver al inicio
        </Link>

        <div className="overflow-hidden rounded-3xl border border-border bg-secondary/40">
          <DetalleProyecto proyecto={proyecto} />
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
