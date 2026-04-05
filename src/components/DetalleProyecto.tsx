import Link from "next/link";
import { Github, ExternalLink, Code2 } from "lucide-react";
import type { ProyectoCore } from "@/datos/proyectos";

function isInternalLink(href: string) {
  return href.startsWith("/");
}

export default function DetalleProyecto({ proyecto }: { proyecto: ProyectoCore }) {
  const { description, tech, link, github = "#" } = proyecto;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-8 border-t border-border/80 pt-8">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Resumen</p>
          <div className="flex items-start gap-4">
            <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-full border border-border/80 text-foreground">
              <Code2 size={18} />
            </div>
            <p className="max-w-3xl text-base leading-8 text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>

      <aside className="space-y-8 border-t border-border/80 pt-8">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Stack</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {tech.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border/80 px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Accesos</p>
          <div className="mt-4 flex flex-col gap-3">
            {github !== "#" ? (
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-between gap-3 border-b border-border/80 pb-3 text-sm text-foreground"
              >
                <span className="inline-flex items-center gap-2">
                  <Github size={16} />
                  Código fuente
                </span>
                <ExternalLink size={14} />
              </a>
            ) : null}

            {link !== "#" ? (
              isInternalLink(link) ? (
                <Link href={link} className="inline-flex items-center justify-between gap-3 border-b border-border/80 pb-3 text-sm text-foreground">
                  <span className="inline-flex items-center gap-2">
                    <ExternalLink size={16} />
                    Abrir proyecto
                  </span>
                  <ExternalLink size={14} />
                </Link>
              ) : (
                <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-between gap-3 border-b border-border/80 pb-3 text-sm text-foreground">
                  <span className="inline-flex items-center gap-2">
                    <ExternalLink size={16} />
                    Ver demo
                  </span>
                  <ExternalLink size={14} />
                </a>
              )
            ) : null}
          </div>
        </div>
      </aside>
    </div>
  );
}
