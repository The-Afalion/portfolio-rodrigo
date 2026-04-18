"use client";

import Link from "next/link";
import { ArrowLeft, Target, Anchor, Grid3X3, Crown, Box } from "lucide-react";

export default function GamesHub() {
  const games = [
    {
      id: "chess",
      title: "Gran Ajedrez",
      desc: "Tallado a mano en marfil y nogal. Estrategia profunda.",
      color: "text-[#3e3024]",
      bg: "bg-[#e3d7c5]",
      border: "border-[#b8a991]",
      icon: <Crown size={40} className="text-[#3e3024]" />,
      path: "/chess",
      rotation: "rotate-[-2deg]",
      translate: "translate-y-4 translate-x-2"
    },
    {
      id: "artillery",
      title: "Artillería",
      desc: "Cálculos balísticos trazados en pergamino.",
      color: "text-[#4d5930]",
      bg: "bg-[#d8e0c3]",
      border: "border-[#b0b893]",
      icon: <Target size={40} className="text-[#4d5930]" />,
      path: "/games/artillery",
      rotation: "rotate-[3deg]",
      translate: "translate-y-0 -translate-x-4"
    },
    {
      id: "checkers",
      title: "Damas Clásicas",
      desc: "Fichas gastadas de pino en tablero 8x8.",
      color: "text-[#8c4030]",
      bg: "bg-[#e8dcc4]",
      border: "border-[#d4bd9a]",
      icon: <Grid3X3 size={40} className="text-[#8c4030]" />,
      path: "/games/checkers",
      rotation: "rotate-[-1deg]",
      translate: "translate-y-8 translate-x-4"
    },
    {
      id: "battleship",
      title: "Batalla Naval",
      desc: "Flotas enemigas marcadas en mapas de tinta.",
      color: "text-[#2e404d]",
      bg: "bg-[#cce3eb]",
      border: "border-[#9fbcce]",
      icon: <Anchor size={40} className="text-[#2e404d]" />,
      path: "/games/battleship",
      rotation: "rotate-[4deg]",
      translate: "translate-y-2 -translate-x-2"
    }
  ];

  return (
    <main className="relative min-h-screen w-full bg-[#e3d3b6] text-[#453628] overflow-hidden flex flex-col font-serif" 
          style={{ backgroundImage: "linear-gradient(90deg, rgba(166,134,89,0.05) 50%, transparent 50%), linear-gradient(rgba(166,134,89,0.05) 50%, transparent 50%)", backgroundSize: "120px 120px" }}>
      
      {/* HEADER TIPO TICKET DE REGISTRO */}
      <div className="absolute left-4 top-4 z-50 md:left-6 md:top-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 border-2 border-[#8c673d] bg-[#fdfbf7] px-4 py-2.5 text-xs font-bold text-[#453628] shadow-[2px_4px_0px_#a68659] transition-transform hover:-translate-y-0.5 hover:shadow-[2px_6px_0px_#a68659] active:translate-y-1 active:shadow-none md:px-6 md:py-3 md:text-sm"
        >
          <ArrowLeft size={16} className="text-[#8c673d]" />
          RETIRARSE AL INICIO
        </Link>
      </div>

      {/* LETRERO DE MADERA */}
      <div className="pointer-events-none absolute left-1/2 top-24 z-10 flex w-full -translate-x-1/2 justify-center px-4 md:top-14">
         <div className="max-w-[min(92vw,680px)] bg-[#5c4033] px-8 py-5 shadow-[0_10px_20px_rgba(60,40,30,0.3)] border-4 border-[#3e2b22] transform rotate-[-1deg] md:px-12 md:py-6">
           {/* Clavos */}
           <div className="absolute top-3 left-4 w-3 h-3 rounded-full bg-[#1a120e] shadow-inner" />
           <div className="absolute top-3 right-4 w-3 h-3 rounded-full bg-[#1a120e] shadow-inner" />
           <div className="absolute bottom-3 left-4 w-3 h-3 rounded-full bg-[#1a120e] shadow-inner" />
           <div className="absolute bottom-3 right-4 w-3 h-3 rounded-full bg-[#1a120e] shadow-inner" />
           
           <h1 className="text-center text-3xl font-black tracking-[0.1em] text-[#e8dcc4] drop-shadow-md md:text-5xl">TABERNA DE JUEGOS</h1>
           <p className="mt-2 text-[#b8a991] font-mono text-xs tracking-[0.3em] uppercase text-center">Seleccione una caja</p>
         </div>
      </div>

      {/* MESA DE MADERA (LAYOUT 2D ORGÁNICO) */}
      <div className="flex flex-1 items-center justify-center px-6 pb-12 pt-44 md:pt-36">
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 relative">
          
           {games.map((g, i) => (
             <Link key={g.id} href={g.path} className={`group outline-none ${g.translate} ${g.rotation} transition-all duration-300 hover:z-50 hover:scale-105 hover:rotate-0`}>
               {/* CARTÓN DEL JUEGO DE MESA */}
               <div className="relative w-full aspect-[4/3] bg-[#fcfaf4] border-4 border-[#1a120e] shadow-[8px_12px_20px_rgba(60,40,30,0.2)] p-2">
                 
                 {/* PORTADA REFORZADA */}
                 <div className={`w-full h-full border-2 ${g.border} ${g.bg} flex flex-col p-6 relative overflow-hidden`}>
                    
                    {/* Sello o estampa vintage */}
                    <div className="absolute -top-6 -right-6 w-32 h-32 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] mix-blend-multiply pointer-events-none" />
                    
                    <div className="flex justify-between items-start mb-auto relative z-10">
                      <div className={`w-20 h-20 bg-white border-2 border-[#1a120e] flex items-center justify-center shadow-[4px_4px_0_#1a120e] transform -rotate-3 group-hover:rotate-6 transition-transform`}>
                        {g.icon}
                      </div>
                      <div className="bg-[#1a120e] text-[#e8dcc4] font-mono text-xs font-bold px-3 py-1 shadow-sm">Edición 1.0</div>
                    </div>
                    
                    <div className="relative z-10 mt-8 bg-[#fdfbf7] p-4 border-2 border-[#1a120e] shadow-[4px_4px_0_rgba(26,18,14,0.1)]">
                      <h2 className="text-3xl font-black text-[#1a120e] mb-2 font-serif uppercase tracking-tight">{g.title}</h2>
                      <p className="text-sm font-medium text-[#5c4033] font-serif leading-relaxed">{g.desc}</p>
                    </div>
                 </div>

                 {/* Lateral de la caja (falso 3D) */}
                 <div className="absolute -right-3 top-2 w-3 h-[calc(100%-8px)] bg-[#8c673d] border-y-4 border-r-4 border-[#1a120e] transform origin-left skew-y-45"/>
                 <div className="absolute right-0 -bottom-3 h-3 w-full bg-[#5c4033] border-x-4 border-b-4 border-[#1a120e] transform origin-top skew-x-45"/>
               </div>
             </Link>
           ))}

        </div>
      </div>
    </main>
  );
}
