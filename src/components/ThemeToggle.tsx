"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      // Sonido Jedi
      const audio = new Audio('/sounds/lightsaber-on.mp3');
      audio.play();
      setTheme('light');
    } else {
      // Sonido Sith
      const audio = new Audio('/sounds/lightsaber-off.mp3');
      audio.play();
      setTheme('dark');
    }
  };

  if (!mounted) {
    return (
      <button className="p-2 rounded-full bg-white/10 animate-pulse" disabled>
        <Sun size={20} />
      </button>
    );
  }

  return (
    <button 
      onClick={toggleTheme}
      className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-all backdrop-blur-sm border border-white/5"
      title="Cambiar Tema"
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
