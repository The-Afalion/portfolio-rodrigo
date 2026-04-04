"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, Mail } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { type AuthAudience, buildAuthCallbackUrl, buildLoginPath, buildResetPasswordPath } from '@/lib/auth';

export function ForgotPasswordCard({
  audience,
  nextPath,
}: {
  audience: AuthAudience;
  nextPath: string;
}) {
  const [supabase] = useState(() => createClient());
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const redirectTo = buildAuthCallbackUrl(buildResetPasswordPath(audience, nextPath));

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    setLoading(false);

    if (resetError) {
      setError('No se pudo enviar el correo de recuperación. Revisa el email e inténtalo otra vez.');
      return;
    }

    setSuccess('Te hemos enviado un enlace para elegir una nueva contraseña.');
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="surface-panel w-full max-w-xl p-6 sm:p-8"
    >
      <div className="mb-8 space-y-3">
        <p className="page-eyebrow">Recuperación</p>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Recuperar acceso</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Introduce tu correo y te enviaremos un enlace seguro para restablecer la contraseña de tu cuenta global.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Correo electrónico</label>
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@email.com"
              required
              className="w-full rounded-2xl border border-border/80 bg-background/70 py-3 pl-11 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-5 py-3.5 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : null}
          <span>{loading ? 'Enviando...' : 'Enviar enlace'}</span>
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
        <Link href={buildLoginPath(audience, nextPath)} className="font-medium text-foreground hover:underline">
          Volver al inicio de sesión
        </Link>
      </div>
    </motion.div>
  );
}
