"use client";

import { Suspense, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

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

  const nextPath = useMemo(
    () => getSafeNextPath(searchParams.get('next')),
    [searchParams]
  );

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) {
        return;
      }

      if (user) {
        router.replace(nextPath);
        router.refresh();
        return;
      }

      const errorParam = searchParams.get('error');
      if (errorParam === 'not_editor') {
        setError('Tu cuenta existe, pero todavia no tiene permisos de editor del blog.');
      } else if (errorParam === 'auth_callback' || errorParam === 'auth_verify') {
        setError('No se pudo completar el acceso desde el enlace de Supabase. Intenta iniciar sesion otra vez.');
      }

      setCheckingSession(false);
    }

    checkSession();

    return () => {
      mounted = false;
    };
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
      setError('No se pudo iniciar sesion. Revisa el correo, la contrasena y que la invitacion del editor este aceptada.');
      return;
    }

    router.replace(nextPath);
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-800 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 sm:p-12">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-blue-100">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">Nexus de Editores</h1>
            <p className="text-sm text-slate-500 font-medium">Acceso al panel editorial del blog</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Correo Electronico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="editor@rodocodes.dev"
                required
                className="bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all font-medium text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Contrasena</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all font-medium text-sm tracking-widest"
              />
            </div>

            <button
              type="submit"
              disabled={loading || checkingSession}
              className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {checkingSession ? 'Comprobando acceso...' : loading ? 'Autenticando...' : 'Entrar al panel'}
            </button>
          </form>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 text-[13px] font-medium text-red-600 bg-red-50 p-4 border border-red-100 rounded-xl text-center"
            >
              <p>{error}</p>
            </motion.div>
          )}

          <div className="mt-8 text-center text-xs text-slate-400 font-medium border-t border-slate-100 pt-6 space-y-2">
            <p>Solo pueden acceder usuarios invitados como editores en Supabase Auth.</p>
            <p>Si recibiste un correo de invitacion, acepta el enlace primero y crea tu contrasena.</p>
            <p>
              <a href="/forgot-password" className="text-blue-500 hover:underline">
                Recuperar contraseña
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

export default function BlogLoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#f8fafc]" />}>
      <BlogLoginContent />
    </Suspense>
  );
}
