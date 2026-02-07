import { DATOS_PROYECTOS } from "@/datos/proyectos";
import { notFound } from "next/navigation";
import Modal from "./modal"; // Componente base del modal
import DetalleProyecto from "@/components/DetalleProyecto"; // Componente con el contenido

export default function ProyectoModal({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const proyecto = DATOS_PROYECTOS.find((p) => p.slug === slug);

  if (!proyecto) {
    notFound();
  }

  return (
    <Modal>
      <DetalleProyecto proyecto={proyecto} />
    </Modal>
  );
}
