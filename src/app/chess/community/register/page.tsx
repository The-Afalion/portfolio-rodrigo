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
      className="w-full px-4 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed transition-colors"
      whileHover={{ scale: pending ? 1 : 1.02 }}
      whileTap={{ scale: pending ? 1 : 0.98 }}
    >
      {pending ? 'Asignando bando...' : 'Entrar y Jugar'}
    </motion.button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useFormState(registerPlayer, { error: null, assignedSide: null });

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <FondoAjedrez />
      <div className="absolute top-6 left-6 z-20">
        <Link href="/chess" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-mono text-sm">
            <ArrowLeft size={16} />
            Volver al Chess Hub
        </Link>
      </div>
      
      <motion.div 
        className="w-full max-w-md text-center z-10 bg-secondary/50 backdrop-blur-sm border border-border p-8 rounded-xl shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence mode="wait">
          {state.assignedSide ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center"
            >
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <h1 className="text-2xl font-bold mb-2">¡Bando asignado!</h1>
              <p className="text-muted-foreground mb-6">Jugarás con las piezas:</p>
              <div className="flex items-center gap-4 text-3xl font-bold font-mono mb-8 p-4 border-2 border-primary/50 rounded-lg bg-primary/10">
                {state.assignedSide === 'w' ? <Shield className="w-8 h-8 text-primary" /> : <Swords className="w-8 h-8 text-primary" />}
                <span className="text-primary">{state.assignedSide === 'w' ? 'BLANCAS' : 'NEGRAS'}</span>
              </div>
              <Link href="/chess/community" className="w-full px-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 text-center transition-colors">
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
              <h1 className="text-3xl font-bold tracking-tight mb-2">Registro de Jugador</h1>
              <p className="text-muted-foreground mb-8">Introduce tu correo para asignarte un bando y unirte a la partida.</p>
              
              <form action={formAction} className="space-y-4">
                <input 
                  type="email" 
                  name="email"
                  placeholder="tu-correo@ejemplo.com"
                  required
                  className="w-full p-3 bg-background border border-border rounded-lg font-mono text-center focus:ring-2 focus:ring-primary outline-none"
                />
                <SubmitButton />
                {state.error && (
                  <p className="text-destructive font-mono text-sm pt-2">{state.error}</p>
                )}
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}
