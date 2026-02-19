"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChess } from '@/context/ContextoChess';
import { BOTS } from '@/datos/bots';
import { Lock, Unlock, User, LogOut, Trophy, BrainCircuit, Crown, Shield, Sword } from 'lucide-react';
import Link from 'next/link';

// --- Componente de Login Temático ---
function LoginScreen() {
  const { iniciarSesion, registrarse, error, cargando } = useChess();
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [modoRegistro, setModoRegistro] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nombre.trim() && password.trim()) {
      if (modoRegistro) {
        await registrarse(nombre, password);
      } else {
        await iniciarSesion(nombre, password);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-100 font-serif relative overflow-hidden">
      {/* Fondo de Tablero Sutil */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[conic-gradient(at_center,_var(--tw-gradient-stops))] from-zinc-100 via-zinc-900 to-zinc-900" style={{ backgroundSize: '100px 100px' }}></div>
      
      {/* Piezas Flotantes Decorativas */}
      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} 
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-20 text-9xl opacity-10 select-none"
      >
        ♔
      </motion.div>
      <motion.div 
        animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }} 
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-20 right-20 text-9xl opacity-10 select-none"
      >
        ♘
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-xl shadow-2xl relative z-10"
      >
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-900 text-5xl shadow-lg border-4 border-zinc-800">
            ♟
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-2 font-serif tracking-tight">CHESS CLUB</h1>
        <p className="text-sm text-center text-zinc-500 mb-8 font-sans">Accede al santuario de la estrategia.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 text-red-400 text-sm rounded text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 font-sans">
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase tracking-wider">Usuario</label>
            <input 
              type="text" 
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 p-3 text-zinc-100 focus:border-zinc-100 focus:outline-none transition-all rounded-lg placeholder-zinc-700"
              placeholder="Grandmaster_01"
              autoFocus
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase tracking-wider">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 p-3 text-zinc-100 focus:border-zinc-100 focus:outline-none transition-all rounded-lg placeholder-zinc-700"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit"
            disabled={cargando}
            className="w-full bg-zinc-100 text-zinc-900 py-3 font-bold hover:bg-white transition-all rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cargando ? 'Procesando...' : (modoRegistro ? 'Crear Cuenta' : 'Entrar al Club')}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button 
            onClick={() => {
              setModoRegistro(!modoRegistro);
              setError(null);
            }}
            className="text-xs text-zinc-500 hover:text-zinc-300 underline transition-colors font-sans"
          >
            {modoRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿Nuevo aquí? Regístrate gratis'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// --- Componente del Dashboard ---
function Dashboard() {
  const { usuario, cerrarSesion } = useChess();

  const isBotUnlocked = (index: number) => {
    if (index === 0) return true;
    const previousBotId = BOTS[index - 1].id;
    return usuario?.botsDefeated.includes(previousBotId);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-700 selection:text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-100 rounded flex items-center justify-center text-zinc-900 text-2xl font-serif">
              ♞
            </div>
            <span className="font-bold tracking-tight text-xl font-serif">CHESS<span className="text-zinc-500">CLUB</span></span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold">{usuario?.username}</span>
              <span className="text-xs text-zinc-500 font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">ELO: {usuario?.elo}</span>
            </div>
            <button 
              onClick={cerrarSesion}
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-red-400"
              title="Cerrar Sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-serif">La Arena</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Enfréntate a nuestras IAs personalizadas. Cada victoria te acerca más al título de Gran Maestro.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BOTS.map((bot, index) => {
            const unlocked = isBotUnlocked(index);
            const vencido = usuario?.botsDefeated.includes(bot.id);

            return (
              <motion.div
                key={bot.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative group rounded-xl border transition-all duration-300 ${
                  unlocked 
                    ? 'border-zinc-800 bg-zinc-900 hover:border-zinc-600 hover:shadow-2xl hover:-translate-y-1' 
                    : 'border-zinc-900 bg-zinc-950 opacity-50 grayscale'
                } overflow-hidden flex flex-col`}
              >
                {/* Estado Bloqueado Overlay */}
                {!unlocked && (
                  <div className="absolute inset-0 z-20 bg-zinc-950/80 backdrop-blur-[1px] flex flex-col items-center justify-center text-zinc-600">
                    <Lock size={48} className="mb-4" />
                    <span className="text-sm font-bold uppercase tracking-widest">Nivel Bloqueado</span>
                    <p className="text-xs mt-2 font-mono">Requiere vencer a {BOTS[index-1].nombre}</p>
                  </div>
                )}

                {/* Badge de Victoria */}
                {vencido && (
                  <div className="absolute top-4 right-4 z-10 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                    <Trophy size={12} /> VENCIDO
                  </div>
                )}

                <div className="p-8 flex flex-col items-center text-center flex-grow relative">
                  {/* Fondo sutil del avatar */}
                  <div className="absolute inset-0 bg-gradient-to-b from-zinc-800/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className={`w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center text-5xl mb-6 border-4 shadow-xl relative z-10 ${unlocked ? 'border-zinc-700' : 'border-zinc-900'}`}>
                    {bot.avatar}
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-1 font-serif relative z-10">{bot.nombre}</h3>
                  <div className="flex items-center gap-2 mb-4 relative z-10">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400`}>
                      {bot.titulo}
                    </span>
                    <span className="text-xs font-mono text-zinc-500">ELO {bot.elo}</span>
                  </div>
                  
                  <p className="text-sm text-zinc-400 leading-relaxed mb-6 relative z-10">
                    {bot.descripcion}
                  </p>
                </div>

                <div className="p-4 border-t border-zinc-800 bg-zinc-950/50 mt-auto relative z-10">
                  <Link 
                    href={unlocked ? `/chess/play/${bot.id}` : '#'}
                    className={`block w-full py-3 text-center rounded-lg font-bold transition-all uppercase tracking-wider text-sm ${
                      unlocked 
                        ? 'bg-zinc-100 hover:bg-white text-zinc-900 shadow-lg' 
                        : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                    }`}
                  >
                    {unlocked ? 'Jugar Partida' : 'Bloqueado'}
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default function ChessPage() {
  const { usuario } = useChess();

  return (
    <AnimatePresence mode="wait">
      {!usuario ? (
        <motion.div key="login" exit={{ opacity: 0 }}>
          <LoginScreen />
        </motion.div>
      ) : (
        <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Dashboard />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
