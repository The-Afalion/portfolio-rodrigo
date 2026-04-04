"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Moon, Sparkles, Move } from "lucide-react";
import { LuminaEngine } from "@/lib/lumina/LuminaEngine";

export default function LuminaClient() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<LuminaEngine | null>(null);
    const [particleCount, setParticleCount] = useState(1500);
    const [showUI, setShowUI] = useState(true);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext("2d", { alpha: false }); // Optimizacion
        if (!ctx) return;

        // Limpiar para pintar un fondo base opaco 1 sola vez
        ctx.fillStyle = "#05050a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const engine = new LuminaEngine(canvas.width, canvas.height);
        engine.initSwarm();
        engineRef.current = engine;

        let animationId: number;

        const animate = () => {
            if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                engine.width = canvas.width;
                engine.height = canvas.height;
                // Pintar de nuevo tras resize para borrar artefactos
                ctx.fillStyle = "#05050a";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            engine.update();
            engine.draw(ctx);

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => cancelAnimationFrame(animationId);
    }, []); // Run once on mount

    useEffect(() => {
        if (engineRef.current && engineRef.current.particleCount !== particleCount) {
            engineRef.current.particleCount = particleCount;
            engineRef.current.initSwarm();
        }
    }, [particleCount]);

    // ==========================================
    // INTERACCIÓN RELAJANTE CON RATÓN (Opcional)
    // ==========================================
    const handlePointerMove = (e: React.PointerEvent) => {
        if (!engineRef.current) return;

        const isRepelling = e.buttons === 1; // Click izquierdo repele, sin click atrae suave local

        if (isRepelling) {
            engineRef.current.setAttractor(e.clientX, e.clientY, -2.0); // Repel strong
        } else {
            engineRef.current.setAttractor(e.clientX, e.clientY, 0.5); // Attract subtle
        }
    };

    const handlePointerLeave = () => {
        if (engineRef.current) engineRef.current.clearAttractor();
    };

    return (
        <main className="h-screen w-screen bg-[#05050a] overflow-hidden relative font-mono select-none">

            {/* CANVAS INMERSIVO FULLSCREEN */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 z-0 touch-none cursor-crosshair"
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerLeave}
                onPointerLeave={handlePointerLeave}
                onDoubleClick={() => setShowUI(!showUI)}
            />

            {/* UI MINIMALISTA OCULTABLE */}
            {showUI && (
                <div className="absolute top-6 left-6 z-20 flex flex-col gap-4 animate-fade-in pointer-events-none">
                    <Link
                        href="/engineering"
                        className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs font-bold tracking-widest uppercase pointer-events-auto bg-black/20 backdrop-blur-sm p-3 rounded"
                    >
                        <ArrowLeft size={16} /> Procedural AI Hub
                    </Link>

                    <div className="w-[300px] bg-black/20 backdrop-blur-sm p-6 border border-white/5 rounded pointer-events-auto">
                        <div className="flex items-center gap-2 text-[#0ea5e9] mb-2">
                            <Moon size={18} />
                            <h1 className="text-xl font-display font-black tracking-tighter uppercase">Lumina Flow</h1>
                        </div>
                        <p className="text-white/40 text-[10px] leading-relaxed mb-6">
                            Inteligencia de Enjambre (Boids). No hay muertes ni objetivos. Observa los patrones fluidos emerger de directrices matemáticas de cohesión y separación.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-[10px] uppercase font-bold text-white/50 mb-1">
                                    <span className="flex items-center gap-1"><Sparkles size={12} /> Materia Viva</span>
                                    <span className="text-[#0ea5e9]">{particleCount}</span>
                                </div>
                                <input
                                    type="range" min="300" max="3000" step="100"
                                    value={particleCount}
                                    onChange={(e) => setParticleCount(parseInt(e.target.value))}
                                    className="w-full accent-[#0ea5e9]"
                                />
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/5 space-y-2 text-[9px] text-white/30">
                            <p className="flex items-center gap-2"><Move size={10} /> Mueve el ratón para atraer la corriente.</p>
                            <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full border border-white/30 inline-block" /> Haz Click para generar ondas repulsoras.</p>
                            <p className="flex items-center gap-2 text-white/50 cursor-pointer hover:text-white transition-colors" onClick={() => setShowUI(false)}>Ocultar UI (Doble Click en Canvas)</p>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
