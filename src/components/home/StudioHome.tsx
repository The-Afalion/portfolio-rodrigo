"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Github, Linkedin, Mail, ArrowRight, Code2, Rocket, Globe } from "lucide-react";
import { FEATURED_PROJECTS } from "@/datos/proyectos";
import { siteConfig } from "@/config/site";

const selectedProjects = FEATURED_PROJECTS.slice(0, 4);

const hubs = [
  {
    title: "Atlas de Ingeniería",
    href: "/projects",
    description: "Proyectos en órbita. Arquitecturas 3D interactivas, simuladores y repositorios en un mapa estelar.",
    icon: <Globe className="text-[#00e5ff] mb-6 group-hover:scale-110 transition-transform duration-500 ease-out" size={48} strokeWidth={1.5} />,
    glowColor: "rgba(0, 229, 255, 0.15)",
    borderColor: "group-hover:border-[#00e5ff]/50",
    hoverBg: "hover:bg-[#00e5ff]/5",
    colSpan: "lg:col-span-2",
  },
  {
    title: "Chess Club",
    href: "/chess",
    description: "La Tavera. Motor de reglas de ajedrez, bots por niveles y matchmaking postal asíncrono.",
    icon: <Code2 className="text-[#a855f7] mb-6 group-hover:rotate-12 transition-transform duration-500 ease-out" size={48} strokeWidth={1.5} />,
    glowColor: "rgba(168, 85, 247, 0.15)",
    borderColor: "group-hover:border-[#a855f7]/50",
    hoverBg: "hover:bg-[#a855f7]/5",
    colSpan: "lg:col-span-1",
  },
  {
    title: "Comunicaciones",
    href: "/social",
    description: "Directorio global, mensajería en tiempo real y red de contactos para desarrolladores.",
    icon: <Rocket className="text-[#f43f5e] mb-6 group-hover:-translate-y-2 transition-transform duration-500 ease-out" size={48} strokeWidth={1.5} />,
    glowColor: "rgba(244, 63, 94, 0.15)",
    borderColor: "group-hover:border-[#f43f5e]/50",
    hoverBg: "hover:bg-[#f43f5e]/5",
    colSpan: "lg:col-span-1",
  },
];

// Variantes de Framer Motion
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 100, damping: 20 }
  },
};

export default function StudioHome() {
  return (
    <main className="relative min-h-screen bg-[#050505] text-white font-sans selection:bg-[#a855f7]/30 selection:text-white pb-32 pt-28 overflow-x-hidden">
      {/* Background Animated Noise & Gradient Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#00e5ff]/10 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#a855f7]/10 blur-[150px] mix-blend-screen" />
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-[#f43f5e]/5 blur-[100px] mix-blend-screen" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Main Hero Header */}
          <motion.div variants={cardVariant} className="lg:col-span-4 rounded-3xl bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 p-8 md:p-12 lg:p-16 relative overflow-hidden flex flex-col justify-end min-h-[50vh] xl:min-h-[60vh]">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay pointer-events-none" />
            <div className="relative z-10 w-full max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#00e5ff] uppercase tracking-widest mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-pulse" /> Estado: Operativo
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-medium tracking-tight text-white mb-6 leading-tight">
                Software de precisión.<br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/40">
                  Ingeniería a escala.
                </span>
              </h1>
              <p className="text-lg md:text-xl text-white/50 font-light max-w-2xl leading-relaxed">
                Desarrollo de ecosistemas interactivos, arquitecturas sólidas y un portfolio en constante expansión.
              </p>
              <div className="mt-10 flex flex-wrap gap-4 items-center">
                <Link href="#hubs" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium text-sm hover:scale-105 transition-transform">
                  Ver Estructura <ArrowRight size={16} />
                </Link>
                <Link href="#work" className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white px-6 py-3 rounded-full font-medium text-sm hover:bg-white/10 transition-colors">
                  Proyectos Recientes
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Contact Node */}
          <motion.div variants={cardVariant} className="lg:col-span-1 rounded-3xl bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 p-8 flex flex-col justify-between group relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#a855f7]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
             <div className="relative z-10">
               <p className="text-xs font-mono uppercase tracking-widest text-[#a855f7] mb-2">Comunicaciones</p>
               <h3 className="text-2xl font-display font-medium text-white mb-4">Nodo de Acceso</h3>
               <p className="text-sm text-white/50 leading-relaxed mb-8">
                 Disponible para nuevos sistemas, arquitectura en la nube o diseño de protocolos interactivos.
               </p>
             </div>
             <div className="flex gap-4 relative z-10">
                <a href={`mailto:${siteConfig.email}`} className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all">
                  <Mail size={20} />
                </a>
                <a href={siteConfig.github} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all">
                  <Github size={20} />
                </a>
                <a href={siteConfig.linkedin} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all">
                  <Linkedin size={20} />
                </a>
             </div>
          </motion.div>

          {/* Featured Highlights */}
          <motion.div variants={cardVariant} className="lg:col-span-3 rounded-3xl bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 p-8" id="work">
             <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
               <div>
                 <p className="text-xs font-mono uppercase tracking-widest text-white/50 mb-2">Dossier Destacado</p>
                 <h2 className="text-2xl md:text-3xl font-display font-medium text-white">Registros Recientes</h2>
               </div>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {selectedProjects.map((project) => (
                 <Link 
                   href={`/proyectos/${project.id}`} 
                   key={project.id}
                   className="group block p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300"
                 >
                   <div className="flex justify-between items-start mb-4">
                     <div className="w-10 h-10 rounded-full border border-white/10 bg-[#050505] flex items-center justify-center" style={{ boxShadow: `0 0 20px ${project.color}30` }}>
                       <span className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                     </div>
                     <ArrowUpRight size={18} className="text-white/30 group-hover:text-white group-hover:-translate-y-1 transition-all" />
                   </div>
                   <h3 className="text-xl font-display font-medium mb-2 text-white group-hover:text-[#00e5ff] transition-colors">{project.title}</h3>
                   <p className="text-sm text-white/50 line-clamp-2">{project.description}</p>
                 </Link>
               ))}
             </div>
          </motion.div>

          <motion.div variants={cardVariant} className="lg:col-span-4 mt-8 mb-4 flex items-center gap-4" id="hubs">
            <h2 className="text-2xl font-display font-medium text-white/90">Estructura Global</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent" />
          </motion.div>

          {hubs.map((hub) => (
             <motion.div 
               key={hub.href}
               variants={cardVariant}
               whileHover={{ y: -8 }}
               className={`rounded-3xl bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 p-8 relative overflow-hidden group ${hub.colSpan} ${hub.borderColor} transition-colors duration-500`}
             >
               <Link href={hub.href} className="absolute inset-0 z-20" />
               <div 
                 className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none mix-blend-screen bg-gradient-to-br from-white/5 to-transparent" 
               />
               <div 
                 className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -translate-y-1/2 translate-x-1/4 pointer-events-none"
                 style={{ backgroundColor: hub.glowColor }}
               />
               
               <div className="relative z-10 flex flex-col h-full justify-between">
                 <div>
                   {hub.icon}
                   <h3 className="text-2xl font-display font-medium text-white mb-3">{hub.title}</h3>
                   <p className="text-white/50 text-base leading-relaxed max-w-sm font-sans">
                     {hub.description}
                   </p>
                 </div>
                 <div className="mt-8 flex justify-end">
                   <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors duration-300">
                     <ArrowRight size={18} className="text-white/50 group-hover:text-black transition-colors" />
                   </div>
                 </div>
               </div>
             </motion.div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}

