import Link from "next/link";
import { Github, ExternalLink, Code2 } from "lucide-react";
import type { ProyectoCore } from "@/datos/proyectos";

function isInternalLink(href: string) {
  return href.startsWith("/");
}

export default function DetalleProyecto({ proyecto }: { proyecto: ProyectoCore }) {
  const { description, tech, link, github = "#" } = proyecto;

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/80 bg-background/80 text-primary">
            <Code2 size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Resumen</p>
            <p className="mt-2 text-base leading-8 text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
      </div>

      <aside className="space-y-6">
        <div className="surface-panel-muted p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Stack</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {tech.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border/80 bg-background/75 px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="surface-panel-muted p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Accesos</p>
          <div className="mt-4 flex flex-col gap-3">
            {github !== "#" ? (
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="action-pill w-full justify-between"
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
                <Link href={link} className="action-pill w-full justify-between">
                  <span className="inline-flex items-center gap-2">
                    <ExternalLink size={16} />
                    Abrir proyecto
                  </span>
                  <ExternalLink size={14} />
                </Link>
              ) : (
                <a href={link} target="_blank" rel="noopener noreferrer" className="action-pill w-full justify-between">
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
