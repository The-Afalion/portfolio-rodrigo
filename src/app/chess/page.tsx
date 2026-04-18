"use client";

import dynamic from "next/dynamic";
import {
  ArrowRight,
  Bot,
  Lock,
  LogOut,
  ShieldCheck,
  Swords,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useChess } from "@/context/ContextoChess";
import { BOTS } from "@/datos/bots";
import { buildLoginPath, buildSignupPath } from "@/lib/auth";

const ChessFriendsPanel = dynamic(() => import("./ChessFriendsPanel"), {
  ssr: false,
  loading: () => <PanelPlaceholder title="Cargando zona social" description="Preparando amigos, mensajes y retos directos." />,
});

const ChessLobby = dynamic(() => import("./ChessLobby"), {
  ssr: false,
  loading: () => <PanelPlaceholder title="Conectando lobby" description="Sincronizando rivales online e invitaciones activas." />,
});

function PanelPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-[#0b111b]/90 p-6">
      <div className="h-2.5 w-28 rounded-full bg-white/10" />
      <div className="mt-5 h-7 w-56 rounded-full bg-white/10" />
      <div className="mt-4 h-4 w-full max-w-xl rounded-full bg-white/10" />
      <div className="mt-2 h-4 w-full max-w-lg rounded-full bg-white/5" />
      <p className="mt-6 text-sm text-slate-400">{description}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="h-24 rounded-[1.25rem] border border-white/10 bg-white/[0.03]" />
        <div className="h-24 rounded-[1.25rem] border border-white/10 bg-white/[0.03]" />
      </div>
      <p className="mt-4 text-sm font-medium text-white">{title}</p>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#070b12] px-4 pb-10 pt-24 text-white">
      <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center">
        <div className="surface-panel w-full max-w-xl overflow-hidden border border-white/10 bg-white/[0.03] p-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-amber-200/20 bg-amber-300/10 text-4xl text-amber-100">
            ♞
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.32em] text-amber-200/70">
            Chess Hub
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-white">Preparando la sala</h1>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Cargando tu perfil, el lobby en tiempo real y la zona de entrenamiento.
          </p>
        </div>
      </div>
    </div>
  );
}

function AuthGate() {
  const { error } = useChess();
  const loginHref = buildLoginPath("chess", "/chess");
  const signupHref = buildSignupPath("chess", "/chess");

  return (
    <div className="min-h-screen bg-[#070b12] px-4 pb-14 pt-24 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.35)] backdrop-blur xl:grid-cols-[1.15fr_0.85fr] xl:p-8">
          <div className="rounded-[1.75rem] border border-white/10 bg-[#0b111b]/90 p-7 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-200/70">
              Chess Hub
            </p>
            <h1 className="mt-5 max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Entra al club y empieza a jugar sin perderte.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Un acceso único para jugar en vivo, organizar amistades, responder retos y entrenar contra bots con
              progresión.
            </p>

            {error ? (
              <div className="mt-6 rounded-[1.25rem] border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={loginHref}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5"
              >
                Iniciar sesión
                <ArrowRight size={16} />
              </Link>
              <Link
                href={signupHref}
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Crear cuenta
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.75rem] border border-amber-200/10 bg-[radial-gradient(circle_at_top_left,rgba(245,190,92,0.16),transparent_55%),#0b111b] p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-200/15 bg-amber-300/10 text-amber-100">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Acceso unificado</p>
                  <p className="text-sm text-slate-300">Mismo perfil para social, matchmaking y progreso.</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">En vivo</p>
                <p className="mt-3 text-lg font-semibold text-white">Lobby global</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">Reta a jugadores conectados en tiempo real.</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Privado</p>
                <p className="mt-3 text-lg font-semibold text-white">Amigos y chat</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">Mantén conversaciones y lanza retos directos.</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Práctica</p>
                <p className="mt-3 text-lg font-semibold text-white">Escalera de bots</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">Progresa de rivales básicos a maestros.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { usuario, cerrarSesion } = useChess();

  const defeatedBots = usuario?.botsDefeated ?? [];
  const unlockedBotCount = BOTS.reduce((count, bot, index) => {
    if (index === 0) {
      return count + 1;
    }

    return defeatedBots.includes(BOTS[index - 1].id) ? count + 1 : count;
  }, 0);

  const profileStats = [
    { label: "ELO actual", value: usuario?.elo ?? 0, tone: "text-white" },
    { label: "Bots vencidos", value: defeatedBots.length, tone: "text-amber-200" },
    { label: "Bots desbloqueados", value: `${unlockedBotCount}/${BOTS.length}`, tone: "text-sky-200" },
  ];

  const quickLinks = [
    {
      href: "/chess/community",
      icon: Trophy,
      eyebrow: "Modo especial",
      title: "Ajedrez comunal",
      description: "Participa en la partida colectiva diaria y decide el próximo movimiento con tu voto.",
    },
    {
      href: "/chess/invitations",
      icon: Users,
      eyebrow: "Seguimiento",
      title: "Bandeja de invitaciones",
      description: "Revisa invitaciones pendientes y entra rápido en tus partidas activas.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b12] text-white">
      <div className="relative px-4 pb-16 pt-24">
        <div className="mx-auto max-w-6xl">
          <header className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] border border-amber-200/20 bg-amber-300/10 text-amber-100">
                ♞
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-200/70">Chess Hub</p>
                <h1 className="mt-1 text-2xl font-semibold text-white">Club de Maestros</h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5">
                <p className="text-sm font-semibold text-white">{usuario?.username}</p>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Perfil activo</p>
              </div>
              <button
                onClick={cerrarSesion}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.09]"
                title="Cerrar sesión"
              >
                <LogOut size={16} />
                Salir
              </button>
            </div>
          </header>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="surface-panel overflow-hidden p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-amber-200/70">Panel principal</p>
              <h2 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Jugar rápido, seguir tu progreso y volver al tablero sin ruido.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Elige si quieres retar a alguien online, organizar una partida con amigos o seguir subiendo contra bots.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {profileStats.map((stat) => (
                  <div key={stat.label} className="rounded-[1.5rem] border border-white/10 bg-[#0b111b]/70 p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{stat.label}</p>
                    <p className={`mt-3 text-3xl font-semibold ${stat.tone}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              {quickLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="surface-panel group block p-6 hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                          {item.eyebrow}
                        </p>
                        <h3 className="mt-4 text-2xl font-semibold text-white">{item.title}</h3>
                        <p className="mt-3 max-w-md text-sm leading-7 text-slate-300">{item.description}</p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-amber-100 transition-colors group-hover:bg-amber-300/10">
                        <Icon size={18} />
                      </div>
                    </div>
                    <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-amber-200">
                      Abrir
                      <ArrowRight size={16} />
                    </div>
                  </Link>
                );
              })}

              <div className="surface-panel p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Sugerencia rápida</p>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Si no ves a nadie conectado, abre el lobby un momento y pasa después a la sala de bots. Todo el
                  progreso se conserva.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="surface-panel p-5 sm:p-6">
              <ChessLobby compact />
            </div>

            <div className="grid gap-6">
              <div className="surface-panel p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/70">Jugar en comunidad</p>
                <h3 className="mt-4 text-2xl font-semibold text-white">Una partida cooperativa, un movimiento al día.</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Vota la jugada del equipo, sigue la evolución del tablero y compite por tomar la decisión más fuerte.
                </p>
                <Link
                  href="/chess/community"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5"
                >
                  Entrar al modo comunal
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="surface-panel p-6">
                <p className="text-sm font-semibold text-white">Entrenamiento inteligente</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  La progresión de bots te guía de lo básico a la precisión técnica sin llenar la pantalla de paneles
                  extra.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-6">
            <ChessFriendsPanel compact />
          </section>

          <section className="surface-panel mt-6 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Bots</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">Sala de entrenamiento</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                  Elige rival según dificultad. Cada victoria desbloquea el siguiente oponente y deja claro cuál es tu
                  próximo reto.
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300">
                {defeatedBots.length} de {BOTS.length} superados
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {BOTS.map((bot, index) => {
                const unlocked = index === 0 || defeatedBots.includes(BOTS[index - 1].id);
                const defeated = defeatedBots.includes(bot.id);

                return (
                  <article
                    key={bot.id}
                    className={`relative overflow-hidden rounded-[1.75rem] border p-5 transition-transform ${
                      unlocked
                        ? "border-white/10 bg-[#0b111b]/90 hover:-translate-y-1"
                        : "border-white/8 bg-white/[0.02] opacity-75"
                    }`}
                  >
                    {!unlocked ? (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#070b12]/70 backdrop-blur-[3px]">
                        <Lock size={22} className="text-amber-200" />
                        <span className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-100">Bloqueado</span>
                      </div>
                    ) : null}

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-white/10 bg-white/[0.04] text-3xl">
                        {bot.avatar}
                      </div>
                      {defeated ? (
                        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/15 bg-amber-300/10 px-3 py-1 text-xs font-medium text-amber-100">
                          <Trophy size={14} />
                          Superado
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-2xl font-semibold text-white">{bot.nombre}</h3>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-slate-300">
                          {bot.titulo}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-300">{bot.descripcion}</p>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-[auto_1fr] sm:items-end">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Dificultad</p>
                        <p className="mt-2 text-lg font-semibold text-white">{bot.elo} ELO</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Estilo</p>
                        <p className="mt-2 text-sm font-medium text-slate-200">{bot.personalidad.etiqueta}</p>
                      </div>
                    </div>

                    {unlocked ? (
                      <Link
                        href={`/chess/play/${bot.id}`}
                        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
                      >
                        <Swords size={16} />
                        Jugar contra {bot.nombre}
                      </Link>
                    ) : (
                      <div className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-slate-500">
                        Desbloquea el rival anterior
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function ChessPage() {
  const { usuario, estaInicializando } = useChess();

  if (estaInicializando) {
    return <LoadingScreen />;
  }

  if (!usuario) {
    return <AuthGate />;
  }

  return <Dashboard />;
}
