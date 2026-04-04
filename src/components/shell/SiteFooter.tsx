"use client";

import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react";
import { footerNavigation, siteConfig, socialLinks } from "@/config/site";

const iconMap = {
  GitHub: Github,
  LinkedIn: Linkedin,
  Email: Mail,
} as const;

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/85 bg-background px-4 py-14 md:px-10">
      <div className="mx-auto grid max-w-[1360px] gap-10 lg:grid-cols-[1.25fr,0.9fr,0.9fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1.1rem] border border-border/85 bg-card font-mono text-[11px] font-semibold tracking-[0.28em] text-foreground">
              RA
            </div>
            <div>
              <p className="font-display text-xl font-semibold tracking-tight text-foreground">{siteConfig.name}</p>
              <p className="text-[11px] uppercase tracking-[0.26em] text-muted-foreground">{siteConfig.role}</p>
            </div>
          </div>
          <p className="max-w-md text-sm leading-7 text-muted-foreground">
            Producto digital, sistemas interactivos y prototipos técnicos con una dirección visual sobria y clara.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">Explorar</p>
          <div className="flex flex-col gap-2">
            {footerNavigation.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">Conectar</p>
          <a href={`mailto:${siteConfig.email}`} className="block text-sm text-foreground hover:text-muted-foreground">
            {siteConfig.email}
          </a>
          <div className="flex items-center gap-4 pt-1">
            {socialLinks.map((link) => {
              const Icon = iconMap[link.label as keyof typeof iconMap];

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.rel}
                  aria-label={link.label}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Icon size={20} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-[1360px] flex-col gap-2 border-t border-border/80 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {currentYear} {siteConfig.name}</p>
        <p>{siteConfig.role}</p>
      </div>
    </footer>
  );
}
