"use client";

import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Sparkles, BookOpen, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const THEMES = [
  { id: 'light', name: 'Alabaster', icon: Sun },
  { id: 'dark', name: 'Obsidian', icon: Moon },
  { id: 'forest', name: 'Forest', icon: Sparkles },
  { id: 'sepia', name: 'Sepia', icon: BookOpen },
];

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    // Close dropdown strictly when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <button className="h-10 w-10 flex items-center justify-center rounded-full bg-secondary/50 animate-pulse" disabled>
        <span className="sr-only">Cargando temas...</span>
      </button>
    );
  }

  const CurrentIcon = THEMES.find(t => t.id === theme)?.icon || Palette;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-background border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-all duration-300 shadow-sm"
        aria-label="Cambiar tema de diseño"
      >
        <CurrentIcon size={18} strokeWidth={1.5} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 top-12 mt-2 w-48 bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col p-2 z-50 font-sans"
          >
            {THEMES.map((t) => {
              const Icon = t.icon;
              const isSelected = theme === t.id;

              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isSelected
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                >
                  <Icon size={16} strokeWidth={isSelected ? 2 : 1.5} />
                  <span>{t.name}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
