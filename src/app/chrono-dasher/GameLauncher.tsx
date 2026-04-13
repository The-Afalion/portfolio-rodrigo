"use client";

import dynamic from "next/dynamic";
import { startTransition, useState } from "react";
import { ArrowRight, Gauge, Loader2, MoveRight, Shield } from "lucide-react";

const Game = dynamic(() => import("./Game"), {
  ssr: false,
  loading: () => (
    <div className="interactive-frame flex min-h-[520px] items-center justify-center text-sm text-muted-foreground">
      Cargando simulación de vuelo...
    </div>
  ),
});

const launchDetails = [
  { label: "Control lateral", value: "Flechas izquierda y derecha" },
  { label: "Inicio", value: "Arranque instantáneo al activar" },
  { label: "Carga", value: "Motor diferido con precarga suave" },
];

function preloadGame() {
  void import("./Game");
}

export default function GameLauncher() {
  const [isActive, setIsActive] = useState(false);

  if (isActive) {
    return <Game />;
  }

  return (
    <section className="relative isolate flex min-h-[640px] overflow-hidden rounded-[2rem] border border-border/70 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(251,191,36,0.14),transparent_26%),linear-gradient(145deg,#09090b,#111827_54%,#1f2937)] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-[0.08]" />
      <div className="absolute left-8 top-10 h-32 w-32 rounded-full bg-orange-400/20 blur-3xl" />
      <div className="absolute bottom-6 right-8 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative grid w-full gap-8 p-6 md:p-8 lg:grid-cols-[0.92fr_1.08fr] lg:p-10">
        <div className="flex flex-col justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-200/70">
              Launch Bay
            </p>
            <h2 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Activa el runner solo cuando quieras entrar en velocidad.
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300 md:text-base">
              La ruta carga casi al instante y el juego queda esperando fuera del primer render. Cuando pulses, se abre
              la simulación con el motor ya preparado para entrar limpio y rápido.
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <button
              type="button"
              onMouseEnter={preloadGame}
              onPointerEnter={preloadGame}
              onFocus={preloadGame}
              onTouchStart={preloadGame}
              onClick={() => {
                startTransition(() => {
                  setIsActive(true);
                });
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5"
            >
              Iniciar simulación
              <ArrowRight size={16} />
            </button>

            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.22em] text-slate-400">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <Loader2 size={14} />
                Precarga suave
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <Gauge size={14} />
                Motor diferido
              </span>
            </div>
          </div>
        </div>

        <div className="relative flex items-center">
          <div className="w-full rounded-[2rem] border border-white/10 bg-black/30 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.34)] backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Cockpit Preview</p>
                <p className="mt-2 text-lg font-semibold text-white">Cabina lista para arrancar</p>
              </div>
              <div className="rounded-full border border-orange-300/20 bg-orange-400/10 px-3 py-1 text-xs font-medium text-orange-100">
                Baja latencia
              </div>
            </div>

            <div className="grid gap-6 pt-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.96),rgba(15,23,42,0.92))] p-5">
                <div className="absolute inset-x-6 top-7 h-px bg-orange-300/20" />
                <div className="absolute inset-x-10 bottom-10 h-px bg-cyan-300/20" />
                <div className="absolute left-6 top-1/2 h-24 w-px -translate-y-1/2 bg-white/10" />
                <div className="absolute right-6 top-1/2 h-24 w-px -translate-y-1/2 bg-white/10" />

                <div className="relative flex min-h-[290px] items-center justify-center">
                  <div className="absolute inset-x-8 bottom-14 h-24 rounded-[50%] border border-cyan-300/20 blur-sm" />
                  <div className="absolute inset-x-12 bottom-16 h-px bg-cyan-300/25" />
                  <div className="absolute inset-x-16 bottom-24 h-px bg-orange-300/30" />
                  <div className="absolute top-10 h-28 w-28 rounded-full border border-orange-300/20" />
                  <div className="absolute top-16 h-16 w-16 rounded-full border border-white/10" />
                  <div className="relative h-28 w-24">
                    <div className="absolute inset-x-5 top-0 h-16 rounded-t-[1.6rem] border border-orange-300/25 bg-orange-400/20" />
                    <div className="absolute inset-x-0 bottom-0 h-20 rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.05))]" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between">
                <div className="space-y-3">
                  {launchDetails.map((item) => (
                    <div key={item.label} className="border-b border-white/10 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{item.label}</p>
                      <p className="mt-2 text-sm font-medium text-white">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-3">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-3">
                      <MoveRight size={16} className="text-orange-200" />
                      <div>
                        <p className="text-sm font-medium text-white">Ritmo claro</p>
                        <p className="mt-1 text-sm text-slate-300">La ruta entra ligera y la acción se carga justo al empezar.</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-3">
                      <Shield size={16} className="text-cyan-200" />
                      <div>
                        <p className="text-sm font-medium text-white">Experiencia protegida</p>
                        <p className="mt-1 text-sm text-slate-300">Mantenemos la parte pesada fuera del primer render sin perder la demo completa.</p>
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
