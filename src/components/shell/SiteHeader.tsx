"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { primaryNavigation, siteConfig } from "@/config/site";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navigation = primaryNavigation.map((item) => ({
    ...item,
    active: isActive(pathname, item.href),
  }));

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4"
    >
      <div className="mx-auto max-w-[1360px] rounded-[30px] border border-border/85 bg-background/92 px-4 py-3 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1.1rem] border border-border/85 bg-card font-mono text-[11px] font-semibold tracking-[0.28em] text-foreground">
              RA
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-base font-semibold text-foreground sm:text-lg">{siteConfig.name}</p>
              <p className="hidden text-[11px] uppercase tracking-[0.26em] text-muted-foreground sm:block">{siteConfig.role}</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 xl:flex">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  item.active
                    ? "border border-border/85 bg-card text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <a href={`mailto:${siteConfig.email}`} className="action-pill hidden lg:inline-flex">
              <Mail size={16} />
              <span>Hablemos</span>
            </a>
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-card text-muted-foreground transition-colors hover:text-foreground xl:hidden"
              aria-label="Abrir navegación"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div className="surface-divider mt-4 pt-4 xl:hidden">
            <nav className="grid gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                    item.active
                      ? "border border-border/85 bg-card text-foreground"
                      : "bg-card/70 text-foreground hover:bg-secondary"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <a
                href={`mailto:${siteConfig.email}`}
                className="mt-2 rounded-2xl border border-border/85 bg-card px-4 py-3 text-sm font-medium text-foreground"
              >
                Hablemos
              </a>
            </nav>
          </div>
        ) : null}
      </div>
    </motion.header>
  );
}
