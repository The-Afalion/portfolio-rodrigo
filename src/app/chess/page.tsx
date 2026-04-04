"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChess } from '@/context/ContextoChess';
import { BOTS } from '@/datos/bots';
import { Lock, LogOut, Trophy } from 'lucide-react';
import Link from 'next/link';

// --- Componente de Login Temático ---
function LoginScreen() {
  const { iniciarSesion, registrarse, error, cargando } = useChess();
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [modoRegistro, setModoRegistro] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nombre.trim() && password.trim()) {
      if (modoRegistro) {
        await registrarse(nombre, password);
      } else {
        await iniciarSesion(nombre, password);
      }
    }
  };

  return (
    <div className="page-shell flex min-h-screen items-center justify-center overflow-hidden">
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-24 left-16 text-8xl opacity-[0.06] select-none"
      >
        ♔
      </motion.div>
      <motion.div
        animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-20 right-16 text-8xl opacity-[0.06] select-none"
      >
        ♘
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-panel relative z-10 w-full max-w-md p-8"
      >
        <div className="flex justify-center mb-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border/80 bg-background text-5xl text-primary shadow-sm">
            ♟
          </div>
        </div>

        <h1 className="text-center text-3xl font-semibold tracking-tight">Chess Club</h1>
        <p className="mb-8 text-center text-sm text-muted-foreground">Accede a la arena con un lenguaje visual integrado en el resto del hub.</p>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-center text-sm text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 font-sans">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Usuario</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-2xl border border-border/80 bg-background/75 p-3 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40"
              placeholder="Grandmaster_01"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-border/80 bg-background/75 p-3 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-full bg-foreground py-3 font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cargando ? 'Procesando...' : (modoRegistro ? 'Crear Cuenta' : 'Entrar al Club')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setModoRegistro(!modoRegistro);
              // setError(null);
            }}
            className="text-xs text-muted-foreground underline transition-colors hover:text-foreground font-sans"
          >
            {modoRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿Nuevo aquí? Regístrate gratis'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// --- Componente del Dashboard ---
function Dashboard() {
  const { usuario, cerrarSesion } = useChess();

  const isBotUnlocked = (index: number) => {
    if (index === 0) return true;
    const previousBotId = BOTS[index - 1].id;
    return usuario?.botsDefeated.includes(previousBotId);
  };

  return (
    <div className="page-shell min-h-screen font-sans">
      {/* Header */}
      <header className="sticky top-24 z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="surface-panel-muted flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/80 bg-background text-2xl text-primary">
              ♞
            </div>
            <span className="font-display text-xl font-semibold">Chess Club</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                {/* Estado Bloqueado Overlay */}
                {!unlocked && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/86 text-muted-foreground backdrop-blur-sm">
                    <Lock size={48} className="mb-4" />
                    <span className="text-sm font-bold uppercase tracking-widest">Nivel Bloqueado</span>
                    <p className="mt-2 text-xs">Requiere vencer a {BOTS[index - 1].nombre}</p>
                  </div>
                )}

                {/* Badge de Victoria */}
                {vencido && (
                  <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full border border-amber-300/40 bg-amber-200/90 px-3 py-1 text-xs font-semibold text-amber-950">
                    <Trophy size={12} /> VENCIDO
                  </div>
                )}

                <div className="p-8 flex flex-col items-center text-center flex-grow relative">
                  {/* Fondo sutil del avatar */}
                  <div className="absolute inset-0 bg-gradient-to-b from-accent/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>

                  <div className={`relative z-10 mb-6 flex h-24 w-24 items-center justify-center rounded-full border bg-background text-5xl shadow-sm ${unlocked ? 'border-border/80' : 'border-border/60'}`}>
                    {bot.avatar}
                  </div>

                  <h3 className="relative z-10 mb-1 text-2xl font-semibold">{bot.nombre}</h3>
                  <div className="flex items-center gap-2 mb-4 relative z-10">
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
                        : 'bg-background/70 text-muted-foreground cursor-not-allowed'
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
  const { usuario } = useChess();

  return (
    <AnimatePresence mode="wait">
      {!usuario ? (
        <motion.div key="login" exit={{ opacity: 0 }}>
          <LoginScreen />
        </motion.div>
      ) : (
        <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Dashboard />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
