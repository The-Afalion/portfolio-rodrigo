"use client";

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';

export default function ForgotPasswordPage() {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    setLoading(false);

    if (resetError) {
      setError('No se pudo enviar el correo de recuperacion. Revisa el email e intentalo otra vez.');
      return;
    }

    setSuccess('Te hemos enviado un enlace para cambiar tu contrasena.');
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold font-serif text-white">Recuperar Acceso</h1>
          <p className="text-zinc-500">Te enviaremos un enlace para elegir una nueva contrasena.</p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.2 } }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col">
            <label className="text-zinc-400 text-sm mb-1">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@email.com"
              required
              className="bg-zinc-900 border border-zinc-700 rounded-md p-3 text-white focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-black p-3 rounded-md font-bold hover:bg-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? 'Enviando...' : 'Enviar enlace'}
          </button>
        </motion.form>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-red-400 bg-red-900/30 p-3 border border-red-700 rounded-md text-center"
          >
            <p>{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-green-300 bg-green-900/30 p-3 border border-green-700 rounded-md text-center"
          >
            <p>{success}</p>
          </motion.div>
        )}

        <div className="text-center mt-8">
          <p className="text-zinc-500">
            <Link href="/login" className="text-green-500 hover:underline">
              Volver al login general
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
