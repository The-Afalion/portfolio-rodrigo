"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { requestLogin } from './actions';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitted(false);
    setLoading(true);

    const result = await requestLogin(email);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSubmitted(true);
    }
  };

  return (
    <main className="min-h-screen bg-black text-green-500 font-mono flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-2 glitch-text">ACCESO DE ADMINISTRADOR</h1>
          <p className="text-green-800 mb-8">Autenticación Requerida</p>
        </motion.div>

        {!submitted ? (
          <motion.form 
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.2 } }}
            className="flex flex-col gap-4"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@admin.com"
              required
              className="bg-gray-900 border border-green-900 text-green-400 p-3 text-center focus:outline-none focus:border-green-500 transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-green-900/50 border border-green-700 text-green-400 p-3 hover:bg-green-700 hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verificando...' : 'SOLICITAR ACCESO'}
            </button>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border border-green-700 bg-green-900/20 p-6"
          >
            <h2 className="text-xl text-white mb-2">Revisa tu correo</h2>
            <p className="text-green-600">
              Si el email es correcto, recibirás un enlace para iniciar sesión.
            </p>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-red-500 bg-red-900/30 p-3 border border-red-700"
          >
            <p>{error}</p>
          </motion.div>
        )}
      </div>
    </main>
  );
}
