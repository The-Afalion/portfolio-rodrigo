"use client";
import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import EscenaCubo from "../escenas-3d/EscenaCubo";
import { DATOS_PROYECTOS } from "@/datos/proyectos";

const variantesTarjeta = {
  oculto: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
    },
  },
};

export default function Proyectos() {
  return (
    <section id="proyectos" className="relative py-32 px-4 md:px-10 bg-background text-foreground overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10">
        <EscenaCubo />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold mb-16 text-center"
        >
          Proyectos Seleccionados
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {DATOS_PROYECTOS.map((proyecto, indice) => {
            const Icono = proyecto.icono;
            return (
              <motion.div
                key={proyecto.slug}
                variants={variantesTarjeta}
                initial="oculto"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: indice * 0.1 }}
                className={`
                  group relative p-8 rounded-3xl overflow-hidden
                  bg-secondary/50 border border-border
                  transition-all duration-300 hover:border-blue-500/50
                  ${proyecto.destacado ? "md:col-span-2" : "md:col-span-1"}
                `}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                     style={{ transform: 'skewX(-20deg) translateX(-150%)', transition: 'transform 0.7s' }}
                />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 rounded-xl bg-background text-blue-500">
                      <Icono size={28} />
                    </div>
                    <div className="flex gap-4 text-muted-foreground">
                      {proyecto.github !== "#" && (
                        <a href={proyecto.github} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors"><Github size={20}/></a>
                      )}
                      {/* El enlace principal ahora apunta a la página de detalle */}
                      <Link href={`/proyectos/${proyecto.slug}`} className="hover:text-blue-500 transition-colors"><ExternalLink size={20}/></Link>
                    </div>
                  </div>

                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-foreground mb-2">{proyecto.titulo}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">{proyecto.descripcionCorta}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-auto">
                    {proyecto.etiquetas.map((etiqueta) => (
                      <span key={etiqueta} className="px-3 py-1 text-xs font-mono rounded-full bg-background text-muted-foreground">
                        {etiqueta}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  );
}
