"use client";

import { useEffect, useRef } from 'react';

export default function ParallaxBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Configuración
    const starCount = 200;
    const speedMultiplier = 0.5; // Velocidad global

    class Star {
      x: number;
      y: number;
      z: number; // Profundidad (0 = lejos, 1 = cerca)
      size: number;
      speed: number;
      color: string;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.z = Math.random();
        this.size = this.z * 2; // Más cerca = más grande
        this.speed = (this.z + 0.1) * 3 * speedMultiplier; // Más cerca = más rápido
        
        // Paleta de azules y cyanes
        const colors = ['#60a5fa', '#3b82f6', '#22d3ee', '#e0f2fe'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        // Movimiento diagonal (como lluvia de estrellas)
        this.x -= this.speed;
        this.y += this.speed * 0.5;

        // Reiniciar si sale de la pantalla
        if (this.x < 0 || this.y > height) {
          this.x = width + Math.random() * 100; // Reaparece por la derecha
          this.y = -100 + Math.random() * height; // Reaparece por arriba
          this.z = Math.random();
          this.size = this.z * 2;
          this.speed = (this.z + 0.1) * 3 * speedMultiplier;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Brillo extra para las cercanas
        if (this.z > 0.8) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = this.color;
        } else {
          ctx.shadowBlur = 0;
        }
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
    };

    const animate = () => {
      // TRUCO DE LA ESTELA:
      // En lugar de borrar (clearRect), pintamos un rectángulo negro semitransparente.
      // Esto hace que los frames anteriores se desvanezcan lentamente, creando la estela.
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; 
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
