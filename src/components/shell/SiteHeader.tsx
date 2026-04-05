"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
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
      initial={{ y: -18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-x-0 top-0 z-50 border-b border-border/80 bg-background/88 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="min-w-0">
          <p className="truncate font-display text-lg font-semibold tracking-tight text-foreground">{siteConfig.name}</p>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[11px] font-semibold uppercase tracking-[0.26em] transition-colors ${
                item.active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`mailto:${siteConfig.email}`}
            className="hidden text-[11px] font-semibold uppercase tracking-[0.26em] text-muted-foreground transition-colors hover:text-foreground lg:inline-flex"
          >
            <span className="inline-flex items-center gap-2">
              <Mail size={14} />
              {siteConfig.email}
            </span>
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/80 text-muted-foreground transition-colors hover:text-foreground lg:hidden"
            aria-label="Abrir navegación"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-border/80 bg-background lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-2 px-4 py-4 sm:px-6">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`py-3 text-sm font-medium ${
                  item.active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <a href={`mailto:${siteConfig.email}`} className="py-3 text-sm font-medium text-foreground">
              {siteConfig.email}
            </a>
          </div>
        </div>
      ) : null}
    </motion.header>
  );
}
