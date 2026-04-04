"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Lock } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { type AuthAudience, buildForgotPasswordPath, buildLoginPath } from '@/lib/auth';

export function ResetPasswordCard({
  audience,
  nextPath,
}: {
  audience: AuthAudience;
  nextPath: string;
}) {
  const [supabase] = useState(() => createClient());
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function checkRecoverySession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (!session) {
        setError('El enlace de recuperación no es válido o ha caducado. Solicita uno nuevo.');
      }

      setCheckingSession(false);
    }

    checkRecoverySession();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (updateError) {
      setError('No se pudo actualizar la contraseña. Solicita un nuevo enlace.');
      return;
    }

    setSuccess('Contraseña actualizada. Ya puedes iniciar sesión con la nueva credencial.');

    window.setTimeout(() => {
      router.replace(buildLoginPath(audience, nextPath));
      router.refresh();
    }, 1200);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="surface-panel w-full max-w-xl p-6 sm:p-8"
    >
      <div className="mb-8 space-y-3">
        <p className="page-eyebrow">Nueva contraseña</p>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Actualiza tu acceso</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Define una contraseña nueva para seguir usando tu misma cuenta en todo el sistema.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Nueva contraseña</label>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mínimo 8 caracteres"
              required
              className="w-full rounded-2xl border border-border/80 bg-background/70 py-3 pl-11 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Repite la contraseña</label>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repite la contraseña"
              required
              className="w-full rounded-2xl border border-border/80 bg-background/70 py-3 pl-11 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || checkingSession}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-5 py-3.5 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading || checkingSession ? <Loader2 size={18} className="animate-spin" /> : null}
          <span>{checkingSession ? 'Validando enlace...' : loading ? 'Guardando...' : 'Guardar nueva contraseña'}</span>
        </button>
      </form>

      {error ? (
        <div className="mt-5 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
          {success}
        </div>
      ) : null}

      <div className="mt-8 border-t border-border/70 pt-6 text-sm text-muted-foreground">
        <div className="flex flex-col gap-2">
          <Link href={buildForgotPasswordPath(audience, nextPath)} className="font-medium text-foreground hover:underline">
            Solicitar otro enlace
          </Link>
          <Link href={buildLoginPath(audience, nextPath)} className="hover:underline">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
