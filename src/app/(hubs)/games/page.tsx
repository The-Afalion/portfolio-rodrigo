"use client";

import Link from "next/link";
import { ArrowLeft, Target, Anchor, Grid3X3, Crown } from "lucide-react";

export default function GamesHub() {
  const games = [
    {
      id: "artillery",
      title: "Artillería",
      desc: "Cálculo hiperbólico y físicas. 1v1.",
      color: "bg-emerald-500",
      light: "bg-emerald-100",
      icon: <Target size={32} className="text-emerald-600" />,
      path: "/games/artillery"
    },
    {
      id: "battleship",
      title: "Batalla Naval",
      desc: "Destruye la flota enemiga.",
      color: "bg-blue-500",
      light: "bg-blue-100",
      icon: <Anchor size={32} className="text-blue-600" />,
      path: "/games/battleship"
    },
    {
      id: "checkers",
      title: "Damas",
      desc: "Clásico táctico en tablero 8x8.",
      color: "bg-rose-500",
      light: "bg-rose-100",
      icon: <Grid3X3 size={32} className="text-rose-600" />,
      path: "/games/checkers"
    },
    {
      id: "chess",
      title: "Ajedrez",
      desc: "Estrategia profunda tradicional.",
      color: "bg-amber-500",
      light: "bg-amber-100",
      icon: <Crown size={32} className="text-amber-600" />,
      path: "/chess"
    }
  ];

  return (
    <main className="relative min-h-screen w-full bg-[#FAFAFA] text-slate-800 overflow-hidden flex flex-col">
      
      {/* HEADER */}
      <div className="absolute left-6 top-6 z-50">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-transform hover:scale-105 border border-slate-200"
        >
          <ArrowLeft size={16} />
          Volver al Inicio
        </Link>
      </div>

      <div className="absolute top-10 w-full text-center z-10 pointer-events-none">
         <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Sala de Táctica</h1>
         <p className="mt-3 text-slate-500 font-medium tracking-wide">Selecciona un módulo en el tablero holográfico.</p>
      </div>

      {/* ISOMETRIC GRID CAUTION: Complex Tailwind transforms */}
      <div className="flex-1 flex items-center justify-center perspective-[2000px] mt-10">
        <div style={{ transform: "rotateX(60deg) rotateZ(-45deg)", transformStyle: "preserve-3d" }} className="grid grid-cols-2 gap-12 p-10">
           
           {games.map((g, i) => (
             <Link key={g.id} href={g.path} className="group outline-none">
               <div 
                 className="relative w-64 h-64 bg-white rounded-3xl cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
                 style={{ 
                   transform: "translateZ(0px)",
                   boxShadow: "-1px 1px 0px #e2e8f0, -2px 2px 0px #e2e8f0, -3px 3px 0px #e2e8f0, -4px 4px 0px #e2e8f0, -5px 5px 0px #cbd5e1, -15px 15px 30px rgba(0,0,0,0.1)",
                 }}
               >
                 {/* 3D Hovers handled locally by React style/Tailwind mixing:
                     Usually we'd use group-hover but custom translateZ needs explicit rules. 
                     We will use tailwind arbitrary values for hover.
                 */}
                 <div className="absolute inset-0 bg-white rounded-3xl border-2 border-slate-100 flex flex-col p-6 group-hover:-translate-y-8 group-hover:translate-x-8 transition-transform duration-500 will-change-transform shadow-[inset_0_0_40px_rgba(0,0,0,0.02)]">
                    <div className={`w-16 h-16 rounded-2xl ${g.light} flex items-center justify-center mb-6`}>
                      {g.icon}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">{g.title}</h2>
                    <p className="text-sm font-medium text-slate-500">{g.desc}</p>
                    
                    <div className="mt-auto flex items-center text-indigo-500 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-500">
                      Entrar al Sim ->
                    </div>
                 </div>

                 {/* Drop shadow / Platform footprint */}
                 <div className="absolute inset-0 bg-black/5 rounded-3xl -z-10 blur-md group-hover:blur-xl transition-all duration-500" />
               </div>
             </Link>
           ))}

        </div>
      </div>

    </main>
  );
}
