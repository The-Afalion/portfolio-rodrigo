"use client";

import dynamic from "next/dynamic";
import { startTransition, useState } from "react";
import { ArrowRight, Cuboid, Loader2, MousePointerClick, ScanLine } from "lucide-react";

const ModelGallery = dynamic(() => import("@/components/ModelGallery"), {
  ssr: false,
  loading: () => (
    <div className="interactive-frame flex h-[640px] items-center justify-center p-4 text-sm text-muted-foreground">
      Cargando galería 3D...
    </div>
  ),
});

const previewLabels = [
  "Rotación libre",
  "Lectura limpia",
  "Carga bajo demanda",
];

function preloadGallery() {
  void import("@/components/ModelGallery");
}

export default function ModelGalleryLauncher() {
  const [isActive, setIsActive] = useState(false);

  if (isActive) {
    return <ModelGallery />;
  }

  return (
    <section className="relative isolate flex h-[640px] overflow-hidden rounded-[2rem] border border-border/70 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.16),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.94),rgba(248,250,252,0.88))]">
      <div className="absolute inset-y-0 left-[54%] hidden w-px bg-border/60 lg:block" />
      <div className="absolute left-8 top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
      <div className="absolute bottom-6 right-10 h-28 w-28 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="relative grid w-full gap-8 p-6 md:p-8 lg:grid-cols-[0.94fr_1.06fr] lg:p-10">
        <div className="flex flex-col justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Viewer Ready
            </p>
            <h2 className="mt-5 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Abre la galería solo cuando quieras inspeccionar la pieza.
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground md:text-base">
              La escena tridimensional queda fuera del arranque para que esta página entre rápida y limpia. Cuando la
              actives, tendrás el visor completo con control directo y lectura espacial estable.
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <button
              type="button"
              onMouseEnter={preloadGallery}
              onPointerEnter={preloadGallery}
              onFocus={preloadGallery}
              onTouchStart={preloadGallery}
              onClick={() => {
                startTransition(() => {
                  setIsActive(true);
                });
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-transform hover:-translate-y-0.5"
            >
              Abrir galería interactiva
              <ArrowRight size={16} />
            </button>

            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-2">
                <Loader2 size={14} />
                Precarga suave
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-2">
                <Cuboid size={14} />
                Visor 3D
              </span>
            </div>
          </div>
        </div>

        <div className="relative flex min-h-[300px] items-center justify-center">
          <div className="relative w-full max-w-[34rem]">
            <div className="absolute inset-0 rounded-[2rem] bg-foreground/[0.03] blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-background/85 p-5 shadow-[0_30px_90px_rgba(15,23,42,0.10)] backdrop-blur">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Gallery Preview
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">Composición lista para explorar</p>
                </div>
                <div className="rounded-full border border-border/70 bg-secondary/70 px-3 py-1 text-xs font-medium text-muted-foreground">
                  3 modelos listos
                </div>
              </div>

              <div className="grid gap-6 pt-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="relative flex min-h-[290px] items-center justify-center overflow-hidden rounded-[1.75rem] border border-border/70 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_40%),linear-gradient(180deg,#f8fafc,#eef2ff)]">
                  <div className="absolute h-56 w-56 rounded-full border border-primary/15" />
                  <div className="absolute h-40 w-40 rounded-full border border-primary/20" />
                  <div className="absolute h-24 w-24 rounded-full border border-primary/25" />
                  <div className="absolute inset-x-10 bottom-8 h-px bg-border/80" />
                  <div className="absolute inset-y-10 left-1/2 w-px -translate-x-1/2 bg-border/40" />
                  <div className="relative">
                    <div className="h-32 w-32 rotate-12 rounded-[2rem] border border-primary/20 bg-white/85 shadow-[0_24px_40px_rgba(15,23,42,0.12)]" />
                    <div className="absolute inset-[18%] rounded-[1.35rem] border border-primary/15 bg-[linear-gradient(135deg,rgba(59,130,246,0.20),rgba(251,191,36,0.18))]" />
                  </div>
                </div>

                <div className="flex flex-col justify-between">
                  <div className="space-y-3">
                    {previewLabels.map((label) => (
                      <div
                        key={label}
                        className="flex items-center justify-between border-b border-border/60 py-3 text-sm"
                      >
                        <span className="font-medium text-foreground">{label}</span>
                        <span className="text-muted-foreground">Activo</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-3">
                    <div className="rounded-[1.5rem] border border-border/70 bg-secondary/60 p-4">
                      <div className="flex items-center gap-3">
                        <MousePointerClick size={16} className="text-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Inspección directa</p>
                          <p className="mt-1 text-sm text-muted-foreground">Arrastra, rota y acerca sin cargar la escena antes de tiempo.</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-[1.5rem] border border-border/70 bg-secondary/60 p-4">
                      <div className="flex items-center gap-3">
                        <ScanLine size={16} className="text-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Entrada más limpia</p>
                          <p className="mt-1 text-sm text-muted-foreground">El lienzo 3D solo aparece cuando el usuario ya ha decidido explorar.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
