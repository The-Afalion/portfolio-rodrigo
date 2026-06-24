"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { footerNavigation, siteConfig } from "@/config/site";

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const isIndex = pathname === "/";

  return (
    <footer className={`border-t py-6 ${isIndex ? "border-border/80" : "border-[#d6c4a5] bg-[#fcfaf4] font-serif"}`}>
      <div className="page-container grid gap-5 md:grid-cols-[1.25fr,0.8fr,0.8fr] md:items-start">
        <div className="space-y-2">
          <p className={`text-xl font-semibold tracking-tight ${isIndex ? "font-display text-foreground" : "font-serif text-[#3e3024]"}`}>{siteConfig.name}</p>
          <p className={`max-w-sm text-sm leading-6 ${isIndex ? "text-muted-foreground" : "text-[#8a765f]"}`}>
            Producto digital, sistemas interactivos y prototipos técnicos.
          </p>
        </div>

        <div className="space-y-2">
          <p className={`text-[11px] font-semibold uppercase tracking-[0.26em] ${isIndex ? "text-muted-foreground" : "text-[#b5a38a]"}`}>Explorar</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 md:grid md:gap-1.5">
            {footerNavigation.map((link) => (
              <Link key={link.href} href={link.href} className={`text-sm ${isIndex ? "text-muted-foreground hover:text-foreground" : "text-[#5c4033] hover:text-[#8c4030]"}`}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className={`text-[11px] font-semibold uppercase tracking-[0.26em] ${isIndex ? "text-muted-foreground" : "text-[#b5a38a]"}`}>Contacto</p>
          <a href={`mailto:${siteConfig.email}`} className={`block text-sm ${isIndex ? "text-foreground hover:text-muted-foreground" : "text-[#3e3024] hover:text-[#8c4030]"}`}>
            {siteConfig.email}
          </a>
          <a href={siteConfig.github} target="_blank" rel="noopener noreferrer" className={`block text-sm ${isIndex ? "text-muted-foreground hover:text-foreground" : "text-[#5c4033] hover:text-[#8c4030]"}`}>
            GitHub
          </a>
          <a href={siteConfig.linkedin} target="_blank" rel="noopener noreferrer" className={`block text-sm ${isIndex ? "text-muted-foreground hover:text-foreground" : "text-[#5c4033] hover:text-[#8c4030]"}`}>
            LinkedIn
          </a>
        </div>
      </div>

      <div className={`page-container mt-5 flex flex-col gap-1.5 border-t pt-3 text-[11px] sm:flex-row sm:items-center sm:justify-between ${isIndex ? "border-border/80 text-muted-foreground" : "border-[#d6c4a5]/40 text-[#8a765f]"}`}>
         <p>&copy; {currentYear} {siteConfig.name}</p>
         <p>{siteConfig.role}</p>
      </div>
    </footer>
  );
}
