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
      // Redirigir al club de ajedrez en caso de éxito
      router.push('/chess');
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
            {loading ? 'Entrando...' : 'Entrar al Club'}
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
