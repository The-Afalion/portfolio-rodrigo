"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, Mail, Rss, Terminal, Workflow } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useContextoGlobal } from "@/context/ContextoGlobal";
import { primaryNavigation, siteConfig } from "@/config/site";

const navItemVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
};

function SiteLogo() {
  const { logoCambiado1984 } = useContextoGlobal();

  return (
    <span className="hidden items-center font-mono text-lg font-bold tracking-tight text-foreground sm:flex">
      <span>r</span>
      {logoCambiado1984 ? (
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
          <Eye size={18} className="mx-px text-primary" />
        </motion.span>
      ) : (
        <span>o</span>
      )}
      <span>do</span>
      <span className="text-primary">codes</span>
    </span>
  );
}

const quickLinks = primaryNavigation.filter(({ href }) => href === "/blog" || href === "/engineering");

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border bg-background/90 py-4 shadow-sm backdrop-blur-xl"
          : "bg-transparent py-6"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        <motion.div variants={navItemVariants} initial="hidden" animate="visible" transition={{ delay: 0.35 }}>
          <Link href="/" className="group flex items-center gap-3">
            <div className="rounded-lg bg-foreground p-2 text-background transition-transform group-hover:scale-110">
              <Terminal size={20} />
            </div>
            <SiteLogo />
          </Link>
        </motion.div>

        <motion.div
          variants={navItemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.45 }}
          className="flex items-center gap-3 sm:gap-4"
        >
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hidden items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent sm:flex"
            >
              {link.href === "/blog" ? <Rss size={16} /> : <Workflow size={16} />}
              <span>{link.label}</span>
            </Link>
          ))}

          <a
            href={`mailto:${siteConfig.email}`}
            className="hidden items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent lg:flex"
          >
            <Mail size={16} />
            <span>Contáctame</span>
          </a>

          <div className="hidden h-6 w-px bg-border sm:block" />
          <ThemeToggle />
        </motion.div>
      </div>
    </motion.nav>
  );
}
