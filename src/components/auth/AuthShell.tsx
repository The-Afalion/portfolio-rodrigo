import type { ReactNode } from "react";
import { CheckCircle2, Shield, Sparkles, Zap } from "lucide-react";
import type { AuthAudience } from "@/lib/auth";

const audienceCopy: Record<
  AuthAudience,
  {
    eyebrow: string;
    title: string;
    description: string;
    asideTitle: string;
    asideBody: string;
    accentClass: string;
    glowClass: string;
    bullets: string[];
  }
> = {
  general: {
    eyebrow: "Cuenta global",
    title: "Un acceso limpio para todo tu ecosistema digital.",
    description: "La misma cuenta sirve para blog, chess y cualquier nueva zona privada sin fricción ni duplicidades.",
    asideTitle: "Acceso unificado",
    asideBody: "Una sola identidad, una sola sesión y una experiencia consistente en todo el portfolio.",
    accentClass: "text-sky-100",
    glowClass: "from-sky-300/20 via-cyan-300/12 to-transparent",
    bullets: [
      "Inicio de sesión y registro desde la misma interfaz.",
      "Recuperación de contraseña sin romper el flujo.",
      "Diseño consistente para entrar desde cualquier área.",
    ],
  },
  editor: {
    eyebrow: "Editorial",
    title: "Entrada reservada para gestión y publicación.",
    description: "El acceso editorial mantiene la misma cuenta base, pero deja claros los permisos y el contexto profesional.",
    asideTitle: "Permisos controlados",
    asideBody: "La autenticación es común, pero el panel editorial sigue protegido por roles y validaciones específicas.",
    accentClass: "text-violet-100",
    glowClass: "from-violet-300/20 via-fuchsia-300/12 to-transparent",
    bullets: [
      "Acceso enfocado en seguridad y permisos.",
      "Jerarquía visual más sobria y operativa.",
      "Flujos de recuperación alineados con el panel.",
    ],
  },
  chess: {
    eyebrow: "Chess Club",
    title: "Entra al club con una identidad única y bien presentada.",
    description: "Mantén tu perfil, tu progreso y tus partidas con una sola sesión, sin perder el contexto del juego.",
    asideTitle: "Perfil conectado",
    asideBody: "Tu usuario de chess comparte identidad con el resto del portfolio para que el progreso y el acceso estén sincronizados.",
    accentClass: "text-amber-100",
    glowClass: "from-amber-300/24 via-orange-300/14 to-transparent",
    bullets: [
      "Tu progreso y ELO permanecen asociados a la cuenta.",
      "Transición directa entre login, lobby y partidas.",
      "Misma base de acceso para juego, social y comunidad.",
    ],
  },
};

export function AuthShell({
  audience,
  children,
}: {
  audience: AuthAudience;
  children: ReactNode;
}) {
  const copy = audienceCopy[audience];

  return (
    <main className="min-h-screen overflow-hidden bg-[#060b12] px-4 pb-16 pt-24 text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className={`absolute left-[-8%] top-[-6%] h-[26rem] w-[26rem] rounded-full bg-gradient-to-br ${copy.glowClass} blur-3xl`} />
        <div className="absolute bottom-[-10%] right-[-6%] h-[28rem] w-[28rem] rounded-full bg-sky-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="grid min-h-[calc(100vh-8rem)] items-center gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <section className="overflow-hidden rounded-[2.25rem] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur sm:p-8">
            <div className="max-w-3xl">
              <p className={`text-xs font-semibold uppercase tracking-[0.34em] ${copy.accentClass}`}>{copy.eyebrow}</p>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{copy.title}</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{copy.description}</p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-[#0b111b]/90 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                    <Shield size={18} className={copy.accentClass} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{copy.asideTitle}</p>
                    <p className="text-sm text-slate-300">{copy.asideBody}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-[#0b111b]/90 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                    <Zap size={18} className="text-sky-100" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Flujo optimizado</p>
                    <p className="text-sm text-slate-300">Menos ruido visual, mejor orientación y acciones mucho más claras.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {copy.bullets.map((bullet, index) => {
                const Icon = index === 0 ? Sparkles : index === 1 ? CheckCircle2 : Shield;

                return (
                  <div key={bullet} className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                      <Icon size={16} className={index === 2 ? copy.accentClass : "text-white"} />
                    </div>
                    <p className="mt-4 text-sm leading-7 text-slate-300">{bullet}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="w-full">{children}</section>
        </div>
      </div>
    </main>
  );
}
