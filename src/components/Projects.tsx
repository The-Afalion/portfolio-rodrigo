"use client";
import { motion } from "framer-motion";
import { ExternalLink, Github, Code2, Database, Layout } from "lucide-react";
import Link from "next/link";

const projects = [
  {
    title: "Neural Chess Engine",
    description: "Algoritmo de ajedrez con toma de decisiones basada en evaluación posicional estática.",
    tags: ["TypeScript", "Next.js", "Chess.js"],
    link: "/chess",
    github: "https://github.com/The-Afalion",
    featured: true,
    icon: <Code2 size={32} />
  },
  {
    title: "Cloud Infrastructure",
    description: "Arquitectura serverless desplegada en AWS usando Terraform y Lambdas.",
    tags: ["AWS", "Terraform", "Python"],
    link: "#",
    github: "#",
    featured: false,
    icon: <Database size={32} />
  },
  {
    title: "Portfolio V1",
    description: "Diseño UI/UX minimalista con animaciones Framer Motion y Tailwind CSS.",
    tags: ["React", "Tailwind", "Framer"],
    link: "#",
    github: "#",
    featured: false,
    icon: <Layout size={32} />
  }
];

export default function Projects() {
  return (
    <section id="projects" className="py-32 px-4 md:px-10 bg-gray-50 dark:bg-[#080808] transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-bold mb-16 text-gray-900 dark:text-white"
        >
          PROYECTOS SELECCIONADOS
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                group p-8 rounded-3xl transition-all duration-300
                bg-white dark:bg-white/5 
                border border-gray-200 dark:border-white/10
                hover:shadow-2xl hover:border-green-500/30 dark:hover:bg-white/10
                ${project.featured ? "md:col-span-2" : "md:col-span-1"}
              `}
            >
              <div className="flex justify-between items-start mb-8">
                <div className="p-3 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  {project.icon}
                </div>
                <div className="flex gap-3 text-gray-400">
                  <Link href={project.github} target="_blank" className="hover:text-black dark:hover:text-white transition-colors"><Github size={20}/></Link>
                  <Link href={project.link} className="hover:text-green-600 dark:hover:text-green-400 transition-colors"><ExternalLink size={20}/></Link>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{project.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">{project.description}</p>

              <div className="flex flex-wrap gap-2 mt-auto">
                {project.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 text-xs font-bold rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}