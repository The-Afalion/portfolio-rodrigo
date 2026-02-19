"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const DOT_SIZE = 2;
const DOT_SPACING = 40;

export default function FondoRejilla() {
  const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setMousePosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 transition-all duration-300"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(45, 212, 191, 0.1) 0%, transparent 30%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at center, transparent, hsl(var(--background))),
            repeating-radial-gradient(circle, hsl(var(--border) / 0.3) 0, hsl(var(--border) / 0.3) ${DOT_SIZE}px, transparent ${DOT_SIZE}px, transparent ${DOT_SPACING}px)
          `,
          backgroundSize: '100% 100%, auto',
        }}
      />
    </div>
  );
}
