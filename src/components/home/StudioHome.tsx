"use client";

import { useState } from "react";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Github, Linkedin, Mail, ArrowRight, Code2, Cpu, Globe, Box, MessageSquare, Users2, Swords, Send, UserCheck, Gamepad2 } from "lucide-react";
import { FEATURED_PROJECTS } from "@/datos/proyectos";
import { siteConfig } from "@/config/site";

const selectedProjects = FEATURED_PROJECTS.slice(0, 4);

const hubs = [
  {
    title: "Laboratorios",
    href: "/engineering",
    description: "Espacio de pruebas, motores físicos y experimentos Next.js.",
    icon: <Cpu className="text-warm-amber mb-4" size={32} />,
    color: "from-amber-500/20 to-yellow-500/5",
    colSpan: "lg:col-span-2",
  },
  {
    title: "Chess",
    href: "/chess",
    description: "Plataforma multiplayer con matchmaking y bots integrados.",
    icon: <Globe className="text-warm-sunset mb-4" size={32} />,
    color: "from-orange-600/20 to-amber-700/5",
    colSpan: "lg:col-span-1",
  },
  {
    title: "Blog",
    href: "/blog",
    description: "Documentación técnica, artículos y procesos estructurales.",
    icon: <Code2 className="text-warm-peach mb-4" size={32} />,
    color: "from-orange-500/20 to-red-500/5",
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

interface StudioHomeProps {
  currentUser?: { id: string; name: string } | null;
  initialFriendships?: any[];
  initialMessages?: any[];
}

export default function StudioHome({ currentUser, initialFriendships = [], initialMessages = [] }: StudioHomeProps) {
  const [activeTab, setActiveTab] = useState("chat");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState(initialMessages);

  const sendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentUser) return;
    const optimisticMsg = { id: Date.now(), content: chatInput, senderName: currentUser.name, senderId: currentUser.id };
    setMessages((prev: any) => [optimisticMsg, ...prev]);
    setChatInput("");
    await fetch("/api/chess/lobby-messages", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ content: optimisticMsg.content })
    });
  };

  const games = [
    { title: "Damas", path: "/games/checkers", color: "text-warm-peach", bg: "bg-orange-500/20" },
    { title: "Flota", path: "/games/battleship", color: "text-warm-amber", bg: "bg-amber-500/20" },
    { title: "Artillería", path: "/games/artillery", color: "text-warm-sunset", bg: "bg-red-500/20" },
  ];
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Background Glowing Orbs - Cálidos */}
      <div className="glow-blob bg-warm-sunset w-[600px] h-[600px] top-[-100px] right-[-100px]" />
      <div className="glow-blob bg-warm-amber w-[500px] h-[500px] top-[40%] left-[-200px]" />
      <div className="glow-blob bg-warm-peach w-[400px] h-[400px] bottom-[-50px] right-[20%]" />

      <div className="page-container relative z-10 pt-32 pb-24">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Hero Main Block (Col-span 4 for a banner, or Col-span 2x2) */}
          <motion.div variants={cardVariant} className="bento-card p-10 lg:col-span-4 lg:row-span-1 flex flex-col justify-center min-h-[40vh] border-l-4 border-l-warm-amber">
            <p className="page-eyebrow mb-4">Rodrigo Alonso</p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter mb-6">
              Software <span className="gradient-text animate-pulse">hogareño</span>.<br/> 
              Interacción cálida.
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
                 <Mail size={20} className="text-warm-amber" />
               </a>
               <a href={siteConfig.github} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                 <Github size={20} className="text-white" />
               </a>
               <a href={siteConfig.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                 <Linkedin size={20} className="text-warm-peach" />
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

          {/* Nexus Social Compact Widget */}
          <div className="lg:col-span-4 mt-8 mb-2 flex justify-between items-end" id="nexus">
            <div>
              <p className="page-eyebrow mb-2">Social Hub</p>
              <h2 className="text-3xl font-bold font-display ml-2 flex items-center gap-3">
                <Gamepad2 className="text-warm-sunset" size={32} />
                Nexus Central
              </h2>
            </div>
            {!currentUser && (
               <Link href="/blog/login" className="action-pill bg-warm-amber/10 text-warm-amber border-warm-amber/30 text-sm hidden sm:flex">
                 Iniciar Sesión <ArrowRight size={16}/>
               </Link>
            )}
          </div>

          <motion.div variants={cardVariant} className="bento-card p-6 lg:col-span-4 flex flex-col md:flex-row gap-6 bg-gradient-to-br from-warm-amber/5 to-transparent border-t-2 border-t-warm-amber/50 min-h-[400px]">
            {currentUser ? (
              <>
                {/* Tabs Panel */}
                <div className="flex md:flex-col gap-2 md:w-48 shrink-0 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
                   <button onClick={() => setActiveTab("chat")} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm whitespace-nowrap ${activeTab === "chat" ? "bg-white/10 text-white shadow-inner" : "text-white/50 hover:bg-white/5 hover:text-white"}`}>
                     <MessageSquare size={18} className={activeTab === "chat" ? "text-warm-amber" : ""} /> Transmisión
                   </button>
                   <button onClick={() => setActiveTab("friends")} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm whitespace-nowrap ${activeTab === "friends" ? "bg-white/10 text-white shadow-inner" : "text-white/50 hover:bg-white/5 hover:text-white"}`}>
                     <Users2 size={18} className={activeTab === "friends" ? "text-warm-peach" : ""} /> Contactos
                   </button>
                   <button onClick={() => setActiveTab("games")} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm whitespace-nowrap ${activeTab === "games" ? "bg-white/10 text-white shadow-inner" : "text-white/50 hover:bg-white/5 hover:text-white"}`}>
                     <Swords size={18} className={activeTab === "games" ? "text-warm-sunset" : ""} /> Arcades
                   </button>
                </div>

                {/* Content Panel */}
                <div className="flex-1 surface-panel bg-black/40 p-5 rounded-2xl flex flex-col relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    {activeTab === "chat" && (
                      <motion.div key="chat" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col h-full absolute inset-5">
                        <div className="flex-1 overflow-y-auto mb-4 pr-2 space-y-3 custom-scrollbar flex flex-col-reverse">
                          {messages.map((m: any) => (
                            <div key={m.id} className={`flex flex-col mb-2 ${m.senderId === currentUser.id ? "items-end" : "items-start"}`}>
                              <span className="text-[10px] text-white/40 mb-1 px-2">{m.senderName}</span>
                              <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${m.senderId === currentUser.id ? "bg-warm-amber/20 text-white border border-warm-amber/30 rounded-br-sm" : "bg-white/5 text-white/80 border border-white/10 rounded-bl-sm"}`}>
                                {m.content}
                              </div>
                            </div>
                          ))}
                        </div>
                        <form onSubmit={sendChatMessage} className="flex gap-2 shrink-0">
                          <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Transmite al canal global..." className="flex-1 bg-black/60 border border-white/10 rounded-full px-5 py-3 text-sm text-white focus:outline-none focus:border-warm-amber/50 transition-colors" />
                          <button type="submit" className="bg-warm-amber/20 text-warm-amber p-3 rounded-full hover:bg-warm-amber hover:text-black hover:scale-105 transition-all">
                            <Send size={18} />
                          </button>
                        </form>
                      </motion.div>
                    )}

                    {activeTab === "friends" && (
                      <motion.div key="friends" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col h-full absolute inset-5">
                         <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><UserCheck size={18} className="text-warm-peach"/> Tu Red</h3>
                         <div className="space-y-2 overflow-y-auto custom-scrollbar pr-2">
                           {initialFriendships.length === 0 ? (
                             <p className="text-sm text-white/40 text-center mt-10">Tu red está vacía. Añade aliados.</p>
                           ) : (
                             initialFriendships.map((f: any) => {
                               const isRequester = f.requesterId === currentUser.id;
                               const otherUser = isRequester ? f.addressee : f.requester;
                               return (
                                 <div key={f.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                   <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-full bg-warm-peach/20 flex items-center justify-center text-warm-peach font-bold text-xs">{otherUser.id.substring(0, 2).toUpperCase()}</div>
                                     <span className="text-sm font-medium text-white/90">{otherUser.id.substring(0, 8)}</span>
                                   </div>
                                   <span className="text-[10px] uppercase font-bold tracking-wider bg-white/10 px-2 py-1 rounded text-white/60">{f.status}</span>
                                 </div>
                               );
                             })
                           )}
                         </div>
                      </motion.div>
                    )}

                    {activeTab === "games" && (
                      <motion.div key="games" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col h-full absolute inset-5">
                         <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Gamepad2 size={18} className="text-warm-sunset"/> Salón Arcade</h3>
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                           {games.map(g => (
                             <Link key={g.title} href={g.path} className="group relative overflow-hidden flex flex-col items-center justify-center p-6 rounded-2xl bg-black/50 border border-white/5 hover:border-white/20 transition-all hover:-translate-y-1">
                               <div className={`mb-3 p-4 rounded-full ${g.bg} ${g.color} group-hover:scale-110 transition-transform`}>
                                 <Swords size={24} />
                               </div>
                               <span className="font-bold text-white text-sm">{g.title}</span>
                               <span className="text-xs text-white/40 mt-1 uppercase tracking-widest">Jugar</span>
                             </Link>
                           ))}
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="w-full flex flex-col items-center justify-center text-center py-10 opacity-80">
                 <div className="w-16 h-16 rounded-full bg-warm-amber/10 flex items-center justify-center mb-6">
                   <Gamepad2 size={32} className="text-warm-amber" />
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-2">Identificación Requerida</h3>
                 <p className="text-white/50 max-w-sm mb-8 text-sm">El acceso al Nexus Central requiere acreditación. Inicia sesión para interactuar con la red.</p>
                 <Link href="/blog/login" className="action-pill bg-warm-amber text-black font-bold border-warm-amber hover:bg-white hover:border-white">
                   Acceder a la terminal
                 </Link>
              </div>
            )}
          </motion.div>

          {/* Hubs / Index Blocks */}
          <div className="lg:col-span-4 mt-12 mb-2">
            <h2 className="text-2xl font-bold font-display ml-2">Directorios Estructurales</h2>
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
