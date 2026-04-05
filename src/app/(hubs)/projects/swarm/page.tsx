"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit3, Target, Disc, Play, Pause, Trash2 } from "lucide-react";
import { SwarmEngine, Wall } from "@/lib/swarm/SwarmEngine";

type ToolType = "WALL" | "TARGET" | "GRAVITY";

export default function SwarmClient() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<SwarmEngine | null>(null);
    const [activeTool, setActiveTool] = useState<ToolType>("WALL");

    // Configuración Genética
    const [popSize, setPopSize] = useState(250);
    const [mutRate, setMutRate] = useState(0.1);
    const [lifespan, setLifespan] = useState(300);

    // Telemetría
    const [generation, setGeneration] = useState(1);
    const [currentFrame, setCurrentFrame] = useState(0);

    // Estado del usuario (Dibujando)
    const [isPaused, setIsPaused] = useState(false);
    const isDrawing = useRef(false);
    const lastPoint = useRef<{ x: number, y: number } | null>(null);
    const userWalls = useRef<Wall[]>([]);
    const userWells = useRef<{ x: number, y: number, radius: number, strength: number }[]>([]);
    const initialPopSize = useRef(popSize);
    const initialMutRate = useRef(mutRate);
    const initialLifespan = useRef(lifespan);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = window.innerWidth - 320;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const engine = new SwarmEngine(canvas.width, canvas.height, initialPopSize.current, initialLifespan.current);
        engine.mutationRate = initialMutRate.current;
        engineRef.current = engine;

        let animationId: number;

        const animate = () => {
            if (!isPaused) {
                engine.update();
                setGeneration(engine.generation);
                setCurrentFrame(engine.currentTick);
            }

            // Fondo espacial oscuro
            ctx.fillStyle = "#050510";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            engine.draw(ctx);

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => cancelAnimationFrame(animationId);
    }, [isPaused]); // El useEffect principal solo arranca la engine 1 vez.

    // Aplicar variables live si el usuario toca los sliders
    useEffect(() => {
        if (engineRef.current) {
            engineRef.current.mutationRate = mutRate;
            // PopSize y Lifespan solo surten efecto cuando el motor resetea la generación,
            // pero podemos hackearlo si el usuario lo exige:
            engineRef.current.populationSize = popSize;
            engineRef.current.lifespan = lifespan;
        }
    }, [mutRate, popSize, lifespan]);


    // =============================
    // EVENTOS DE DIBUJO DEL RATÓN
    // =============================
    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (activeTool === "WALL") {
            isDrawing.current = true;
            lastPoint.current = { x, y };
        } else if (activeTool === "TARGET") {
            if (engineRef.current) engineRef.current.target = { x, y };
        } else if (activeTool === "GRAVITY") {
            userWells.current.push({ x, y, radius: 25, strength: 5 });
            if (engineRef.current) engineRef.current.setObstacles(userWalls.current, userWells.current);
        }
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDrawing.current || activeTool !== "WALL") return;

        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (lastPoint.current) {
            // Añadir muro
            userWalls.current.push({
                p1: { x: lastPoint.current.x, y: lastPoint.current.y },
                p2: { x, y }
            });
            if (engineRef.current) engineRef.current.setObstacles(userWalls.current, userWells.current);
        }

        lastPoint.current = { x, y };
    };

    const handlePointerUp = () => {
        isDrawing.current = false;
        lastPoint.current = null;
    };

    const clearLevel = () => {
        userWalls.current = [];
        userWells.current = [];
        if (engineRef.current) engineRef.current.setObstacles([], []);
    };

    const triggerExtinction = () => {
        if (engineRef.current) {
            engineRef.current.initPopulation();
            engineRef.current.generation = 1;
            engineRef.current.currentTick = 0;
            setGeneration(1);
            setCurrentFrame(0);
        }
    };

    return (
        <main className="h-screen w-screen bg-black overflow-hidden relative flex text-white font-mono select-none">

            {/* Panel de Ingeniería Analítica Lateral Izquierdo */}
            <div className="w-[320px] flex flex-col justify-between p-6 z-20 border-r border-white/10 bg-[#050510] backdrop-blur-md">

                <div className="overflow-y-auto custom-scrollbar pr-2 flex-col flex h-full">
                    <Link href="/projects" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs font-bold mb-6 tracking-widest uppercase">
                        <ArrowLeft size={16} /> Procedural AI Hub
                    </Link>
                    <h1 className="text-2xl font-display font-black tracking-tighter uppercase text-amber-500 mb-1">Gen-Pathfinder</h1>
                    <p className="text-white/40 text-[10px] leading-relaxed mb-6">
                        Construye obstáculos letales. El enjambre de cohetes tiene Redes Neuronales conectadas a escáneres láser y evolucionará (IA Genética) partida a partida hasta resolver el camino.
                    </p>

                    {/* TELEMETRÍA */}
                    <div className="bg-white/5 border border-white/10 p-3 mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Generación AI</span>
                            <span className="font-mono text-xl text-amber-500">{generation}</span>
                        </div>
                        <div className="w-full bg-black/50 h-1 rounded overflow-hidden">
                            <div
                                className="h-full bg-amber-500 transition-all duration-75"
                                style={{ width: `${(currentFrame / lifespan) * 100}%` }}
                            />
                        </div>
                        <div className="text-[9px] text-white/30 text-right mt-1">
                            TICK: {currentFrame} / {lifespan}
                        </div>
                    </div>

                    {/* HERRAMIENTAS DE DIBUJO (SANDBOX) */}
                    <div className="mb-6">
                        <h2 className="text-[10px] text-white/40 tracking-widest font-bold uppercase mb-3">Herramientas de Nivel</h2>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => setActiveTool("WALL")}
                                className={`flex flex-col items-center justify-center p-3 border ${activeTool === "WALL" ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'border-white/10 text-white/50 hover:text-white'} transition-colors rounded`}
                            >
                                <Edit3 size={18} className="mb-1" />
                                <span className="text-[9px] font-bold">Muros</span>
                            </button>
                            <button
                                onClick={() => setActiveTool("TARGET")}
                                className={`flex flex-col items-center justify-center p-3 border ${activeTool === "TARGET" ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'border-white/10 text-white/50 hover:text-white'} transition-colors rounded`}
                            >
                                <Target size={18} className="mb-1" />
                                <span className="text-[9px] font-bold">Meta</span>
                            </button>
                            <button
                                onClick={() => setActiveTool("GRAVITY")}
                                className={`flex flex-col items-center justify-center p-3 border ${activeTool === "GRAVITY" ? 'bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-500' : 'border-white/10 text-white/50 hover:text-white'} transition-colors rounded`}
                            >
                                <Disc size={18} className="mb-1" />
                                <span className="text-[9px] font-bold">Muerte</span>
                            </button>
                        </div>
                    </div>

                    {/* SLIDERS GENÉTICOS */}
                    <div className="space-y-4 mb-6">
                        <h2 className="text-[10px] text-white/40 tracking-widest font-bold uppercase mb-3 border-t border-white/10 pt-4">Laboratorio Genético</h2>

                        <div>
                            <div className="flex justify-between text-[10px] uppercase font-bold text-white/70 mb-1">
                                <span>Población</span>
                                <span className="text-amber-400">{popSize}</span>
                            </div>
                            <input
                                type="range" min="50" max="600" step="50"
                                value={popSize}
                                onChange={(e) => setPopSize(parseInt(e.target.value))}
                                className="w-full accent-amber-500"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] uppercase font-bold text-white/70 mb-1">
                                <span>Tasa Extinción (Ticks)</span>
                                <span className="text-amber-400">{lifespan}</span>
                            </div>
                            <input
                                type="range" min="100" max="1000" step="100"
                                value={lifespan}
                                onChange={(e) => setLifespan(parseInt(e.target.value))}
                                className="w-full accent-amber-500"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] uppercase font-bold text-white/70 mb-1">
                                <span>Tasa de Mutación</span>
                                <span className="text-fuchsia-400">{(mutRate * 100).toFixed(0)}%</span>
                            </div>
                            <input
                                type="range" min="0.01" max="0.5" step="0.01"
                                value={mutRate}
                                onChange={(e) => setMutRate(parseFloat(e.target.value))}
                                className="w-full accent-fuchsia-500"
                            />
                        </div>
                    </div>

                    {/* CONTROLES DE MOTOR */}
                    <div className="mt-auto space-y-2">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsPaused(!isPaused)}
                                className={`flex-1 flex items-center justify-center gap-2 p-3 font-bold uppercase tracking-widest text-[10px] transition-colors rounded border border-white/20 hover:bg-white hover:text-black`}
                            >
                                {isPaused ? <Play size={14} className="text-emerald-500" /> : <Pause size={14} className="text-amber-500" />}
                                {isPaused ? "Reanudar" : "Pausar Simulación"}
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={clearLevel}
                                className="flex-1 flex items-center justify-center gap-2 p-2 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors uppercase text-[9px] font-bold rounded"
                            >
                                <Trash2 size={12} /> Limpiar Nivel
                            </button>
                            <button
                                onClick={triggerExtinction}
                                className="flex-1 flex items-center justify-center gap-2 p-2 border border-white/20 text-white/60 hover:text-white transition-colors uppercase text-[9px] font-bold rounded"
                            >
                                Resetear Genética
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* LIENZO INTERACTIVO (SANDBOX) */}
            <div
                className={`flex-1 relative overflow-hidden touch-none 
                    ${activeTool === "WALL" ? "cursor-crosshair" : "cursor-pointer"}
                `}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
            >
                <canvas ref={canvasRef} className="block w-full h-full bg-[#050510]" />

                {/* HUD INSTRUCTIVO (Desaparece tras pintar) */}
                {userWalls.current.length === 0 && userWells.current.length === 0 && generation < 5 && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none opacity-50">
                        <p className="text-2xl font-bold uppercase tracking-widest text-white/50 mb-2">Editor Activo</p>
                        <p className="text-xs text-amber-500">Pinta obstáculos en la pantalla para crear un nivel.</p>
                    </div>
                )}
            </div>

        </main>
    );
}

