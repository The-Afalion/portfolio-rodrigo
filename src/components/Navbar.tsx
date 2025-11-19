"use client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Mail, Terminal } from "lucide-react";
import Link from "next/link";

const navItemVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
};

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border py-3"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <motion.div variants={navItemVariants} initial="hidden" animate="visible" transition={{ delay: 0.6 }}>
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-foreground text-background rounded-lg group-hover:scale-110 transition-transform">
              <Terminal size={20} />
            </div>
            <span className="font-mono font-bold text-lg tracking-tight hidden sm:block">
              RODRIGO<span className="text-blue-500">.dev</span>
            </span>
          </Link>
        </motion.div>

        <motion.div
          variants={navItemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.7 }}
          className="flex items-center gap-4"
        >
          <a
            href="mailto:rodrigo@rodocodes.dev"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-secondary hover:bg-accent text-sm font-medium transition-colors"
          >
            <Mail size={16} />
            <span>Contáctame</span>
          </a>

          <div className="h-6 w-px bg-border"></div>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-accent transition-colors relative overflow-hidden"
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
        </motion.div>
      </div>
    </motion.nav>
  );
}
