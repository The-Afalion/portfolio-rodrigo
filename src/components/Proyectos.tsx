"use client";
import { motion } from "framer-motion";
import { ExternalLink, Github, Orbit } from "lucide-react";
import Link from "next/link";
import TituloSeccion from "./TituloSeccion";
import { FEATURED_PROJECTS } from "@/datos/proyectos";

const variantesContenedor = {
  oculto: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const variantesTarjeta = {
  oculto: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

export default function Proyectos() {
  return (
    <section id="proyectos" className="relative py-32 px-4 md:px-10 bg-secondary text-foreground overflow-hidden border-t border-border">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex justify-center mb-16">
          <TituloSeccion>Proyectos Destacados</TituloSeccion>
        </div>

        <motion.div
          variants={variantesContenedor}
          initial="oculto"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3"
        >
          {FEATURED_PROJECTS.map((proyecto) => (
            <motion.div
              key={proyecto.id}
              variants={variantesTarjeta}
              className={`
                group relative p-8 rounded-none overflow-hidden
                bg-card border border-border
                transition-all duration-300 hover:border-foreground
              `}
            >
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-8">
                  <div
                    className="transition-transform duration-500 group-hover:scale-110"
                    style={{ color: proyecto.color }}
                  >
                    <Orbit size={28} />
                  </div>
                  <div className="flex gap-4 text-muted-foreground">
                    {proyecto.github && (
                      <Link href={proyecto.github} target="_blank" className="hover:text-foreground transition-colors">
                        <Github size={20} strokeWidth={1.5} />
                      </Link>
                    )}
                    <Link href={`/proyectos/${proyecto.id}`} className="hover:text-foreground transition-colors">
                      <ExternalLink size={20} strokeWidth={1.5} />
                    </Link>
                  </div>
                </div>

                <div className="mb-4 flex items-center justify-between gap-4">
                  <h3 className="text-2xl font-serif font-bold text-foreground transition-colors group-hover:text-primary">
                    {proyecto.title}
                  </h3>
                  <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
                    {proyecto.id}
                  </span>
                </div>

                <p className="mb-8 flex-grow text-sm font-light leading-relaxed text-muted-foreground">
                  {proyecto.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {proyecto.tech.map((etiqueta) => (
                    <span key={etiqueta} className="px-3 py-1 text-[10px] font-mono tracking-widest uppercase border border-border text-muted-foreground group-hover:border-foreground/30 transition-colors">
                      {etiqueta}
                    </span>
                  ))}
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-border pt-5 text-sm">
                  <Link href={`/proyectos/${proyecto.id}`} className="font-medium text-foreground transition-colors hover:text-primary">
                    Ver detalle
                  </Link>
                  <Link href={proyecto.link} className="text-muted-foreground transition-colors hover:text-foreground">
                    Abrir experiencia
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
