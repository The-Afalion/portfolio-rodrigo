"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Github, Linkedin, Mail, ArrowRight, Code2, Cpu, Globe, Box } from "lucide-react";
import { FEATURED_PROJECTS } from "@/datos/proyectos";
import { siteConfig } from "@/config/site";

const selectedProjects = FEATURED_PROJECTS.slice(0, 4);

const hubs = [
  {
    title: "Laboratorios",
    href: "/projects",
    description: "Espacio de pruebas, motores físicos y experimentos Next.js.",
    icon: <Cpu className="text-neon-cyan mb-4" size={32} />,
    color: "from-cyan-500/20 to-blue-500/5",
    colSpan: "lg:col-span-2",
  },
  {
    title: "Chess",
    href: "/chess",
    description: "Plataforma multiplayer con matchmaking y bots integrados.",
    icon: <Globe className="text-neon-purple mb-4" size={32} />,
    color: "from-purple-500/20 to-fuchsia-500/5",
    colSpan: "lg:col-span-1",
  },
  {
    title: "Blog",
    href: "/blog",
    description: "Documentación técnica, artículos y procesos estructurales.",
    icon: <Code2 className="text-neon-pink mb-4" size={32} />,
    color: "from-pink-500/20 to-rose-500/5",
    colSpan: "lg:col-span-1",
  },
  {
    title: "3D & Modelos",
    href: "/modelos",
    description: "Estudios espaciales renderizados en tiempo real.",
    icon: <Box className="text-white mb-4" size={32} />,
    color: "from-white/10 to-gray-500/5",
    colSpan: "lg:col-span-2",
  },
];

// Variantes de Framer Motion
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  },
};

export default function StudioHome() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Background Glowing Orbs */}
      <div className="glow-blob bg-neon-purple w-[600px] h-[600px] top-[-100px] right-[-100px]" />
      <div className="glow-blob bg-neon-cyan w-[500px] h-[500px] top-[40%] left-[-200px]" />
      <div className="glow-blob bg-neon-pink w-[400px] h-[400px] bottom-[-50px] right-[20%]" />

      <div className="page-container relative z-10 pt-32 pb-24">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Hero Main Block (Col-span 4 for a banner, or Col-span 2x2) */}
          <motion.div variants={cardVariant} className="bento-card p-10 lg:col-span-4 lg:row-span-1 flex flex-col justify-center min-h-[40vh] border-l-4 border-l-neon-cyan">
            <p className="page-eyebrow mb-4">Rodrigo Alonso</p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter mb-6">
              Software <span className="gradient-text animate-pulse">claro</span>.<br/> 
              Interacción precisa.
            </h1>
            <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl font-light">
              Diseño y construyo producto digital, sistemas interactivos y experiencias técnicas con una ejecución vanguardista.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="#work" className="action-pill bg-white/10 text-white font-bold border-white/20">
                Ver Proyectos <ArrowRight size={18} />
              </Link>
              <Link href="/contact" className="action-pill text-muted-foreground">
                Hablemos
              </Link>
            </div>
          </motion.div>

          {/* Contact / Links Small Block */}
          <motion.div variants={cardVariant} className="bento-card p-8 lg:col-span-1 flex flex-col justify-between bg-gradient-to-br from-white/5 to-transparent">
            <div>
              <h3 className="text-xl font-semibold mb-2">Conecta</h3>
              <p className="text-sm text-muted-foreground mb-6">Disponibilidad para retos complejos y diseño de sistemas.</p>
            </div>
            <div className="flex gap-3">
               <a href={`mailto:${siteConfig.email}`} className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                 <Mail size={20} className="text-neon-cyan" />
               </a>
               <a href={siteConfig.github} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                 <Github size={20} className="text-white" />
               </a>
               <a href={siteConfig.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                 <Linkedin size={20} className="text-neon-purple" />
               </a>
            </div>
          </motion.div>

          {/* Featured Projects List */}
          <motion.div variants={cardVariant} className="bento-card p-8 lg:col-span-3 flex flex-col">
            <div className="flex justify-between items-end mb-8">
              <div>
                <p className="page-eyebrow mb-2">Portfolio</p>
                <h2 className="text-3xl font-bold">Trabajos Destacados</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              {selectedProjects.map((project, i) => (
                <Link
                  key={project.id}
                  href={`/proyectos/${project.id}`}
                  className="group relative overflow-hidden rounded-2xl bg-black/40 border border-white/5 p-6 transition-all hover:bg-white/5 hover:border-white/20 flex flex-col justify-between"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundImage: `radial-gradient(circle, ${project.color}40 0%, transparent 70%)`}} />
                  <div>
                     <div className="flex items-center gap-3 mb-3">
                       <span className="w-2 h-2 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: project.color, color: project.color }} />
                       <h3 className="text-xl font-bold">{project.title}</h3>
                     </div>
                     <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                  </div>
                  <div className="mt-6 flex justify-between items-center text-sm font-medium text-white/50 group-hover:text-white transition-colors">
                     <span>Ver proyecto</span>
                     <ArrowUpRight size={18} className="transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Hubs / Index Blocks */}
          <div className="lg:col-span-4 mt-4 mb-2" id="work">
            <h2 className="text-2xl font-bold font-display ml-2">Explora los Hubs</h2>
          </div>
          
          {hubs.map((hub, i) => (
            <motion.div key={hub.href} variants={cardVariant} className={`bento-card lg:${hub.colSpan} md:col-span-2 col-span-1`}>
              <Link href={hub.href} className={`block h-full p-8 bg-gradient-to-br ${hub.color} hover:bg-white/5 transition-colors group`}>
                <div className="flex justify-between items-start">
                  {hub.icon}
                  <ArrowUpRight size={24} className="text-white/20 group-hover:text-white transition-colors transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
                <h3 className="text-2xl font-bold mt-4 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/50 transition-all">{hub.title}</h3>
                <p className="text-muted-foreground">{hub.description}</p>
              </Link>
            </motion.div>
          ))}

        </motion.div>
      </div>
    </main>
  );
}

