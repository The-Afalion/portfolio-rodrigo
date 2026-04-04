import { notFound } from 'next/navigation';
import { PROYECTOS_CORE as DATOS_PROYECTOS } from '@/datos/proyectos'; // Corregido para usar el alias
import DetalleProyecto from '@/components/DetalleProyecto';

export default function ModalProyecto({ params }: { params: { slug: string } }) {
  const proyecto = DATOS_PROYECTOS.find(p => p.id === params.slug);

  if (!proyecto) {
    notFound();
  }

  return <DetalleProyecto proyecto={proyecto} />;
}
