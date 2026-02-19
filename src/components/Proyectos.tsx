"use client";
import { motion } from "framer-motion";
import { ExternalLink, Github, Code2, Database, Layout } from "lucide-react";
import Link from "next/link";
import FondoRejilla from "./FondoRejilla";
import TituloSeccion from "./TituloSeccion";

const proyectos = [
  {
    titulo: "Motor de Ajedrez Neuronal",
    descripcion: "Un motor de ajedrez que utiliza un algoritmo de búsqueda de grafos para la toma de decisiones, con una función de evaluación estática para analizar posiciones.",
    etiquetas: ["TypeScript", "Next.js", "Chess.js"],
    enlace: "/chess/human-vs-ai",
    github: "https://github.com/The-Afalion/portfolio-rodrigo",
    destacado: true,
    icono: <Code2 size={28} />
  },
  {
    titulo: "Infraestructura como Código (IaC)",
    descripcion: "Arquitectura serverless en AWS, definida y desplegada mediante Terraform para una gestión de infraestructura automatizada y escalable.",
    etiquetas: ["AWS", "Terraform", "Python"],
    github: "https://github.com/The-Afalion/portfolio-rodrigo",
    destacado: false,
    icono: <Database size={28} />
  },
  {
    titulo: "Portafolio Personal",
    descripcion: "Este mismo portafolio, diseñado con Next.js y Tailwind CSS. Incluye animaciones con Framer Motion y elementos 3D con Three.js.",
    etiquetas: ["React", "Tailwind", "Three.js"],
    github: "https://github.com/The-Afalion/portfolio-rodrigo",
    destacado: false,
    icono: <Layout size={28} />
  }
];

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
    <section id="proyectos" className="relative py-32 px-4 md:px-10 bg-background text-foreground overflow-hidden">
      <div className="absolute inset-0 z-0">
        <FondoRejilla />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <TituloSeccion>Proyectos Destacados</TituloSeccion>

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
                group relative p-8 rounded-2xl overflow-hidden
                bg-card border border-border
                transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10
                ${proyecto.destacado ? "md:col-span-2" : "md:col-span-1"}
              `}
            >
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    {proyecto.icono}
                  </div>
                  <div className="flex gap-4 text-muted-foreground">
                    {proyecto.github && <Link href={proyecto.github} target="_blank" className="hover:text-foreground transition-colors"><Github size={20}/></Link>}
                    {proyecto.enlace && <Link href={proyecto.enlace} className="hover:text-primary transition-colors"><ExternalLink size={20}/></Link>}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2">{proyecto.titulo}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow">{proyecto.descripcion}</p>

                <div className="flex flex-wrap gap-2">
                  {proyecto.etiquetas.map((etiqueta, i) => (
                    <span key={i} className="px-3 py-1 text-xs font-mono rounded-full bg-secondary text-secondary-foreground">
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
