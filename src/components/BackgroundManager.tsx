"use client";

import { useState, useEffect } from 'react';
import { Sparkles, Network } from 'lucide-react';
import FondoPlexo from './FondoPlexo'; // El original que te gusta
import NetworkBackground from './backgrounds/NetworkBackground'; // La alternativa 2D
import { MotionValue } from 'framer-motion';

export default function BackgroundManager({ progresoScrollY }: { progresoScrollY: MotionValue<number> }) {
  // 'plexo' es el nuevo default (el antiguo que te gustaba)
  const [mode, setMode] = useState<'plexo' | 'network'>('plexo');

  useEffect(() => {
    const saved = localStorage.getItem('bg-mode');
    if (saved === 'plexo' || saved === 'network') {
      setMode(saved);
    }
  }, []);

  const toggleMode = () => {
    const newMode = mode === 'plexo' ? 'network' : 'plexo';
    setMode(newMode);
    localStorage.setItem('bg-mode', newMode);
  };

  return (
    <>
      {mode === 'plexo' ? (
        <FondoPlexo progresoScrollY={progresoScrollY} />
      ) : (
        <NetworkBackground />
      )}
      
      <button 
        onClick={toggleMode}
        className="fixed top-24 right-6 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-all backdrop-blur-sm border border-white/5"
        title={mode === 'plexo' ? "Cambiar a Red 2D" : "Cambiar a Plexo 3D"}
      >
        {mode === 'plexo' ? <Network size={20} /> : <Sparkles size={20} />}
      </button>
    </>
  );
}
