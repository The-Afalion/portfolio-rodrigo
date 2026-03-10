"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Dna } from "lucide-react";
import { Ecosystem } from "@/lib/ecosystem/Ecosystem";

export default function EcosystemClient() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stats, setStats] = useState({ herbivores: 0, carnivores: 0, scavengers: 0, corpses: 0, plants: 0 });
    const [speciationLog, setSpeciationLog] = useState<{ id: number, name: string, diet: string }[]>([]);
    const logId = useRef(0);
    const ecosystemRef = useRef<Ecosystem | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Limpiar estilos de cursor por si venimos del planetario 3D
        document.body.style.cursor = 'auto';

        canvas.width = window.innerWidth - 350; // Quitar el panel izquierdo
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const onSpeciation = (name: string, diet: string) => {
            logId.current++;
            setSpeciationLog(prev => [{ id: logId.current, name, diet }, ...prev].slice(0, 15));
        };

        const eco = new Ecosystem(canvas.width, canvas.height, onSpeciation);
        ecosystemRef.current = eco;

        let animationId: number;
        let lastStatsUpdate = 0;

        const animate = (time: number) => {
            canvas.width = window.innerWidth - 350;
            canvas.height = window.innerHeight;

            // Actualizar si han reescalado la ventana
            eco.width = canvas.width;
            eco.height = canvas.height;

            // Step de física del motor
            eco.update();

            // Dibujado
            ctx.fillStyle = "#050510";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            eco.draw(ctx);

            // Actualizar estado de React solo cada segundo aprox (60 frames) para no saturar 
            if (time - lastStatsUpdate > 1000) {
                setStats({
                    herbivores: eco.entities.filter(e => e.diet === "HERBIVORE").length,
                    carnivores: eco.entities.filter(e => e.diet === "CARNIVORE").length,
                    scavengers: eco.entities.filter(e => e.diet === "SCAVENGER").length,
                    corpses: eco.entities.filter(e => e.diet === "CORPSE").length,
                    plants: eco.plants.length
                });
                lastStatsUpdate = time;
            }

            animationId = requestAnimationFrame(animate);
        };

        animate(0);

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, []);

    const resetSimulation = () => {
        window.location.reload();
    };

    return (
        <main className="h-screen w-screen bg-black overflow-hidden relative flex text-white font-mono">
            {/* Panel de Ingeniería Analítica */}
            <div className="w-[350px] flex flex-col justify-between p-6 z-20 border-r border-white/10 bg-black/80 backdrop-blur-md">

                <div className="flex-1 overflow-hidden flex flex-col">
                    <Link href="/engineering" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs font-bold mb-8 tracking-widest uppercase">
                        <ArrowLeft size={16} /> Procedural AI Hub
                    </Link>
                    <h1 className="text-3xl font-display font-black tracking-tighter uppercase mb-2">Eco-Engine</h1>
                    <p className="text-white/50 text-xs leading-relaxed mb-6">
                        Sandbox de Vida Artificial Autónoma. Presas evadiendo depredadores y carroñeros limpiando muertes. Muta la genética con selección natural.
                    </p>

                    {/* Telemetría Bio Demográfica */}
                    <div className="space-y-2 mb-6 border-y border-white/10 py-6">
                        <h2 className="text-[10px] text-white/30 tracking-widest font-bold uppercase mb-4">Censo Poblacional Activo</h2>

                        <div className="flex justify-between items-center bg-white/5 px-3 py-2">
                            <span className="text-xs text-[#3b82f6] font-bold tracking-widest uppercase">HERBÍVOROS</span>
                            <span className="font-mono text-lg">{stats.herbivores}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/5 px-3 py-2">
                            <span className="text-xs text-[#ef4444] font-bold tracking-widest uppercase">CARNÍVOROS</span>
                            <span className="font-mono text-lg">{stats.carnivores}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/5 px-3 py-2">
                            <span className="text-xs text-[#f59e0b] font-bold tracking-widest uppercase">CARROÑEROS</span>
                            <span className="font-mono text-lg">{stats.scavengers}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 mt-2">
                            <span className="text-[10px] text-white/40 font-bold uppercase">Cadáveres (Materia)</span>
                            <span className="text-[10px] text-white/60 font-mono">{stats.corpses}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                            <span className="text-[10px] text-[#10b981] font-bold uppercase">Vegetación (Energía)</span>
                            <span className="text-[10px] text-white/60 font-mono">{stats.plants}</span>
                        </div>
                    </div>

                    {/* Registro de Especiación Procedural */}
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <h2 className="text-[10px] text-white/30 tracking-widest font-bold uppercase mb-4 flex items-center gap-2">
                            <Dna size={12} className="text-fuchsia-400" /> Registro de Especiación
                        </h2>
                        {speciationLog.length === 0 ? (
                            <p className="text-[10px] text-white/20 italic">Esperando divergencia genética lo suficiente severa para declarar nueva especie taxonómica...</p>
                        ) : (
                            <div className="space-y-2">
                                {speciationLog.map(log => (
                                    <div key={log.id} className="bg-fuchsia-900/10 border-l-2 border-fuchsia-500 pl-3 py-2 animate-fade-in">
                                        <p className="text-xs text-white font-bold">{log.name}</p>
                                        <p className="text-[10px] text-fuchsia-400/80 uppercase tracking-wider">{log.diet}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10">
                    <button
                        onClick={resetSimulation}
                        className="w-full flex items-center justify-center gap-2 p-3 border border-white/20 text-white/80 font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-colors"
                        title="Inyectar masa nueva"
                    >
                        <RefreshCw size={14} /> Extinción Masiva
                    </button>
                    <p className="text-center text-[9px] text-white/30 mt-3">Las manchas verdes difusas en el mapa bloquean algoritmos de visión enemiga.</p>
                </div>

            </div>

            {/* Lienzo del Entorno */}
            <div className="flex-1 relative bg-[#050510] flex justify-center items-center">
                <canvas ref={canvasRef} className="block shadow-[0_0_100px_rgba(139,92,246,0.1)] border-x border-white/5" />
            </div>

        </main>
    );
}
