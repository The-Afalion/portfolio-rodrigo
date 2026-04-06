"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Flame, Lock, LogOut, ShieldCheck, Trophy, Vote } from 'lucide-react';
import Link from 'next/link';
import { useChess } from '@/context/ContextoChess';
import { BOTS } from '@/datos/bots';
import { buildForgotPasswordPath, buildLoginPath, buildSignupPath } from '@/lib/auth';
import ChessLobby from './ChessLobby';
import ChessFriendsPanel from './ChessFriendsPanel';

function LoadingScreen() {
  return (
    <div className="flex h-screen pt-16 items-center justify-center overflow-hidden px-4 bg-[#f4ead5] font-serif">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#fcfaf4] border border-[#d6c4a5] shadow-[5px_8px_15px_rgba(100,70,40,0.15)] w-full max-w-lg p-10 text-center rounded-sm"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#d6c4a5] bg-[#f4ead5] text-5xl text-[#3e3024] shadow-inner">
          ♞
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#3e3024]">Preparando la mesa</h1>
        <p className="mt-4 text-sm leading-7 text-[#8a765f] italic">
          Buscando piezas talladas y acomodando el tablero...
        </p>
      </motion.div>
    </div>
  );
}

function AuthGate() {
  const { error } = useChess();
  const loginHref = buildLoginPath('chess', '/chess');
  const signupHref = buildSignupPath('chess', '/chess');

  return (
    <div className="flex h-screen pt-16 items-center justify-center overflow-hidden px-4 bg-[#f4ead5] font-serif">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#fcfaf4] border border-[#d6c4a5] shadow-[5px_8px_15px_rgba(100,70,40,0.15)] relative z-10 w-full max-w-3xl overflow-hidden p-8 md:p-10 rounded-sm transform rotate-[0.5deg]"
      >
        <div className="absolute inset-x-0 top-0 h-2 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-20" />
        <div className="relative grid gap-8 md:grid-cols-[1.15fr_0.85fr] md:items-center">
          <div>
            <div className="mb-8 flex justify-center md:justify-start">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#d6c4a5] bg-[#fdfbf7] text-5xl text-[#3e3024] shadow-sm">
                ♟
              </div>
            </div>

            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#8a765f] font-mono">Salón Magistral</p>
            <h1 className="text-center text-3xl font-bold tracking-tight md:text-left md:text-4xl text-[#3e3024]">
              Accede al Club
            </h1>
            <p className="mt-4 text-center text-sm leading-7 text-[#5c4033] md:text-left italic">
              Traiga sus credenciales postales. Usamos la misma identidad en todo el establecimiento.
            </p>

            {error && (
              <div className="mt-4 rounded-sm border border-[#8c4030]/50 bg-[#e8705c]/10 p-3 text-sm text-[#8c4030]">
                {error}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row font-serif">
              <Link
                href={loginHref}
                className="flex items-center justify-center gap-2 rounded-sm bg-[#8c4030] px-6 py-3 text-sm font-bold text-[#fdfbf7] hover:bg-[#a64020] transition-colors uppercase tracking-widest shadow-sm"
              >
                <span>Sellar Pase</span>
              </Link>
              <Link
                href={signupHref}
                className="rounded-sm border border-[#d6c4a5] bg-[#f4ead5] px-6 py-3 text-center text-sm font-bold text-[#453628] hover:bg-[#e8dcc4] transition-colors uppercase tracking-widest shadow-sm"
              >
                Solicitar Ingreso
              </Link>
            </div>
          </div>

          <div className="bg-[#f5ebd3] relative rounded-sm p-6 md:p-7 border border-[#d6c4a5] shadow-inner transform rotate-[-1deg]">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d6c4a5] bg-[#fdfbf7]">
                <ShieldCheck size={20} className="text-[#6a8c54]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#3e3024]">Membresía Única</p>
                <p className="text-[10px] text-[#8a765f] uppercase tracking-widest font-mono mt-1">Ecosistema Global</p>
              </div>
            </div>

            <div className="space-y-4 text-sm leading-7 text-[#5c4033] italic">
              <p>Mismo libro de registros para conservar su rango y trofeos en madera.</p>
            </div>

            <div className="mt-6 space-y-3 rounded-sm border border-[#d6c4a5] bg-[#fdfbf7] p-4 text-xs font-mono uppercase tracking-widest text-[#8a765f]">
              <div className="flex items-center justify-between border-b border-dashed border-[#e3d5b8] pb-2">
                <span>Acceso</span>
                <span className="font-bold text-[#3e3024]">Activo</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Nivel</span>
                <span className="font-bold text-[#3e3024]">Sincronizado</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Dashboard() {
  const { usuario, cerrarSesion } = useChess();

  const isBotUnlocked = (index: number) => {
    if (index === 0) return true;
    const previousBotId = BOTS[index - 1].id;
    return usuario?.botsDefeated.includes(previousBotId);
  };

  return (
    <div className="h-screen pt-16 max-h-screen overflow-hidden flex flex-col bg-[#f4ead5] font-serif selection:bg-[#cc6640]/30 selection:text-[#3e3024]">
      <header className="shrink-0 mx-auto w-full max-w-7xl px-4 mt-4">
        <div className="flex h-14 items-center justify-between border-b-2 border-dashed border-[#d6c4a5] pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d6c4a5] bg-[#fcfaf4] text-xl text-[#3e3024] shadow-[1px_2px_4px_rgba(0,0,0,0.1)]">
              ♞
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-[#3e3024]">Club de Maestros</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden flex-col items-end md:flex">
              <span className="text-sm font-bold text-[#453628] leading-tight">{usuario?.username}</span>
              <span className="text-[10px] font-mono tracking-widest text-[#a64020] uppercase border px-1 border-[#d6c4a5] mt-1 bg-[#fcfaf4] py-0.5 rounded-sm">Rango: {usuario?.elo} Pts</span>
            </div>
            <button
              onClick={cerrarSesion}
              className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#8c4030] text-[#fdfbf7] hover:bg-[#a64020] transition-colors shadow-sm"
              title="Cerrar Sesión"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* SINGLE PANE GRID */}
      <main className="flex-1 min-h-0 w-full max-w-[1600px] mx-auto p-4 flex gap-4 overflow-hidden">
        
        {/* PANEL IZQUIERDO: Comunidad y Amigos */}
        <div className="w-[30%] min-w-[300px] flex flex-col gap-4 min-h-0">
          
          <Link
            href="/chess/community"
            className="shrink-0 bg-[#fdfbf7] border border-[#e3d5b8] p-5 shadow-[2px_4px_10px_rgba(120,90,60,0.1)] hover:-translate-y-0.5 hover:shadow-md transition-all relative group transform rotate-[-0.5deg]"
          >
            <div className="absolute top-2 left-6 w-4 h-4 rounded-full bg-[#cc6640] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)] border border-[#a64020] z-20"/>
            <p className="text-[10px] uppercase font-mono tracking-widest text-[#cc6640] font-bold mt-2">Partida Global Diaria</p>
            <div className="flex items-center gap-3 mt-2">
              <Trophy size={20} className="text-[#a68659]" />
              <h3 className="text-xl font-bold text-[#3e3024] leading-none">Ajedrez Comunal</h3>
            </div>
            <p className="text-[12px] text-[#8a765f] leading-snug mt-2 italic">1 Voto diario. Pizarras ocultas. El movimiento más votado será ejecutado.</p>
          </Link>

          <div className="flex-1 min-h-0 bg-[#fdfbf7] border border-[#e3d5b8] rounded-sm shadow-[2px_4px_10px_rgba(120,90,60,0.1)] overflow-hidden flex flex-col relative transform rotate-[0.5deg]">
             <div className="absolute top-2 right-4 w-4 h-4 rounded-full bg-[#668c99] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)] border border-[#4d6c7a] z-20"/>
             <h3 className="text-sm font-bold uppercase tracking-widest text-[#3c5a6b] p-4 border-b border-[#e3d5b8] border-dashed mt-2 mx-4">Tribunas y Gradas</h3>
             <div className="flex-1 overflow-y-auto w-full p-2">
               <ChessFriendsPanel />
             </div>
          </div>
        </div>

        {/* PANEL DERECHO/CENTRO: Bots y Lobby */}
        <div className="flex-1 bg-[#fcfaf4] p-6 border border-[#e3d5b8] rounded-sm shadow-[5px_8px_15px_rgba(100,70,40,0.15)] flex flex-col min-h-0 relative">
          
          <div className="shrink-0 flex gap-4 w-full h-[30%]">
             <div className="w-1/2 flex flex-col">
               <div className="flex items-center gap-2 mb-2 border-b border-[#d6c4a5] border-dashed pb-1">
                 <Flame size={16} className="text-[#ccaa40]"/>
                 <h3 className="text-sm uppercase tracking-widest font-bold text-[#5c4033]">Lobby Activo</h3>
               </div>
               <div className="flex-1 overflow-y-auto">
                 <ChessLobby />
               </div>
             </div>
             <div className="w-1/2 flex items-center justify-center p-4 border-l border-[#d6c4a5] border-dashed">
                <p className="text-sm italic text-[#8a765f] text-center px-4">
                  &quot;Un tablero no es más que madera hasta que dos mentes deciden enfrentarse sobre él.&quot; <br/><br/>
                  Reto a sus pares en el Lobby, o descienda a las mazmorras para practicar con la Inteligencia Mecánica.
                </p>
             </div>
          </div>
          
          <div className="mt-6 pt-4 border-t-4 border-double border-[#d6c4a5] shrink-0">
             <h3 className="text-xl font-bold flex items-center gap-2 text-[#3e3024]">
               <ShieldCheck size={20} className="text-[#6a8c54]"/> Autómatas Desafiantes
             </h3>
             <p className="text-xs font-mono uppercase text-[#8a765f] tracking-widest mt-1">Sala de Entrenamiento Privada</p>
          </div>

          <div className="flex-1 w-full overflow-x-auto overflow-y-hidden flex gap-4 items-center mt-4 pb-4 px-2">
            {BOTS.map((bot, index) => {
              const unlocked = isBotUnlocked(index);
              const vencido = usuario?.botsDefeated.includes(bot.id);

              return (
                <div
                  key={bot.id}
                  className={`shrink-0 w-64 h-[90%] bg-white border border-[#d6c4a5] rounded-sm shadow-[2px_4px_8px_rgba(100,70,40,0.1)] flex flex-col relative overflow-hidden transition-transform ${unlocked ? 'hover:-translate-y-1' : 'opacity-70 grayscale'}`}
                >
                  {!unlocked && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#f4ead5]/90 backdrop-blur-[1px]">
                      <Lock size={32} className="mb-2 text-[#8c4030]" />
                      <span className="text-[10px] font-bold font-mono tracking-widest uppercase text-[#8c4030]">Bloqueado</span>
                    </div>
                  )}

                  {vencido && (
                    <div className="absolute right-2 top-2 z-10 flex items-center gap-1 bg-[#d8e0c3] border border-[#6a8c54] px-2 py-0.5 text-[9px] font-mono tracking-widest text-[#2d4023] uppercase shadow-sm">
                      <Trophy size={10} /> Victorioso
                    </div>
                  )}

                  <div className="p-4 flex flex-col items-center text-center flex-1">
                    <div className={`mt-4 mb-4 flex h-16 w-16 items-center justify-center rounded-full border bg-[#fcfaf4] text-3xl shadow-inner ${unlocked ? 'border-[#d6c4a5]' : 'border-[#e3d5b8]'}`}>
                      {bot.avatar}
                    </div>

                    <h3 className="text-lg font-bold text-[#3e3024]">{bot.nombre}</h3>
                    <div className="mt-1 flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest bg-[#f4ead5] px-2 py-1 border border-[#d6c4a5]">
                      <span className="text-[#8c4030]">{bot.titulo}</span>
                      <span className="text-[#5c4033] border-l border-[#d6c4a5] pl-2">{bot.elo} Pts</span>
                    </div>

                    <p className="mt-4 text-[11px] leading-relaxed italic text-[#8a765f] line-clamp-3">
                      {bot.descripcion}
                    </p>
                  </div>

                  <div className="mt-auto p-3 bg-[#e8dcc4] border-t border-[#d6c4a5]">
                    {unlocked ? (
                      <button
                        type="button"
                        onClick={() => window.location.assign(`/chess/play/${bot.id}`)}
                        className="w-full bg-[#8c4030] py-2 text-[11px] font-bold font-mono tracking-widest uppercase text-[#fdfbf7] hover:bg-[#a64020] transition-colors shadow-sm"
                      >
                        Desafiar
                      </button>
                    ) : (
                      <button type="button" disabled className="w-full cursor-not-allowed bg-[#c4ae91] py-2 text-[11px] font-bold font-mono tracking-widest uppercase text-[#8a765f]">
                        Encadenado
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
}

export default function ChessPage() {
  const { usuario, estaInicializando } = useChess();

  return (
    <AnimatePresence mode="wait">
      {estaInicializando ? (
        <motion.div key="loading" exit={{ opacity: 0 }}>
          <LoadingScreen />
        </motion.div>
      ) : !usuario ? (
        <motion.div key="login" exit={{ opacity: 0 }}>
          <AuthGate />
        </motion.div>
      ) : (
        <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Dashboard />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
