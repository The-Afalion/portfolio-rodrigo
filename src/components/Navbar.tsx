"use client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Mail, Terminal } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  // Detectar scroll para efecto de vidrio esmerilado
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-black dark:bg-white text-white dark:text-black rounded-lg group-hover:scale-110 transition-transform">
            <Terminal size={20} />
          </div>
          <span className="font-mono font-bold text-lg tracking-tight hidden sm:block">
            RODRIGO<span className="text-green-600 dark:text-green-400">.dev</span>
          </span>
        </Link>

        {/* Acciones Derecha */}
        <div className="flex items-center gap-4">

          {/* Botón Contacto (Mailto) */}
          <a
            href="mailto:rodrigo@rodocodes.dev"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-green-100 dark:hover:bg-green-900/30 text-sm font-medium transition-colors"
          >
            <Mail size={16} />
            <span>Contáctame</span>
          </a>

          {/* Separador */}
          <div className="h-6 w-px bg-gray-300 dark:bg-white/20"></div>

          {/* Toggle Tema */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors relative overflow-hidden"
            aria-label="Cambiar tema"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={theme}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {theme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.nav>
  );
}