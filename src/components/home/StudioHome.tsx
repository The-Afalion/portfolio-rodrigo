"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Github, Linkedin, Mail, ArrowRight, Code2, Cpu, Globe, Box } from "lucide-react";
import { FEATURED_PROJECTS } from "@/datos/proyectos";
import { siteConfig } from "@/config/site";

const selectedProjects = FEATURED_PROJECTS.slice(0, 4);

const hubs = [
  {
    title: "Projects Hub",
    href: "/projects",
    description: "Atlas intergaláctico cartografiando arquitecturas 3D y simulaciones de cuerpos celestes.",
    icon: <Globe className="text-[#a64020] mb-6 group-hover:scale-125 transition-transform duration-500 ease-out" size={48} />,
    color: "from-orange-500/10 to-red-500/5",
    hoverBg: "hover:bg-[#1a120e]",
    borderHover: "group-hover:border-[#a64020]",
    colSpan: "lg:col-span-2",
    delay: 0.1
  },
  {
    title: "Chess Hub",
    href: "/chess",
    description: "Tablero Clásico Magistral. Matchmaking global comprimido en una vista sobria sin distracciones.",
    icon: <Box className="text-[#3c5a6b] mb-6 group-hover:rotate-12 transition-transform duration-500 ease-out" size={48} />,
    color: "from-[#9fbcce]/10 to-[#9fbcce]/5",
    hoverBg: "hover:bg-[#fcfaf4]",
    borderHover: "group-hover:border-[#3c5a6b]",
    colSpan: "lg:col-span-1",
    delay: 0.3
  },
  {
    title: "Social Hub",
    href: "/social",
    description: "Directorio táctil para interactuar con compañeros de desarrollo y trazar estrategias.",
    icon: <Mail className="text-[#8c4030] mb-6 group-hover:-translate-y-2 transition-transform duration-500 ease-out" size={48} />,
    color: "from-[#d6c4a5]/20 to-transparent",
    hoverBg: "hover:bg-[#f4ead5]",
    borderHover: "group-hover:border-[#8c4030]",
    colSpan: "lg:col-span-1",
    delay: 0.5
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
          <div className="lg:col-span-4 mt-8 mb-4 border-l-4 border-l-neon-purple pl-4" id="work">
            <h2 className="text-3xl font-bold font-display tracking-tight text-white/90">Estructura Global de Contenido</h2>
            <p className="text-white/50 text-sm mt-2">Navegación animada hacia los diferentes ecosistemas y módulos del portfolio.</p>
          </div>
          
          {hubs.map((hub, i) => (
            <motion.div 
               key={hub.href} 
               variants={cardVariant}
               whileHover={{ y: -8, scale: 1.02 }}
               transition={{ type: "spring", stiffness: 300, damping: 20 }}
               className={`bento-card lg:${hub.colSpan} md:col-span-2 col-span-1 border border-white/5 group ${hub.borderHover} overflow-hidden relative`}
            >
              <Link href={hub.href} className={`block h-full p-10 bg-gradient-to-br ${hub.color} transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${hub.hoverBg} z-10 relative`}>
                
                {/* Background Animation Mask */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl pointer-events-none" />

                <div className="flex flex-col h-full justify-between relative z-20">
                   <div>
                     {hub.icon}
                     <motion.h3 
                       className="text-3xl font-black mt-4 mb-3 transition-colors duration-500 group-hover:text-black"
                       initial={{ opacity: 0.8 }}
                       whileHover={{ opacity: 1, scale: 1.05, originX: 0 }}
                     >
                       {hub.title}
                     </motion.h3>
                     <p className="text-muted-foreground font-medium text-lg leading-relaxed group-hover:text-black/80 transition-colors duration-500 max-w-sm">
                        {hub.description}
                     </p>
                   </div>
                   
                   <div className="flex justify-end mt-8">
                     <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-black/30 group-hover:bg-black/10 transition-all duration-500">
                       <ArrowRight size={24} className="text-white/30 group-hover:text-black group-hover:translate-x-1 transition-all duration-300" />
                     </div>
                   </div>
                </div>
              </Link>
            </motion.div>
          ))}

        </motion.div>
      </div>
    </main>
  );
}

