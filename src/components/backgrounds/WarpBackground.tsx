"use client";

import { useEffect, useRef } from 'react';

export default function WarpBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // El centro de la pantalla (hacia donde miramos)
    let cx = width / 2;
    let cy = height / 2;

    const starCount = 300;
    const speed = 2; // Velocidad base

    class Star {
      x: number;
      y: number;
      z: number;
      pz: number; // Z anterior (para dibujar la estela)
      color: string;

      constructor() {
        this.x = (Math.random() - 0.5) * width * 2; // Esparcir más allá de la pantalla
        this.y = (Math.random() - 0.5) * height * 2;
        this.z = Math.random() * width; // Profundidad inicial aleatoria
        this.pz = this.z;
        
        // Azules y cyanes eléctricos
        const colors = ['#60a5fa', '#3b82f6', '#22d3ee', '#a78bfa'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.pz = this.z; // Guardar posición anterior
        this.z -= speed * 5; // Mover hacia el espectador

        // Si la estrella pasa al espectador (z < 1), reiniciar al fondo
        if (this.z < 1) {
          this.x = (Math.random() - 0.5) * width * 2;
          this.y = (Math.random() - 0.5) * height * 2;
          this.z = width;
          this.pz = this.z;
        }
      }

      draw() {
        if (!ctx) return;

        // Proyección 3D: x / z
        // Cuanto más cerca (menor z), más lejos del centro se ve (mayor sx)
        const sx = (this.x / this.z) * 100 + cx;
        const sy = (this.y / this.z) * 100 + cy;

        // Posición anterior para la estela
        const px = (this.x / this.pz) * 100 + cx;
        const py = (this.y / this.pz) * 100 + cy;

        // Si está fuera de pantalla, no dibujar
        if (sx < 0 || sx > width || sy < 0 || sy > height) return;

        // Tamaño basado en cercanía
        const size = (1 - this.z / width) * 3;

        ctx.beginPath();
        ctx.moveTo(px, py); // Desde la posición anterior
        ctx.lineTo(sx, sy); // Hasta la actual (crea la línea/estela)
        
        ctx.strokeStyle = this.color;
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    }

    const stars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push(new Star());
    }

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      cx = width / 2;
      cy = height / 2;
    };

    const animate = () => {
      // Estela suave: No borramos del todo, pintamos negro semitransparente
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; 
      ctx.fillRect(0, 0, width, height);
      
      stars.forEach(star => {
        star.update();
        star.draw();
      });

      requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-0 pointer-events-none bg-black"
    />
  );
}
