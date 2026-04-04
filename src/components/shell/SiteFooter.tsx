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
    <footer className="border-t border-border bg-background px-4 py-10 md:px-10">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.3fr,1fr,1fr]">
        <div className="space-y-3">
          <p className="font-display text-2xl font-bold tracking-tight text-foreground">{siteConfig.name}</p>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Ingeniería de software, laboratorios interactivos y experiencias digitales construidas con una base más modular y mantenible.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">Explorar</p>
          <div className="flex flex-col gap-2">
            {footerNavigation.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">Conectar</p>
          <div className="flex items-center gap-4">
            {socialLinks.map((link) => {
              const Icon = iconMap[link.label as keyof typeof iconMap];

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.rel}
                  aria-label={link.label}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Icon size={20} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-2 border-t border-border/70 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {currentYear} {siteConfig.name}. Todos los derechos reservados.</p>
        <p>{siteConfig.role}</p>
      </div>
    </footer>
  );
}
