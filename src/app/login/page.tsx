"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { signInWithPassword } from './actions';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signInWithPassword(email, password);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      // Redirigir al panel de administrador si es el superadmin, o al club de ajedrez
      if (email.endsWith('@rodocodes.dev') || email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        router.push('/admin');
      } else {
        router.push('/chess');
      }
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold font-serif text-white">CHESS CLUB</h1>
          <p className="text-zinc-500">Accede al santuario de la estrategia.</p>
        </motion.div>

        <motion.form 
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.2 } }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col">
            <label className="text-zinc-400 text-sm mb-1">Usuario</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rodocodes"
              required
              className="bg-zinc-900 border border-zinc-700 rounded-md p-3 text-white focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-zinc-400 text-sm mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••••••"
              required
              className="bg-zinc-900 border border-zinc-700 rounded-md p-3 text-white focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-black p-3 rounded-md font-bold hover:bg-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </motion.form>

        <div className="mt-4">
          <button
            onClick={async () => {
              // Redirect to our simple auth route or implement direct supabase provider sign in
              window.location.href = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${window.location.origin}/auth/callback`;
            }}
            className="w-full bg-white text-black p-3 rounded-md font-bold hover:bg-gray-200 transition-all flex justify-center items-center gap-2"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Entrar con Google
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-red-400 bg-red-900/30 p-3 border border-red-700 rounded-md text-center"
          >
            <p>{error}</p>
          </motion.div>
        )}

        <div className="text-center mt-8">
          <p className="text-zinc-500">
            ¿Nuevo aquí?{' '}
            <a href="/signup" className="text-green-500 hover:underline">
              Regístrate gratis
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
