import { Github, ExternalLink } from "lucide-react";

type Proyecto = {
  titulo: string;
  descripcionLarga: string[];
  etiquetas: string[];
  enlace: string;
  github: string;
  icono: React.ElementType;
};

export default function DetalleProyecto({ proyecto }: { proyecto: Proyecto }) {
  const { titulo, descripcionLarga, etiquetas, enlace, github, icono: Icono } = proyecto;

  return (
    <div className="p-8 md:p-12">
      <div className="flex items-center gap-4 mb-8">
        <Icono size={40} className="text-blue-500" />
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter">{titulo}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-4 text-lg text-muted-foreground">
          {descripcionLarga.map((parrafo, i) => (
            <p key={i}>{parrafo}</p>
          ))}
        </div>
        <aside className="space-y-8">
          <div>
            <h3 className="text-xl font-bold mb-3">Tecnologías</h3>
            <div className="flex flex-wrap gap-2">
              {etiquetas.map((tag) => (
                <span key={tag} className="px-3 py-1 text-xs font-mono rounded-full bg-background text-muted-foreground border border-border">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-3">Enlaces</h3>
            <div className="flex flex-col gap-3">
              {github !== "#" && (
                <a href={github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                  <Github size={20} />
                  <span>Código Fuente</span>
                </a>
              )}
              {enlace !== "#" && (
                <a href={enlace} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                  <ExternalLink size={20} />
                  <span>Ver Demo</span>
                </a>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
