"use client";

import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { Play, Pause, RefreshCw, Plus } from 'lucide-react';

// Función para la Distribución Normal (Campana de Gauss)
function gaussian(x: number, mean: number, std: number) {
  return (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / std, 2));
}

export default function GaltonBoard() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const [ballCount, setBallCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // --- Lógica de la Simulación ---
  const setup = () => {
    if (!sceneRef.current) return;
    
    // Limpiar simulación anterior si existe
    if (engineRef.current) {
      Matter.World.clear(engineRef.current.world, false);
      Matter.Engine.clear(engineRef.current);
      if (sceneRef.current) sceneRef.current.innerHTML = '';
    }

    const Engine = Matter.Engine,
          Render = Matter.Render,
          Runner = Matter.Runner,
          Composite = Matter.Composite,
          Bodies = Matter.Bodies;

    const engine = Engine.create();
    engineRef.current = engine;
    engine.world.gravity.y = 1.2; // Gravedad un poco más fuerte

    const width = sceneRef.current.clientWidth;
    const height = sceneRef.current.clientHeight;

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width,
        height,
        wireframes: false,
        background: 'transparent',
        pixelRatio: window.devicePixelRatio
      }
    });

    const pegRadius = 3;
    const pegSpacing = 40;
    const startY = 100;
    const rows = 12;
    const pegs = [];

    for (let row = 0; row < rows; row++) {
      const cols = row + 3;
      const rowWidth = (cols - 1) * pegSpacing;
      const startX = (width - rowWidth) / 2;
      for (let col = 0; col < cols; col++) {
        const x = startX + col * pegSpacing;
        const y = startY + row * pegSpacing;
        pegs.push(Bodies.circle(x, y, pegRadius, { 
          isStatic: true,
          restitution: 0.6, // Rebote más vivo
          friction: 0.01,
          render: { fillStyle: '#94a3b8' }
        }));
      }
    }

    const bucketWidth = 8;
    const bucketHeight = 200;
    const numBuckets = rows + 2;
    const totalBucketsWidth = numBuckets * pegSpacing;
    const startBucketX = (width - totalBucketsWidth) / 2;
    const bucketY = height - bucketHeight / 2;
    const buckets = [];

    for (let i = 0; i <= numBuckets; i++) {
      const x = startBucketX + i * pegSpacing;
      buckets.push(Bodies.rectangle(x, bucketY, bucketWidth, bucketHeight, { 
        isStatic: true,
        render: { fillStyle: '#1e293b' }
      }));
    }
    
    const ground = Bodies.rectangle(width / 2, height, width, 20, { isStatic: true });
    Composite.add(engine.world, [...pegs, ...buckets, ground]);

    Render.run(render);
    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);
    setBallCount(0);
    setIsPaused(false);
  };

  useEffect(() => {
    setup();
    return () => {
      // Limpieza al desmontar el componente
      if (runnerRef.current) Runner.stop(runnerRef.current);
    };
  }, []);

  const addBalls = (count: number) => {
    if (!engineRef.current || !sceneRef.current) return;
    const width = sceneRef.current.clientWidth;
    const ballRadius = 6;
    for (let i = 0; i < count; i++) {
      const x = width / 2 + (Math.random() - 0.5) * 10;
      const ball = Bodies.circle(x, 50, ballRadius, {
        restitution: 0.5,
        friction: 0.005,
        render: { fillStyle: '#ef4444' }
      });
      Matter.Composite.add(engineRef.current.world, ball);
    }
    setBallCount(c => c + count);
  };

  const togglePause = () => {
    if (!runnerRef.current) return;
    runnerRef.current.enabled = !runnerRef.current.enabled;
    setIsPaused(!isPaused);
  };

  // --- Gráfico de la Campana de Gauss ---
  const numBuckets = rows + 2;
  const mean = numBuckets / 2;
  const stdDev = Math.sqrt(rows * 0.5 * 0.5); // Para una probabilidad de 0.5
  const pathData = Array.from({ length: 100 }).map((_, i) => {
    const x = (i / 99) * numBuckets;
    const y = gaussian(x, mean, stdDev);
    return { x, y };
  });
  const maxGaussianY = gaussian(mean, mean, stdDev);
  const svgPath = pathData.map(p => `${(startBucketX + p.x * pegSpacing) / sceneRef.current?.clientWidth * 100}%,${100 - (p.y / maxGaussianY) * 50}%`).join(' L ');

  return (
    <div className="w-full h-full relative">
      <div ref={sceneRef} className="w-full h-full" />
      
      {/* Gráfico SVG superpuesto */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${sceneRef.current?.clientWidth || 0} ${sceneRef.current?.clientHeight || 0}`}>
        <polyline points={svgPath} fill="none" stroke="rgba(255, 255, 0, 0.5)" strokeWidth="2" strokeDasharray="4 4" />
      </svg>

      {/* Controles */}
      <div className="absolute top-4 left-4 flex gap-2">
        <button onClick={togglePause} className="p-2 bg-black/50 backdrop-blur rounded-md border border-white/20 hover:bg-white/20">
          {isPaused ? <Play size={16} /> : <Pause size={16} />}
        </button>
        <button onClick={setup} className="p-2 bg-black/50 backdrop-blur rounded-md border border-white/20 hover:bg-white/20">
          <RefreshCw size={16} />
        </button>
        <button onClick={() => addBalls(100)} className="p-2 bg-black/50 backdrop-blur rounded-md border border-white/20 hover:bg-white/20">
          <Plus size={16} /> 100
        </button>
      </div>
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur px-4 py-2 rounded border border-white/20 font-mono text-xs">
        BOLAS: {ballCount}
      </div>
    </div>
  );
}
