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
    let mouseX = 0;
    let mouseY = 0;

    // Configuración de los puntos
    const dots: { x: number; y: number; z: number; baseX: number; baseY: number }[] = [];
    const numDots = 150; // Cantidad de puntos
    const connectionDistance = 100;

    // Inicializar puntos
    for (let i = 0; i < numDots; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const z = Math.random() * 2 + 0.5; // Profundidad para el efecto parallax
      dots.push({ x, y, z, baseX: x, baseY: y });
    }

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX - width / 2;
      mouseY = e.clientY - height / 2;
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Dibujar puntos
      dots.forEach(dot => {
        // Efecto Parallax: Mover el punto en dirección opuesta al ratón, basado en su profundidad (z)
        const targetX = dot.baseX - (mouseX * dot.z * 0.05);
        const targetY = dot.baseY - (mouseY * dot.z * 0.05);
        
        // Suavizado (Lerp)
        dot.x += (targetX - dot.x) * 0.1;
        dot.y += (targetY - dot.y) * 0.1;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 1.5 * dot.z, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.1 * dot.z})`;
        ctx.fill();
      });

      // Dibujar líneas de conexión (opcional, le da un toque "tech")
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-0 pointer-events-none"
      style={{ background: 'radial-gradient(circle at center, #111 0%, #000 100%)' }}
    />
  );
}
