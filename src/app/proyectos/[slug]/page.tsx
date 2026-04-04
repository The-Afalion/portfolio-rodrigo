import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import DetalleProyecto from '@/components/DetalleProyecto';
import { PROYECTOS_CORE as DATOS_PROYECTOS } from '@/datos/proyectos';
import { PageHero, PageShell, SectionPanel } from '@/components/shell/PagePrimitives';

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
    <PageShell>
      <div className="mb-8">
        <Link href="/" className="action-pill">
          <ArrowLeft size={16} /> Volver al portfolio
        </Link>
      </div>

      <PageHero
        eyebrow="Proyecto"
        title={proyecto.title}
        description={proyecto.description}
      />

      <SectionPanel>
          <DetalleProyecto proyecto={proyecto} />
      </SectionPanel>
    </PageShell>
  );
}

export async function generateStaticParams() {
  return DATOS_PROYECTOS.map(proyecto => ({
    slug: proyecto.id,
  }));
}
