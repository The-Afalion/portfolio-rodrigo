"use client";
import { motion } from "framer-motion";
import { ExternalLink, Github, Code2, Database, Layout } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import CubeGridScene from "./scenes/CubeGridScene";

const projects = [
  {
    title: "Neural Chess Engine",
    description: "Algoritmo de ajedrez con toma de decisiones basada en evaluación posicional estática.",
    tags: ["TypeScript", "Next.js", "Chess.js"],
    link: "/chess",
    github: "https://github.com/The-Afalion",
    featured: true,
    icon: <Code2 size={28} />
  },
  {
    title: "Cloud Infrastructure",
    description: "Arquitectura serverless desplegada en AWS usando Terraform y Lambdas.",
    tags: ["AWS", "Terraform", "Python"],
    link: "#",
    github: "#",
    featured: false,
    icon: <Database size={28} />
  },
  {
    title: "Portfolio V2",
    description: "Diseño UI/UX con animaciones Framer Motion, Three.js y Tailwind CSS.",
    tags: ["React", "Tailwind", "Three.js"],
    link: "#",
    github: "#",
    featured: false,
    icon: <Layout size={28} />
  }
];

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
    },
  },
};

export default function Projects() {
  return (
    <section id="projects" className="relative py-32 px-4 md:px-10 bg-background text-foreground overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10">
        <CubeGridScene />
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
          {projects.map((project, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.1 }}
              className={`
                group relative p-8 rounded-3xl overflow-hidden
                bg-secondary/50 border border-border
                transition-all duration-300 hover:border-blue-500/50
                ${project.featured ? "md:col-span-2" : "md:col-span-1"}
              `}
            >
              {/* Efecto de brillo en hover */}
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
                    {project.icon}
                  </div>
                  <div className="flex gap-4 text-muted-foreground">
                    <Link href={project.github} target="_blank" className="hover:text-foreground transition-colors"><Github size={20}/></Link>
                    <Link href={project.link} className="hover:text-blue-500 transition-colors"><ExternalLink size={20}/></Link>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2">{project.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">{project.description}</p>

                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 text-xs font-mono rounded-full bg-background text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
