"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, FastForward } from "lucide-react";
import { Car } from "@/lib/ai/Car";
import { Track } from "@/lib/ai/Track";
import { NeuralNetwork } from "@/lib/ai/NeuralNetwork";

export default function NeuralRacingClient() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const bestCarRef = useRef<Car | null>(null);
    const [generation, setGeneration] = useState(1);
    const [bestDistance, setBestDistance] = useState(0);
    const [level, setLevel] = useState(1);

    const CAR_GENERATION_COUNT = 150;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = 400;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Obtener nivel actual
        const currentLevel = parseInt(localStorage.getItem("neural_level") || "1");
        setLevel(currentLevel);

        // Nivel 1, 2 y 3 van hacia hacia adelante (Y negativo)
        const track = new Track(canvas.width / 2, canvas.width * 0.9, 3, currentLevel);

        const cars = generateCars(CAR_GENERATION_COUNT, track);

        // Generador de tráfico procedural progresivo
        const maxTrafficRange = (currentLevel * 5000) + 5500;
        const traffic: Car[] = [];
        let currentY = -100;

        if (currentLevel !== 3 && currentLevel !== 5 && currentLevel !== 7) {
            while (Math.abs(currentY) < maxTrafficRange) {
                const dist = Math.abs(currentY);

                let gap;
                if (dist > 5000 && currentLevel === 1) {
                    // Nivel 1 se congestiona al final
                    gap = 100;
                } else {
                    gap = Math.max(120, 300 - (dist / 5000) * 180);
                }

                // Si es Nivel 2, como la velocidad relativa es brutal (de frente), necesitamos un hueco mucho mayor 
                // para que a la IA le de tiempo a cambiar el vector lateralmente
                if (currentLevel === 2) {
                    gap *= 2.5;
                }

                const speed = 2 + (dist / 10000) * 1.5;
                const blockTwoLanes = Math.random() < Math.min(dist / 5000, 0.85);

                const lanes = [0, 1, 2];
                const lane1 = lanes.splice(Math.floor(Math.random() * lanes.length), 1)[0];

                const t1 = new Car(track.getLaneCenter(lane1, currentY), currentY, 30, 50, "DUMMY", speed);
                if (currentLevel === 2) t1.angle = Math.PI; // Nivel 2: Tráfico baja en contra dirección
                traffic.push(t1);

                if (blockTwoLanes) {
                    const lane2 = lanes.splice(Math.floor(Math.random() * lanes.length), 1)[0];
                    const t2 = new Car(track.getLaneCenter(lane2, currentY - 50), currentY - (Math.random() * 50), 30, 50, "DUMMY", speed);
                    if (currentLevel === 2) t2.angle = Math.PI;
                    traffic.push(t2);
                }

                currentY -= gap;
            }
        }

        // Memoria Genética
        let bestBrainScore = localStorage.getItem("bestBrain");
        if (bestBrainScore) {
            setGeneration(parseInt(localStorage.getItem("generation") || "1"));
            for (let i = 0; i < cars.length; i++) {
                cars[i].brain = JSON.parse(bestBrainScore);
                if (i !== 0) {
                    // Durante la transición del nivel 1 al 2 mantenemos la mutación baja para no romper lo aprendido
                    NeuralNetwork.mutate(cars[i].brain!, 0.15);
                }
            }
        }

        let animationId: number;

        const animate = (time: number) => {
            // Encontrar el coche líder
            const currentBestCar = cars.find(c => c.y === Math.min(...cars.map(x => x.y))) || cars[0];

            bestCarRef.current = currentBestCar;
            const dist = Math.round(Math.abs(currentBestCar.y - 100));
            setBestDistance(dist);

            // CONDICIÓN DE VICTORIA NIVEL 1 -> INICIO NIVEL 2
            if (dist >= 10000 && currentLevel === 1) {
                localStorage.setItem("neural_level", "2");
                localStorage.setItem("bestBrain", JSON.stringify(currentBestCar.brain));
                window.location.reload();
                return;
            }

            // CONDICIÓN DE VICTORIA NIVEL 2 -> INICIO NIVEL 3
            if (dist >= 10000 && currentLevel === 2) {
                localStorage.setItem("neural_level", "3");
                localStorage.setItem("bestBrain", JSON.stringify(currentBestCar.brain));
                window.location.reload();
                return;
            }

            // CONDICIÓN DE VICTORIA NIVEL 3 -> INICIO NIVEL 4
            if (dist >= 15000 && currentLevel === 3) {
                localStorage.setItem("neural_level", "4");
                localStorage.setItem("bestBrain", JSON.stringify(currentBestCar.brain));
                window.location.reload();
                return;
            }

            // CONDICIÓN DE VICTORIA NIVEL 4 -> INICIO NIVEL 5
            if (dist >= 20000 && currentLevel === 4) {
                localStorage.setItem("neural_level", "5");
                localStorage.setItem("bestBrain", JSON.stringify(currentBestCar.brain));
                window.location.reload();
                return;
            }

            // CONDICIÓN DE VICTORIA NIVEL 5 -> INICIO NIVEL 6
            if (dist >= 25000 && currentLevel === 5) {
                localStorage.setItem("neural_level", "6");
                localStorage.setItem("bestBrain", JSON.stringify(currentBestCar.brain));
                window.location.reload();
                return;
            }

            // CONDICIÓN DE VICTORIA NIVEL 6 -> INICIO NIVEL 7
            if (dist >= 30000 && currentLevel === 6) {
                localStorage.setItem("neural_level", "7");
                localStorage.setItem("bestBrain", JSON.stringify(currentBestCar.brain));
                window.location.reload();
                return;
            }

            canvas.height = window.innerHeight;

            for (let i = 0; i < traffic.length; i++) {
                if (currentLevel === 4 && Math.random() < 0.005) {
                    const randomLane = Math.floor(Math.random() * track.laneCount);
                    traffic[i].targetX = track.getLaneCenter(randomLane, traffic[i].y);
                }
                traffic[i].update(track.borders);
            }

            const allBorders = [
                ...track.borders,
                ...traffic.map(c => c.polygon),
                ...traffic.flatMap(c => c.targetPolygon && c.targetPolygon.length > 0 ? [c.targetPolygon] : [])
            ];

            for (let i = 0; i < cars.length; i++) {
                // Acelerar los coches progresivamente. Comienzan en base 4 y pueden llegar hasta 7 haciendolo insufrible de reaccionar.
                cars[i].maxSpeed = 4 + (Math.abs(cars[i].y - 100) / 10000) * 3;
                cars[i].update(allBorders);
            }

            ctx.save();
            // Cámara parallax sigue al líder
            ctx.translate(0, -currentBestCar.y + canvas.height * 0.7);

            track.draw(ctx);

            ctx.globalAlpha = 1;
            for (let i = 0; i < traffic.length; i++) {
                // Niebla Neuronal: Tráfico totalmente invisible, solo escaneable por los láseres
                if (currentLevel !== 6) {
                    traffic[i].draw(ctx, "#ef4444");
                }
            }

            ctx.globalAlpha = 0.2;
            for (let i = 1; i < cars.length; i++) {
                cars[i].draw(ctx, "rgba(59, 130, 246, 0.5)");
            }

            ctx.globalAlpha = 1;
            currentBestCar.draw(ctx, "#10b981", true);

            ctx.restore();
            animationId = requestAnimationFrame(animate);
        };

        animate(0);

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, []);

    const generateCars = (N: number, track: Track) => {
        const cars = [];
        for (let i = 1; i <= N; i++) {
            cars.push(new Car(track.getLaneCenter(1), 100, 30, 50, "AI", 4));
        }
        return cars;
    }

    const saveMinds = () => {
        if (bestCarRef.current && bestCarRef.current.brain) {
            localStorage.setItem("bestBrain", JSON.stringify(bestCarRef.current.brain));
            localStorage.setItem("generation", (generation + 1).toString());
            window.location.reload();
        }
    }

    const resetKnowledge = () => {
        localStorage.removeItem("bestBrain");
        localStorage.setItem("generation", "1");
        localStorage.setItem("neural_level", "1");
        window.location.reload();
    }

    return (
        <main className="h-screen w-screen bg-black overflow-hidden relative flex text-white font-mono">
            <div className="w-[350px] flex flex-col justify-between p-6 z-20 border-r border-white/10 bg-black/80 backdrop-blur-md">

                <div>
                    <Link href="/engineering" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs font-bold mb-10 tracking-widest uppercase">
                        <ArrowLeft size={16} /> Engineering Core
                    </Link>
                    <h1 className="text-3xl font-display font-black tracking-tighter uppercase mb-2">Neuroevolution Lab</h1>
                    {level === 1 && (
                        <p className="text-white/50 text-xs leading-relaxed mb-6">
                            Perceptrón multicapa acelerado por algoritmo genético. Objetivo: Llegar a 10,000m.
                        </p>
                    )}
                    {level === 2 && (
                        <p className="text-emerald-400 text-xs font-bold leading-relaxed mb-6 animate-pulse">
                            FASE REVERSA DESBLOQUEADA: Sobrevive en contradirección (10,000m más).
                        </p>
                    )}
                    {level === 3 && (
                        <p className="text-fuchsia-400 text-xs font-bold leading-relaxed mb-6 animate-pulse">
                            FASE 3 - CAOS ESTRUCTURAL: Sobrevive al colapso espacial y sinusoidal de la vía matemática.
                        </p>
                    )}
                    {level === 4 && (
                        <p className="text-amber-400 text-xs font-bold leading-relaxed mb-6 animate-pulse">
                            FASE 4 - AUTOPISTA: El tráfico cambiará de carril aleatoriamente (15,000m).
                        </p>
                    )}
                    {level === 5 && (
                        <p className="text-yellow-400 text-xs font-bold leading-relaxed mb-6 animate-pulse">
                            FASE 5 - ZONA SÍSMICA: Salta entre las placas tectónicas desconectadas. ¡Alineación crítica!
                        </p>
                    )}
                    {level === 6 && (
                        <p className="text-gray-500 text-xs font-bold leading-relaxed mb-6 animate-pulse">
                            FASE 6 - NIEBLA NEURONAL: Oscuridad absoluta. Confía solo en el radar láser.
                        </p>
                    )}
                    {level === 7 && (
                        <p className="text-cyan-400 text-xs font-bold leading-relaxed mb-6 animate-pulse">
                            FASE 7 - CENTRIFUGADORA: La pista gira infinitamente hacia el abismo y se estrecha.
                        </p>
                    )}

                    <div className="space-y-4 mb-10 border-t border-white/10 pt-6">
                        <div className="flex justify-between items-center bg-white/5 p-3">
                            <span className="text-xs text-secondary-foreground font-bold tracking-widest uppercase leading-none">FASE</span>
                            <span className="text-primary font-mono text-xl">{level === 1 ? "1 (Ascenso)" : level === 2 ? "2 (Descenso)" : level === 3 ? "3 (Sinusoidal)" : level === 4 ? "4 (Autopista)" : level === 5 ? "5 (Sísmica)" : level === 6 ? "6 (Niebla)" : "7 (Centrífuga)"}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/5 p-3">
                            <span className="text-xs text-secondary-foreground font-bold tracking-widest uppercase leading-none">Generación</span>
                            <span className="text-primary font-mono text-xl">{generation}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/5 p-3">
                            <span className="text-xs text-secondary-foreground font-bold tracking-widest uppercase leading-none">Distancia Z</span>
                            <span className="text-white font-mono text-xl">{bestDistance}m</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/5 p-3">
                            <span className="text-xs text-secondary-foreground font-bold tracking-widest uppercase leading-none">Tráfico</span>
                            <span className="text-red-400 font-mono text-xl">{level === 3 || level === 5 || level === 7 ? "N/A" : "Masivo"}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={saveMinds}
                        className="w-full flex items-center justify-center gap-2 p-4 bg-primary text-black font-bold uppercase tracking-widest text-xs hover:bg-primary/80 transition-colors"
                    >
                        <FastForward size={16} /> Mutar Generación {generation + 1}
                    </button>
                    <button
                        onClick={resetKnowledge}
                        className="w-full flex items-center justify-center gap-2 p-4 border border-red-500/20 text-red-400 font-bold uppercase tracking-widest text-xs hover:bg-red-500/10 transition-colors"
                        title="Borrar red y empezar de cero"
                    >
                        <Trash2 size={16} /> Reiniciar Simulación
                    </button>
                </div>

            </div>

            <div className="flex-1 relative bg-[#050510] flex justify-center items-center">
                <canvas ref={canvasRef} className="block shadow-[0_0_100px_rgba(59,130,246,0.1)] border-x border-white/5" />
            </div>

        </main>
    );
}
