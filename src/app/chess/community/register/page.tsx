"use client";

import { useFormState, useFormStatus } from 'react-dom';
import { registerPlayer } from './actions';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full px-4 py-3 bg-blue-600 text-white font-mono rounded-md hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? 'Registrando...' : 'Entrar y Jugar'}
    </button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useFormState(registerPlayer, { error: null });

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-6 left-6 z-20">
        <Link href="/#chess-hub" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-mono">
            <ArrowLeft size={20} />
            Volver al Laboratorio
        </Link>
      </div>
      
      <div className="w-full max-w-md text-center">
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
            <p className="text-red-500 font-mono text-sm mt-2">{state.error}</p>
          )}
        </form>
      </div>
    </main>
  );
}
