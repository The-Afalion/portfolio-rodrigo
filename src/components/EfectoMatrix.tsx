"use client";

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { usarContextoGlobal } from '@/context/ContextoGlobal';

export default function EfectoMatrix() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { setEfectoMatrixVisible } = usarContextoGlobal();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ajustar el tamaño del canvas a la pantalla
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const caracteres = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789';
    const tamanoFuente = 16;
    const columnas = Math.floor(canvas.width / tamanoFuente);
    const gotas = Array(columnas).fill(1);

    let animacionId: number;

    function dibujar() {
      // Fondo semitransparente para crear el efecto de estela
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0F0'; // Color verde Matrix
      ctx.font = `${tamanoFuente}px monospace`;

      for (let i = 0; i < gotas.length; i++) {
        const texto = caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        ctx.fillText(texto, i * tamanoFuente, gotas[i] * tamanoFuente);

        // Si la gota llega al final, la reseteamos al principio con una probabilidad
        if (gotas[i] * tamanoFuente > canvas.height && Math.random() > 0.975) {
          gotas[i] = 0;
        }
        gotas[i]++;
      }
    }

    const render = () => {
      dibujar();
      animacionId = requestAnimationFrame(render);
    };

    render();

    // Función para cerrar el efecto
    const cerrar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEfectoMatrixVisible(false);
      }
    };

    window.addEventListener('keydown', cerrar);

    // Limpieza al desmontar el componente
    return () => {
      cancelAnimationFrame(animacionId);
      window.removeEventListener('keydown', cerrar);
    };
  }, [setEfectoMatrixVisible]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] bg-black"
    >
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 font-mono text-sm animate-pulse">
        Pulsa 'Esc' para salir
      </div>
    </motion.div>
  );
}
