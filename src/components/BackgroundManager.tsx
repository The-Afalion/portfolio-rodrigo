"use client";

import { useState, useEffect } from 'react';
import { Sparkles, Network } from 'lucide-react';
import WarpBackground from './backgrounds/WarpBackground';
import NetworkBackground from './backgrounds/NetworkBackground';

export default function BackgroundManager() {
  // Default to 'warp' (the blue stars one) as requested
  const [mode, setMode] = useState<'warp' | 'network'>('warp');

  useEffect(() => {
    const saved = localStorage.getItem('bg-mode');
    if (saved === 'warp' || saved === 'network') {
      setMode(saved);
    }
  }, []);

  const toggleMode = () => {
    const newMode = mode === 'warp' ? 'network' : 'warp';
    setMode(newMode);
    localStorage.setItem('bg-mode', newMode);
  };

  return (
    <>
      {mode === 'warp' ? <WarpBackground /> : <NetworkBackground />}
      
      <button 
        onClick={toggleMode}
        className="fixed top-24 right-6 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-all backdrop-blur-sm border border-white/5"
        title={mode === 'warp' ? "Cambiar a Red" : "Cambiar a Estrellas"}
      >
        {mode === 'warp' ? <Network size={20} /> : <Sparkles size={20} />}
      </button>
    </>
  );
}
