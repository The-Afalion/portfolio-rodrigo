"use client";
import { Github, Linkedin, Mail } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";

const enlacesSociales = [
  {
    icono: <Github size={20} />,
    enlace: "https://github.com/The-Afalion",
    etiqueta: "GitHub",
  },
  {
    icono: <Linkedin size={20} />,
    enlace: "https://www.linkedin.com/in/rodrigo-alonso-f/",
    etiqueta: "LinkedIn",
  },
  {
    icono: <Mail size={20} />,
    enlace: "mailto:rodrigo@rodocodes.dev",
    etiqueta: "Correo",
  },
];

export default function PieDePagina() {
  const anoActual = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border px-4 md:px-10 py-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-sm text-muted-foreground">
          &copy; {anoActual} Rodrigo Alonso. Todos los derechos reservados.
        </p>
        <div className="flex items-center gap-4">
          {enlacesSociales.map((enlace) => (
            <Link
              key={enlace.etiqueta}
              href={enlace.enlace}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={enlace.etiqueta}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {enlace.icono}
            </Link>
          ))}
        </div>
      </div>
      {/* La curiosidad es una virtud. Prueba con los clásicos. */}
    </footer>
  );
}
