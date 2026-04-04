"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Lock, LogOut, ShieldCheck, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useChess } from '@/context/ContextoChess';
import { BOTS } from '@/datos/bots';
import { buildForgotPasswordPath, buildLoginPath, buildSignupPath } from '@/lib/auth';

function LoadingScreen() {
  return (
    <div className="page-shell flex min-h-screen items-center justify-center overflow-hidden px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="surface-panel w-full max-w-lg p-8 text-center"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-border/80 bg-background text-5xl text-primary shadow-sm">
          ♞
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Preparando tu mesa de juego</h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          Estamos comprobando tu sesión global para recuperar tu perfil, tu ELO y el acceso al lobby.
        </p>
      </motion.div>
    </div>
  );
}

function AuthGate() {
  const { error } = useChess();
  const loginHref = buildLoginPath('chess', '/chess');
  const signupHref = buildSignupPath('chess', '/chess');
  const forgotPasswordHref = buildForgotPasswordPath('chess', '/chess');

  return (
    <div className="page-shell flex min-h-screen items-center justify-center overflow-hidden px-4">
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-16 top-24 select-none text-8xl opacity-[0.06]"
      >
        ♔
      </motion.div>
      <motion.div
        animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-20 right-16 select-none text-8xl opacity-[0.06]"
      >
        ♘
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-panel relative z-10 w-full max-w-3xl overflow-hidden p-8 md:p-10"
      >
        <div className="absolute inset-y-0 right-0 hidden w-[38%] border-l border-border/70 bg-gradient-to-b from-cyan-200/10 via-transparent to-amber-200/10 md:block" />

        <div className="relative grid gap-8 md:grid-cols-[1.15fr_0.85fr] md:items-center">
          <div>
            <div className="mb-8 flex justify-center md:justify-start">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border/80 bg-background text-5xl text-primary shadow-sm">
                ♟
              </div>
            </div>

            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Chess Club</p>
            <h1 className="text-center text-3xl font-semibold tracking-tight md:text-left md:text-4xl">
              El acceso de ajedrez ahora es una cuenta global
            </h1>
            <p className="mt-4 text-center text-sm leading-7 text-muted-foreground md:text-left">
              Usa una sola identidad para chess, blog y futuras zonas privadas. Tu perfil se sincroniza y el progreso
              queda unido a la misma cuenta.
            </p>

            {error ? (
              <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
                {error}
              </div>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={loginHref}
                className="flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                <span>Iniciar sesión</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href={signupHref}
                className="rounded-full border border-border/80 bg-background/75 px-6 py-3 text-center text-sm font-medium text-foreground transition-colors hover:bg-secondary/60"
              >
                Crear cuenta
              </Link>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              <Link href={forgotPasswordHref} className="font-medium text-foreground underline underline-offset-4">
                He olvidado mi contraseña
              </Link>
            </p>
          </div>

          <div className="surface-panel-muted relative rounded-[28px] p-6 md:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/80 bg-background">
                <ShieldCheck size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Cuenta compartida</p>
                <p className="text-xs text-muted-foreground">Mismo usuario en todo el ecosistema.</p>
              </div>
            </div>

            <div className="space-y-4 text-sm leading-7 text-muted-foreground">
              <p>
                Entra con tu correo y contraseña para conservar tu ELO, el acceso al lobby y la evolución futura de tu perfil.
              </p>
              <p>
                No necesitas otra cuenta distinta para el blog o nuevas áreas. Todo queda centralizado bajo una sola sesión.
              </p>
            </div>

            <div className="mt-6 space-y-3 rounded-3xl border border-border/70 bg-background/70 p-5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Inicio unificado</span>
                <span className="font-medium text-foreground">Activo</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Perfil sincronizado</span>
                <span className="font-medium text-foreground">Supabase + Prisma</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Recuperación de contraseña</span>
                <span className="font-medium text-foreground">Disponible</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Dashboard() {
  const { usuario, cerrarSesion } = useChess();

  const isBotUnlocked = (index: number) => {
    if (index === 0) return true;
    const previousBotId = BOTS[index - 1].id;
    return usuario?.botsDefeated.includes(previousBotId);
  };

  return (
    <div className="page-shell min-h-screen font-sans">
      <header className="sticky top-24 z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="surface-panel-muted flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/80 bg-background text-2xl text-primary">
              ♞
            </div>
            <span className="font-display text-xl font-semibold">Chess Club</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden flex-col items-end md:flex">
              <span className="text-sm font-semibold text-foreground">{usuario?.username}</span>
              <span className="rounded-full border border-border/80 bg-background/75 px-3 py-1 text-xs text-muted-foreground">ELO {usuario?.elo}</span>
            </div>
            <button
              onClick={cerrarSesion}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-background/75 text-muted-foreground transition-colors hover:text-foreground"
              title="Cerrar Sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-16 text-center">
          <h2 className="mb-6 text-4xl font-semibold md:text-5xl">La Arena</h2>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Enfréntate a nuestras IAs personalizadas. Cada victoria te acerca más al título de Gran Maestro.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {BOTS.map((bot, index) => {
            const unlocked = isBotUnlocked(index);
            const vencido = usuario?.botsDefeated.includes(bot.id);

            return (
              <motion.div
                key={bot.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`surface-panel relative group flex flex-col overflow-hidden transition-all duration-300 ${unlocked
                    ? 'hover:-translate-y-1 hover:border-primary/25'
                    : 'opacity-60 grayscale'
                  }`}
              >
                {!unlocked && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/86 text-muted-foreground backdrop-blur-sm">
                    <Lock size={48} className="mb-4" />
                    <span className="text-sm font-bold uppercase tracking-widest">Nivel Bloqueado</span>
                    <p className="mt-2 text-xs">Requiere vencer a {BOTS[index - 1].nombre}</p>
                  </div>
                )}

                {vencido && (
                  <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full border border-amber-300/40 bg-amber-200/90 px-3 py-1 text-xs font-semibold text-amber-950">
                    <Trophy size={12} /> VENCIDO
                  </div>
                )}

                <div className="relative flex flex-grow flex-col items-center p-8 text-center">
                  <div className="absolute inset-0 bg-gradient-to-b from-accent/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>

                  <div className={`relative z-10 mb-6 flex h-24 w-24 items-center justify-center rounded-full border bg-background text-5xl shadow-sm ${unlocked ? 'border-border/80' : 'border-border/60'}`}>
                    {bot.avatar}
                  </div>

                  <h3 className="relative z-10 mb-1 text-2xl font-semibold">{bot.nombre}</h3>
                  <div className="relative z-10 mb-4 flex items-center gap-2">
                    <span className="rounded-full border border-border/80 bg-background/75 px-3 py-1 text-xs font-medium text-muted-foreground">
                      {bot.titulo}
                    </span>
                    <span className="text-xs text-muted-foreground">ELO {bot.elo}</span>
                  </div>

                  <p className="relative z-10 mb-6 text-sm leading-relaxed text-muted-foreground">
                    {bot.descripcion}
                  </p>
                </div>

                <div className="surface-divider relative z-10 mt-auto p-4">
                  <Link
                    href={unlocked ? `/chess/play/${bot.id}` : '#'}
                    className={`block w-full rounded-full py-3 text-center text-sm font-medium transition-all ${unlocked
                        ? 'bg-foreground text-background hover:opacity-90'
                        : 'cursor-not-allowed bg-background/70 text-muted-foreground'
                      }`}
                  >
                    {unlocked ? 'Jugar Partida' : 'Bloqueado'}
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default function ChessPage() {
  const { usuario, estaInicializando } = useChess();

  return (
    <AnimatePresence mode="wait">
      {estaInicializando ? (
        <motion.div key="loading" exit={{ opacity: 0 }}>
          <LoadingScreen />
        </motion.div>
      ) : !usuario ? (
        <motion.div key="login" exit={{ opacity: 0 }}>
          <AuthGate />
        </motion.div>
      ) : (
        <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Dashboard />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
