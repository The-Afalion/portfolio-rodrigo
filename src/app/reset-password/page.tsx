"use client";

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function ResetPasswordPage() {
  const [supabase] = useState(() => createClient());
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
        setError('El enlace de recuperacion no es valido o ya ha caducado. Pide uno nuevo.');
      }

      setCheckingSession(false);
    }

    checkRecoverySession();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError('La nueva contrasena debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contrasenas no coinciden.');
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (updateError) {
      setError('No se pudo actualizar la contrasena. Vuelve a pedir un enlace nuevo.');
      return;
    }

    setSuccess('Contrasena actualizada. Ya puedes iniciar sesion con la nueva.');

    setTimeout(() => {
      router.replace('/login');
      router.refresh();
    }, 1200);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold font-serif text-white">Nueva Contrasena</h1>
          <p className="text-zinc-500">Cambia tu acceso para seguir usando la misma cuenta en toda la web.</p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.2 } }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col">
            <label className="text-zinc-400 text-sm mb-1">Nueva contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="•••••••••"
              required
              className="bg-zinc-900 border border-zinc-700 rounded-md p-3 text-white focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-zinc-400 text-sm mb-1">Repite la contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="•••••••••"
              required
              className="bg-zinc-900 border border-zinc-700 rounded-md p-3 text-white focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || checkingSession}
            className="bg-green-600 text-black p-3 rounded-md font-bold hover:bg-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {checkingSession ? 'Validando enlace...' : loading ? 'Guardando...' : 'Guardar nueva contraseña'}
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
            <Link href="/forgot-password" className="text-green-500 hover:underline">
              Pedir otro enlace
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
