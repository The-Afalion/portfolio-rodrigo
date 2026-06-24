"use client";

import Link from "next/link";
import { Mail, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { primaryNavigation, siteConfig } from "@/config/site";
import OrwellEyeO from "@/components/OrwellEyeO";
import HomeStyleControls from "@/components/home/HomeStyleControls";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navigation = primaryNavigation.map((item) => ({
    ...item,
    active: isActive(pathname, item.href),
  }));

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-md ${
        isHome
          ? "border-border/80 bg-background/88"
          : "border-[#d6c4a5]/60 bg-[#fdfbf7]/90 font-serif"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="min-w-0">
          <p
            className={`truncate text-lg font-semibold tracking-tight ${
              isHome ? "font-display text-foreground" : "font-serif font-bold text-[#3e3024]"
            }`}
          >
            R<OrwellEyeO className="orwell-eye-o-header" />drigo Alonso
          </p>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[11px] font-semibold uppercase tracking-[0.26em] transition-colors ${
                isHome
                  ? item.active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                  : item.active
                    ? "text-[#8c4030]"
                    : "text-[#8a765f] hover:text-[#3e3024]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`mailto:${siteConfig.email}`}
            className={`hidden text-[11px] font-semibold uppercase tracking-[0.26em] transition-colors lg:inline-flex ${
              isHome ? "text-muted-foreground hover:text-foreground" : "text-[#8a765f] hover:text-[#3e3024]"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <Mail size={14} />
              {siteConfig.email}
            </span>
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
              isHome ? "" : "lg:hidden"
            } ${
              isHome
                ? "border-border/80 text-muted-foreground hover:text-foreground"
                : "border-[#d6c4a5] text-[#8a765f] hover:text-[#3e3024]"
            }`}
            aria-label="Abrir navegación"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div
          className={`border-t ${isHome ? "" : "lg:hidden"} ${
            isHome ? "border-border/80 bg-background" : "border-[#d6c4a5] bg-[#fdfbf7]"
          }`}
        >
          <div className="mx-auto grid max-w-7xl gap-2 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
            <div className="grid gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`py-3 text-sm font-medium ${
                    isHome
                      ? item.active
                        ? "text-foreground"
                        : "text-muted-foreground"
                      : item.active
                        ? "font-bold text-[#8c4030]"
                        : "text-[#8a765f]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <a
                href={`mailto:${siteConfig.email}`}
                className={`py-3 text-sm font-medium ${isHome ? "text-foreground" : "text-[#3e3024]"}`}
              >
                {siteConfig.email}
              </a>
            </div>

            {isHome ? (
              <div className="home-menu-style-panel">
                <p>Estilo</p>
                <HomeStyleControls />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
