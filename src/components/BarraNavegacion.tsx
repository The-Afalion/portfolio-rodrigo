"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Terminal, Eye, Rss, Mail } from "lucide-react";
import Link from "next/link";
import { usarContextoGlobal } from "@/context/ContextoGlobal";
import ThemeToggle from "./ThemeToggle"; // Importamos el nuevo componente unificado

const variantesElementoNav = {
  oculto: { y: -20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
};

function Logo() {
  const { logoCambiado1984 } = usarContextoGlobal();

  return (
    <span className="font-mono font-bold text-lg tracking-tight hidden sm:flex items-center">
      <span>r</span>
      {logoCambiado1984 ? (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }}>
          <Eye size={18} className="text-green-500 mx-px" />
        </motion.div>
      ) : (
        <span>o</span>
      )}
      <span>do</span>
      <span className="text-blue-500">codes</span>
    </span>
  );
}

export default function BarraNavegacion() {
  const [haHechoScroll, setHaHechoScroll] = useState(false);

  useEffect(() => {
    const gestionarScroll = () => setHaHechoScroll(window.scrollY > 50);
    window.addEventListener("scroll", gestionarScroll);
    return () => window.removeEventListener("scroll", gestionarScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        haHechoScroll
          ? "bg-background/80 backdrop-blur-md border-b border-border py-3"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <motion.div variants={variantesElementoNav} initial="oculto" animate="visible" transition={{ delay: 0.6 }}>
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-foreground text-background rounded-lg group-hover:scale-110 transition-transform">
              <Terminal size={20} />
            </div>
            <Logo />
          </Link>
        </motion.div>

        <motion.div
          variants={variantesElementoNav}
          initial="oculto"
          animate="visible"
          transition={{ delay: 0.7 }}
          className="flex items-center gap-4"
        >
          <Link
            href="/blog"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-secondary hover:bg-accent text-sm font-medium transition-colors"
          >
            <Rss size={16} />
            <span>Blog</span>
          </Link>
          <a
            href="mailto:rodrigo@rodocodes.dev"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-secondary hover:bg-accent text-sm font-medium transition-colors"
          >
            <Mail size={16} />
            <span>Contáctame</span>
          </a>

          <div className="h-6 w-px bg-border"></div>

          {/* Botón de tema unificado */}
          <ThemeToggle />
        </motion.div>
      </div>
    </motion.nav>
  );
}
