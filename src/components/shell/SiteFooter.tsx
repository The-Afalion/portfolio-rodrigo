"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { footerNavigation, siteConfig } from "@/config/site";

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const isIndex = pathname === "/";

  return (
    <footer className={`border-t py-14 ${isIndex ? "border-border/80" : "border-[#d6c4a5] bg-[#fcfaf4] font-serif"}`}>
      <div className="page-container grid gap-10 lg:grid-cols-[1fr,0.8fr,0.8fr]">
        <div className="space-y-3">
          <p className={`text-2xl font-semibold tracking-tight ${isIndex ? "font-display text-foreground" : "font-serif text-[#3e3024]"}`}>{siteConfig.name}</p>
          <p className={`max-w-md text-sm leading-7 ${isIndex ? "text-muted-foreground" : "text-[#8a765f]"}`}>
            Producto digital, sistemas interactivos y prototipos técnicos.
          </p>
        </div>

        <div className="space-y-3">
          <p className={`text-[11px] font-semibold uppercase tracking-[0.26em] ${isIndex ? "text-muted-foreground" : "text-[#b5a38a]"}`}>Explorar</p>
          <div className="grid gap-2">
            {footerNavigation.map((link) => (
              <Link key={link.href} href={link.href} className={`text-sm ${isIndex ? "text-muted-foreground hover:text-foreground" : "text-[#5c4033] hover:text-[#8c4030]"}`}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-3">
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

      <div className={`page-container mt-10 flex flex-col gap-2 border-t pt-6 text-sm sm:flex-row sm:items-center sm:justify-between ${isIndex ? "border-border/80 text-muted-foreground" : "border-[#d6c4a5]/40 text-[#8a765f]"}`}>
         <p>&copy; {currentYear} {siteConfig.name}</p>
         <p>{siteConfig.role}</p>
      </div>
    </footer>
  );
}
