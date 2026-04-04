"use client";

import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { BookOpen, Leaf, Moon, Palette, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const THEMES = [
  { id: 'light', name: 'Paper', icon: Sun },
  { id: 'dark', name: 'Night', icon: Moon },
  { id: 'forest', name: 'Forest', icon: Leaf },
  { id: 'sepia', name: 'Archive', icon: BookOpen },
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
      <button className="flex h-10 w-10 items-center justify-center rounded-full border border-border/85 bg-card/60 animate-pulse" disabled>
        <span className="sr-only">Cargando temas...</span>
      </button>
    );
  }

  const CurrentIcon = THEMES.find(t => t.id === theme)?.icon || Palette;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border/85 bg-card text-muted-foreground shadow-sm transition-all duration-300 hover:border-foreground/15 hover:text-foreground"
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
            className="absolute right-0 top-12 z-50 mt-2 flex w-56 flex-col overflow-hidden rounded-[1.6rem] border border-border/85 bg-card/95 p-2 shadow-[0_24px_80px_rgba(15,23,42,0.16)] backdrop-blur-xl font-sans"
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
                  className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isSelected
                    ? 'border border-border/80 bg-secondary text-foreground'
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
