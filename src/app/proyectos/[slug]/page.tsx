"use client"; // Marcado como componente de cliente

import { DATOS_PROYECTOS } from "@/datos/proyectos";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Github, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

// La función generateStaticParams se elimina para forzar el renderizado dinámico
// y evitar problemas en el build de Vercel.

export default function PaginaDetalleProyecto({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const proyecto = DATOS_PROYECTOS.find((p) => p.slug === slug);

  if (!proyecto) {
    notFound();
  }

  const { titulo, descripcionLarga, etiquetas, enlace, github, icono: Icono } = proyecto;

  return (
    <main className="bg-background text-foreground min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-24 sm:py-32">
        
        {/* Encabezado y Navegación */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}>
          <Link href="/#proyectos" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-mono text-sm mb-8">
            <ArrowLeft size={18} />
            Volver a proyectos
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <Icono size={40} className="text-blue-500" />
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter">{titulo}</h1>
          </div>
        </motion.div>

        {/* Contenido Principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
          
          {/* Columna de Descripción */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }} className="md:col-span-2 space-y-4 text-lg text-muted-foreground">
            {descripcionLarga.map((parrafo, i) => (
              <p key={i}>{parrafo}</p>
            ))}
          </motion.div>

          {/* Barra Lateral de Información */}
          <motion.aside initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.6 } }} className="space-y-8">
            <div>
              <h3 className="text-xl font-bold mb-3">Tecnologías</h3>
              <div className="flex flex-wrap gap-2">
                {etiquetas.map((tag) => (
                  <span key={tag} className="px-3 py-1 text-xs font-mono rounded-full bg-secondary text-muted-foreground border border-border">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3">Enlaces</h3>
              <div className="flex flex-col gap-3">
                {github !== "#" && (
                  <a href={github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                    <Github size={20} />
                    <span>Código Fuente</span>
                  </a>
                )}
                {enlace !== "#" && (
                  <a href={enlace} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                    <ExternalLink size={20} />
                    <span>Ver Demo</span>
                  </a>
                )}
              </div>
            </div>
          </motion.aside>
        </div>

      </div>
    </main>
  );
}
