"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Menu, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { primaryNavigation, siteConfig } from "@/config/site";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation = useMemo(
    () =>
      primaryNavigation.map((item) => ({
        ...item,
        active: isActive(pathname, item.href),
      })),
    [pathname],
  );

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4"
    >
      <div className="mx-auto max-w-7xl rounded-[28px] border border-border/80 bg-background/82 px-4 py-3 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/80 bg-card text-primary">
              <Sparkles size={18} strokeWidth={1.7} />
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-base font-semibold text-foreground sm:text-lg">{siteConfig.name}</p>
              <p className="hidden text-xs uppercase tracking-[0.22em] text-muted-foreground sm:block">{siteConfig.role}</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  item.active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <a href={`mailto:${siteConfig.email}`} className="action-pill hidden lg:inline-flex">
              <Mail size={16} />
              <span>Contacto</span>
            </a>
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-card text-muted-foreground transition-colors hover:text-foreground lg:hidden"
              aria-label="Abrir navegación"
              aria-expanded={mobileOpen}
            >
              <Menu size={18} />
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div className="surface-divider mt-4 pt-4 lg:hidden">
            <nav className="grid gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                    item.active
                      ? "bg-foreground text-background"
                      : "bg-card/70 text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <a
                href={`mailto:${siteConfig.email}`}
                className="mt-2 rounded-2xl border border-border/80 bg-card/70 px-4 py-3 text-sm font-medium text-foreground"
              >
                Contacto
              </a>
            </nav>
          </div>
        ) : null}
      </div>
    </motion.header>
  );
}
