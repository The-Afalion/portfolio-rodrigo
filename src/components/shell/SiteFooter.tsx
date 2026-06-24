"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { footerNavigation, siteConfig } from "@/config/site";

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const isIndex = pathname === "/";

  return (
    <footer className={`border-t py-6 ${isIndex ? "border-border/80" : "border-border bg-[hsl(var(--surface-elevated))]"}`}>
      <div className="page-container grid gap-5 md:grid-cols-[1.25fr,0.8fr,0.8fr] md:items-start">
        <div className="space-y-2">
          <p className="font-display text-xl font-semibold tracking-tight text-foreground">{siteConfig.name}</p>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            Producto digital, sistemas interactivos y prototipos técnicos.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">Explorar</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 md:grid md:gap-1.5">
            {footerNavigation.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">Contacto</p>
          <a href={`mailto:${siteConfig.email}`} className="block text-sm text-foreground transition-colors hover:text-[hsl(var(--primary))]">
            {siteConfig.email}
          </a>
          <a href={siteConfig.github} target="_blank" rel="noopener noreferrer" className="block text-sm text-muted-foreground transition-colors hover:text-foreground">
            GitHub
          </a>
          <a href={siteConfig.linkedin} target="_blank" rel="noopener noreferrer" className="block text-sm text-muted-foreground transition-colors hover:text-foreground">
            LinkedIn
          </a>
        </div>
      </div>

      <div className="page-container mt-5 flex flex-col gap-1.5 border-t border-border/70 pt-3 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
         <p>&copy; {currentYear} {siteConfig.name}</p>
         <p>{siteConfig.role}</p>
      </div>
    </footer>
  );
}
