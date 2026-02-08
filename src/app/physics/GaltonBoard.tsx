"use client";

import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

export default function GaltonBoard() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const [ballCount, setBallCount] = useState(0);

  useEffect(() => {
    if (!sceneRef.current) return;

    // Configuración inicial
    const Engine = Matter.Engine,
          Render = Matter.Render,
          Runner = Matter.Runner,
          Composite = Matter.Composite,
          Bodies = Matter.Bodies,
          Events = Matter.Events;

    const engine = Engine.create();
    engineRef.current = engine;

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

    // --- CONSTRUCCIÓN DEL TABLERO ---
    const pegRadius = 3;
    const pegSpacing = 40;
    const startY = 100;
    const rows = 12;
    const pegs = [];

    // Clavos (Obstáculos)
    for (let row = 0; row < rows; row++) {
      const cols = row + 3; // Forma piramidal
      const rowWidth = (cols - 1) * pegSpacing;
      const startX = (width - rowWidth) / 2;

      for (let col = 0; col < cols; col++) {
        const x = startX + col * pegSpacing;
        const y = startY + row * pegSpacing;
        pegs.push(Bodies.circle(x, y, pegRadius, { 
          isStatic: true,
          render: { fillStyle: '#ffffff' }
        }));
      }
    }

    // Cubos (Contenedores)
    const bucketWidth = 10;
    const bucketHeight = 200;
    const bucketY = height - bucketHeight / 2;
    const buckets = [];
    const numBuckets = rows + 4; // Un poco más ancho que la base de la pirámide
    const totalBucketsWidth = numBuckets * pegSpacing;
    const startBucketX = (width - totalBucketsWidth) / 2;

    for (let i = 0; i <= numBuckets; i++) {
      const x = startBucketX + i * pegSpacing - pegSpacing / 2;
      buckets.push(Bodies.rectangle(x, bucketY, bucketWidth, bucketHeight, { 
        isStatic: true,
        render: { fillStyle: '#333' }
      }));
    }
    
    // Suelo
    const ground = Bodies.rectangle(width / 2, height + 10, width, 20, { isStatic: true });

    Composite.add(engine.world, [...pegs, ...buckets, ground]);

    // --- GENERADOR DE BOLAS ---
    const ballRadius = 6;
    const spawnBall = () => {
      const x = width / 2 + (Math.random() - 0.5) * 2; // Pequeña variación inicial
      const ball = Bodies.circle(x, 50, ballRadius, {
        restitution: 0.5, // Rebote
        friction: 0.001,
        render: { fillStyle: '#ef4444' }
      });
      Composite.add(engine.world, ball);
      setBallCount(c => c + 1);
    };

    const interval = setInterval(spawnBall, 100); // Una bola cada 100ms

    // --- EJECUCIÓN ---
    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // Limpieza
    return () => {
      clearInterval(interval);
      Render.stop(render);
      Runner.stop(runner);
      if (render.canvas) render.canvas.remove();
      Composite.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, []);

  return (
    <div className="w-full h-full relative">
      <div ref={sceneRef} className="w-full h-full" />
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur px-4 py-2 rounded border border-white/20 font-mono text-xs">
        BOLAS: {ballCount}
      </div>
    </div>
  );
}
