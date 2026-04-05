"use client";

import Link from "next/link";
import { footerNavigation, siteConfig } from "@/config/site";

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/80 py-14">
      <div className="page-container grid gap-10 lg:grid-cols-[1fr,0.8fr,0.8fr]">
        <div className="space-y-3">
          <p className="font-display text-2xl font-semibold tracking-tight text-foreground">{siteConfig.name}</p>
          <p className="max-w-md text-sm leading-7 text-muted-foreground">
            Producto digital, sistemas interactivos y prototipos técnicos.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">Explorar</p>
          <div className="grid gap-2">
            {footerNavigation.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">Contacto</p>
          <a href={`mailto:${siteConfig.email}`} className="block text-sm text-foreground hover:text-muted-foreground">
            {siteConfig.email}
          </a>
          <a href={siteConfig.github} target="_blank" rel="noopener noreferrer" className="block text-sm text-muted-foreground hover:text-foreground">
            GitHub
          </a>
          <a href={siteConfig.linkedin} target="_blank" rel="noopener noreferrer" className="block text-sm text-muted-foreground hover:text-foreground">
            LinkedIn
          </a>
        </div>
      </div>

      <div className="page-container mt-10 flex flex-col gap-2 border-t border-border/80 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {currentYear} {siteConfig.name}</p>
        <p>{siteConfig.role}</p>
      </div>
    </footer>
  );
}
