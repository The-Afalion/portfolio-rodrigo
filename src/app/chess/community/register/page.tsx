"use client";

import { useFormState, useFormStatus } from 'react-dom';
import { registerPlayer } from './actions';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Shield, Swords } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FondoAjedrez from '@/components/FondoAjedrez';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <motion.button 
      type="submit" 
      disabled={pending}
      className="w-full px-4 py-3 bg-blue-600 text-white font-mono rounded-md hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
      whileHover={{ scale: pending ? 1 : 1.05 }}
      whileTap={{ scale: pending ? 1 : 0.95 }}
    >
      {pending ? 'Registrando...' : 'Entrar y Jugar'}
    </motion.button>
  );
}

export default function RegisterPage() {
  // El estado ahora puede contener el bando asignado
  const [state, formAction] = useFormState(registerPlayer, { error: null, assignedSide: null });

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <FondoAjedrez />
      <div className="absolute top-6 left-6 z-20">
        <Link href="/#chess-hub" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-mono">
            <ArrowLeft size={20} />
            Volver al Laboratorio
        </Link>
      </div>
      
      <motion.div 
        className="w-full max-w-md text-center z-10 bg-background/50 backdrop-blur-sm border border-border p-8 rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence mode="wait">
          {state.assignedSide ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center"
            >
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <h1 className="text-2xl font-bold mb-2">¡Bienvenido al campo de batalla!</h1>
              <p className="text-muted-foreground mb-4">Se te ha asignado el bando de las:</p>
              <div className="flex items-center gap-4 text-3xl font-bold font-mono mb-6 p-4 border border-border rounded-lg">
                {state.assignedSide === 'w' ? <Shield className="w-8 h-8" /> : <Swords className="w-8 h-8" />}
                {state.assignedSide === 'w' ? 'BLANCAS' : 'NEGRAS'}
              </div>
              <Link href="/chess/community" className="w-full px-4 py-3 bg-green-600 text-white font-mono rounded-md hover:bg-green-700 text-center">
                Ir a la Partida
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h1 className="text-4xl font-bold tracking-tighter mb-2">Registro de Jugador</h1>
              <p className="text-muted-foreground font-mono mb-8">Introduce tu email para unirte a la partida comunitaria.</p>
              
              <form action={formAction} className="space-y-4">
                <input 
                  type="email" 
                  name="email"
                  placeholder="tu@email.com"
                  required
                  className="w-full p-3 bg-secondary border border-border rounded-md font-mono text-center"
                />
                <SubmitButton />
                {state.error && (
                  <p className="text-red-500 font-mono text-sm pt-2">{state.error}</p>
                )}
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}
