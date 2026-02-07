"use client";
import { motion } from "framer-motion";
import { ExternalLink, Github, Code2, Database, Layout } from "lucide-react";
import Link from "next/link";
import FondoRejilla from "./FondoRejilla";

const proyectos = [
  {
    titulo: "Motor de Ajedrez Neuronal",
    descripcion: "Algoritmo de ajedrez con toma de decisiones basada en evaluación posicional estática, usando una variante de Dijkstra.",
    etiquetas: ["TypeScript", "Next.js", "Chess.js"],
    enlace: "/chess/human-vs-ai", // Corregido
    github: "https://github.com/The-Afalion",
    destacado: true,
    icono: <Code2 size={28} />
  },
  {
    titulo: "Infraestructura en la Nube",
    descripcion: "Arquitectura sin servidor (serverless) desplegada en AWS usando Terraform y funciones Lambda.",
    etiquetas: ["AWS", "Terraform", "Python"],
    enlace: "#",
    github: "#",
    destacado: false,
    icono: <Database size={28} />
  },
  {
    titulo: "Portafolio v2",
    descripcion: "Diseño de interfaz y experiencia de usuario con animaciones en Framer Motion, Three.js y Tailwind CSS.",
    etiquetas: ["React", "Tailwind", "Three.js"],
    enlace: "#",
    github: "#",
    destacado: false,
    icono: <Layout size={28} />
  }
];

const variantesContenedor = {
  oculto: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const variantesTarjeta = {
  oculto: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

export default function Proyectos() {
  return (
    <section id="proyectos" className="relative py-32 px-4 md:px-10 bg-background text-foreground overflow-hidden">
      <div className="absolute inset-0 z-0">
        <FondoRejilla />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 100 }}
          className="text-4xl md:text-5xl font-bold mb-16 text-center"
        >
          Proyectos Seleccionados
        </motion.h2>

        <motion.div
          variants={variantesContenedor}
          initial="oculto"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {proyectos.map((proyecto, indice) => (
            <motion.div
              key={indice}
              variants={variantesTarjeta}
              className={`
                group relative p-8 rounded-3xl overflow-hidden
                bg-secondary/50 border border-border
                transition-all duration-300 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10
                ${proyecto.destacado ? "md:col-span-2" : "md:col-span-1"}
              `}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                   style={{ transform: 'skewX(-20deg) translateX(-150%)', transition: 'transform 0.7s' }}
                   onMouseMove={(e) => {
                     const rect = e.currentTarget.getBoundingClientRect();
                     const x = e.clientX - rect.left;
                     e.currentTarget.style.transform = `skewX(-20deg) translateX(${x - rect.width / 2}px)`;
                   }}
              />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 rounded-xl bg-background text-blue-500">
                    {proyecto.icono}
                  </div>
                  <div className="flex gap-4 text-muted-foreground">
                    <Link href={proyecto.github} target="_blank" className="hover:text-foreground transition-colors"><Github size={20}/></Link>
                    <Link href={proyecto.enlace} className="hover:text-blue-500 transition-colors"><ExternalLink size={20}/></Link>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2">{proyecto.titulo}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">{proyecto.descripcion}</p>

                <div className="flex flex-wrap gap-2">
                  {proyecto.etiquetas.map((etiqueta, i) => (
                    <span key={i} className="px-3 py-1 text-xs font-mono rounded-full bg-background text-muted-foreground">
                      {etiqueta}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
