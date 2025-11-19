"use client";
import { Github, Linkedin, Mail } from "lucide-react";
import Link from "next/link";

const socialLinks = [
  {
    icon: <Github size={20} />,
    href: "https://github.com/The-Afalion",
    label: "GitHub",
  },
  {
    icon: <Linkedin size={20} />,
    href: "https://www.linkedin.com/in/rodrigo-alonso-f/",
    label: "LinkedIn",
  },
  {
    icon: <Mail size={20} />,
    href: "mailto:rodrigo@rodocodes.dev",
    label: "Email",
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border px-4 md:px-10 py-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-sm text-muted-foreground">
          &copy; {currentYear} Rodrigo Alonso. Todos los derechos reservados.
        </p>
        <div className="flex items-center gap-4">
          {socialLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.icon}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
