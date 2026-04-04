"use client";

import { Suspense, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Lock, Mail, Loader2, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

function getSafeNextPath(next: string | null) {
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return '/admin';
  }
  return next;
}

function BlogLoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [supabase] = useState(() => createClient());
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextPath = getSafeNextPath(searchParams.get('next'));

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!mounted) return;

      if (user) {
        router.replace(nextPath);
        router.refresh();
        return;
      }

      const errorParam = searchParams.get('error');
      if (errorParam === 'not_editor') {
        setError('Tu cuenta existe, pero no tiene permisos editoriales asignados.');
      } else if (errorParam === 'auth_callback' || errorParam === 'auth_verify') {
        setError('Enlace inválido o expirado. Por favor, intenta iniciar sesión de nuevo.');
      }

      setCheckingSession(false);
    }

    checkSession();

    return () => { mounted = false; };
  }, [nextPath, router, searchParams, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setLoading(false);
      setError('Credenciales inválidas o invitación pendiente de aceptación.');
      return;
    }

    router.replace(nextPath);
    router.refresh();
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-background">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[15%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-[var(--theme-glow-1)] blur-[100px] opacity-70" />
        <div className="absolute bottom-[10%] right-[15%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] rounded-full bg-[var(--theme-glow-2)] blur-[120px] opacity-70" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] relative z-10"
      >
         <div className="surface-panel p-8 sm:p-12 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

            <div className="text-center mb-10 relative">
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1, type: "spring", bounce: 0.4 }}
                className="mx-auto w-16 h-16 bg-surface-elevated border border-border/80 rounded-2xl flex items-center justify-center mb-6 shadow-sm relative"
              >
                <div className="absolute inset-0 rounded-2xl bg-foreground/5 blur-xl"></div>
                <ShieldCheck className="w-8 h-8 text-foreground/80 relative z-10" strokeWidth={1.5} />
              </motion.div>
              
              <h1 className="text-3xl font-display font-semibold tracking-tight text-foreground mb-3">
                Nexus de Editores
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Acceso restringido al centro de control. Verifica tu identidad para continuar.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground ml-1">
                  Identificador
                </label>
                <div className="relative group/input">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-foreground transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="editor@rodocodes.dev"
                    required
                    className="w-full bg-background/50 border border-border/80 rounded-xl py-3.5 pl-11 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/20 transition-all font-medium text-sm backdrop-blur-sm shadow-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Código de Acceso
                  </label>
                </div>
                <div className="relative group/input">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-foreground transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-background/50 border border-border/80 rounded-xl py-3.5 pl-11 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/20 transition-all font-medium text-sm tracking-widest backdrop-blur-sm shadow-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || checkingSession}
                className="group mt-4 relative w-full flex items-center justify-center gap-2 bg-foreground text-background py-4 px-6 rounded-xl font-semibold overflow-hidden transition-all hover:bg-foreground/90 disabled:opacity-70 disabled:cursor-not-allowed border border-transparent shadow-sm"
              >
                {checkingSession ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-background" />
                ) : (
                  <>
                    <span>Establecer Conexión</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6"
                >
                  <div className="flex items-start gap-3 p-4 rounded-xl border bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400 shadow-sm backdrop-blur-sm">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium leading-relaxed">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-10 pt-6 surface-divider flex flex-col items-center gap-3 text-center">
              <p className="text-xs text-muted-foreground/80 font-medium">
                Acceso exclusivo mediante autorización.
              </p>
              <a 
                href="/forgot-password" 
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors underline decoration-border underline-offset-4 hover:decoration-foreground/50"
              >
                ¿Necesitas recuperar tu código de acceso?
              </a>
            </div>
         </div>
      </motion.div>
    </main>
  );
}

export default function BlogLoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-background" />}>
      <BlogLoginContent />
    </Suspense>
  );
}
