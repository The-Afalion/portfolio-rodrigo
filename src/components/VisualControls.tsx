"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Sparkles, Network } from 'lucide-react';

export default function VisualControls() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [bgMode, setBgMode] = useState('plexo');

  useEffect(() => {
    setMounted(true);
    const savedBg = localStorage.getItem('bg-mode');
    if (savedBg) setBgMode(savedBg);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    // Aquí puedes añadir los sonidos si quieres
  };

  const toggleBackground = () => {
    const newBgMode = bgMode === 'plexo' ? 'network' : 'plexo';
    setBgMode(newBgMode);
    localStorage.setItem('bg-mode', newBgMode);
    // Disparamos un evento global para que el gestor de fondos se entere
    window.dispatchEvent(new CustomEvent('bg-change', { detail: newBgMode }));
  };

  if (!mounted) return <div className="w-20 h-8" />; // Placeholder para evitar saltos de layout

  return (
    <div className="flex items-center gap-2 p-1 rounded-full bg-secondary border border-border">
      <button
        onClick={toggleTheme}
        className={`p-1.5 rounded-full transition-colors ${theme === 'light' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
        title="Cambiar Tema"
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>
      <button
        onClick={toggleBackground}
        className={`p-1.5 rounded-full transition-colors ${bgMode === 'plexo' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
        title="Cambiar Fondo"
      >
        {bgMode === 'plexo' ? <Network size={16} /> : <Sparkles size={16} />}
      </button>
    </div>
  );
}
