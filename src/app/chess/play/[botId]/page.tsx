"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { useChess } from '@/context/ContextoChess';
import { BOTS } from '@/datos/bots';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageSquare, RefreshCw, Trophy, XCircle, Flag } from 'lucide-react';
import Link from 'next/link';

// --- Utilidad para obtener movimiento aleatorio (Bot Básico) ---
function getRandomMove(game: Chess) {
  const moves = game.moves();
  if (moves.length === 0) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}

// --- Utilidad para obtener el mejor movimiento (Bot Avanzado - Simulado con Stockfish si fuera real, aquí heurística simple) ---
// Para este ejemplo, usaremos una lógica simple: capturar si es posible, sino aleatorio.
// En una implementación real, aquí conectarías con una API de Stockfish o un WebWorker.
function getBestMove(game: Chess, elo: number) {
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return null;

  // Si el ELO es alto, intenta capturar piezas de valor
  if (elo > 1000) {
    const captures = moves.filter(m => m.flags.includes('c') || m.flags.includes('e'));
    if (captures.length > 0) {
      // 80% de probabilidad de tomar la captura si el ELO es alto
      if (Math.random() < (elo / 3000)) {
        return captures[Math.floor(Math.random() * captures.length)].san;
      }
    }
  }

  return moves[Math.floor(Math.random() * moves.length)].san;
}


export default function PlayPage() {
  const { botId } = useParams();
  const router = useRouter();
  const { usuario, registrarVictoria } = useChess();
  
  const [game, setGame] = useState(new Chess());
  const [bot, setBot] = useState(BOTS.find(b => b.id === botId));
  const [dialogo, setDialogo] = useState<string>("");
  const [estadoJuego, setEstadoJuego] = useState<'jugando' | 'victoria' | 'derrota' | 'tablas'>('jugando');
  const [pensando, setPensando] = useState(false);

  // Redirigir si no hay usuario o bot inválido
  useEffect(() => {
    if (!usuario) router.push('/chess');
    if (!bot) router.push('/chess');
  }, [usuario, bot, router]);

  // Diálogo inicial
  useEffect(() => {
    if (bot) {
      setDialogo(bot.dialogos.entrada[Math.floor(Math.random() * bot.dialogos.entrada.length)]);
    }
  }, [bot]);

  // --- Lógica del Bot ---
  useEffect(() => {
    if (game.turn() === 'b' && estadoJuego === 'jugando') {
      setPensando(true);
      const tiempoPensar = Math.max(500, 2000 - (bot?.elo || 0)); // Bots más listos piensan "menos" (o más, depende del diseño)

      setTimeout(() => {
        const move = getBestMove(game, bot?.elo || 400);
        if (move) {
          const result = game.move(move);
          setGame(new Chess(game.fen())); // Actualizar estado
          
          // Diálogos reactivos
          if (game.isCheckmate()) {
            setEstadoJuego('derrota');
            setDialogo(bot?.dialogos.victoria[Math.floor(Math.random() * bot.dialogos.victoria.length)] || "Jaque mate.");
          } else if (game.isCheck()) {
            setDialogo(bot?.dialogos.jaque[Math.floor(Math.random() * bot.dialogos.jaque.length)] || "Jaque.");
          } else if (result.captured) {
            setDialogo(bot?.dialogos.captura[Math.floor(Math.random() * bot.dialogos.captura.length)] || "Captura.");
          } else {
            // 30% de probabilidad de hablar en un movimiento normal
            if (Math.random() < 0.3) {
              setDialogo(bot?.dialogos.movimiento[Math.floor(Math.random() * bot.dialogos.movimiento.length)] || "Tu turno.");
            }
          }
        }
        setPensando(false);
      }, tiempoPensar);
    }
  }, [game, bot, estadoJuego]);

  // --- Manejo de Movimiento del Jugador ---
  function onDrop(sourceSquare: string, targetSquare: string) {
    if (estadoJuego !== 'jugando' || game.turn() !== 'w') return false;

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q', // siempre promover a reina por simplicidad
      });

      if (move === null) return false; // movimiento ilegal

      setGame(new Chess(game.fen()));

      // Verificar estado tras movimiento del jugador
      if (game.isCheckmate()) {
        setEstadoJuego('victoria');
        setDialogo(bot?.dialogos.derrota[Math.floor(Math.random() * bot.dialogos.derrota.length)] || "Imposible...");
        if (bot) registrarVictoria(bot.id);
      } else if (game.isDraw()) {
        setEstadoJuego('tablas');
        setDialogo("Tablas. Un resultado aceptable.");
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  if (!bot) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row font-sans">
      
      {/* Panel Izquierdo: Info Bot y Chat */}
      <div className="w-full md:w-1/3 p-8 border-r border-zinc-800 flex flex-col bg-zinc-900 relative z-20 shadow-2xl">
        <Link href="/chess" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-10 transition-colors font-medium text-sm uppercase tracking-wider">
          <ArrowLeft size={16} /> Volver al Club
        </Link>

        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center text-5xl border-4 border-zinc-700 shadow-lg">
            {bot.avatar}
          </div>
          <div>
            <h2 className="text-3xl font-bold font-serif mb-1">{bot.nombre}</h2>
            <div className="flex gap-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 uppercase tracking-wider`}>
                {bot.titulo}
              </span>
              <span className="text-xs font-mono text-zinc-500 pt-0.5">ELO {bot.elo}</span>
            </div>
          </div>
        </div>

        {/* Chat Bubble */}
        <div className="flex-grow relative bg-zinc-950 rounded-2xl p-8 border border-zinc-800 shadow-inner mb-8">
          <div className="absolute -top-3 left-8 bg-zinc-800 text-zinc-400 px-3 py-1 text-xs rounded-full uppercase font-bold tracking-wider border border-zinc-700">
            Chat en vivo
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={dialogo}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`text-xl font-serif italic leading-relaxed text-zinc-300`}
            >
              "{dialogo}"
            </motion.p>
          </AnimatePresence>
          {pensando && (
            <div className="mt-6 flex gap-2 opacity-50">
              <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          )}
        </div>

        {/* Estado del Juego */}
        {estadoJuego !== 'jugando' && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`p-6 rounded-xl text-center mb-6 border-2 ${
              estadoJuego === 'victoria' ? 'bg-green-900/20 border-green-500/50 text-green-400' : 
              estadoJuego === 'derrota' ? 'bg-red-900/20 border-red-500/50 text-red-400' : 
              'bg-yellow-900/20 border-yellow-500/50 text-yellow-400'
            }`}
          >
            {estadoJuego === 'victoria' && <Trophy className="mx-auto mb-3 w-10 h-10" />}
            {estadoJuego === 'derrota' && <XCircle className="mx-auto mb-3 w-10 h-10" />}
            <h3 className="text-2xl font-bold uppercase tracking-widest font-serif">
              {estadoJuego === 'victoria' ? '¡VICTORIA!' : estadoJuego === 'derrota' ? 'DERROTA' : 'TABLAS'}
            </h3>
            {estadoJuego === 'victoria' && <p className="text-sm mt-2 font-mono">+50 Puntos de ELO</p>}
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => {
              setGame(new Chess());
              setEstadoJuego('jugando');
              setDialogo(bot.dialogos.entrada[Math.floor(Math.random() * bot.dialogos.entrada.length)]);
            }}
            className="py-4 bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl uppercase tracking-wider text-sm"
          >
            <RefreshCw size={18} /> Revancha
          </button>
          <button 
            onClick={() => {
              setEstadoJuego('derrota');
              setDialogo("Una sabia decisión. Rendirse es mejor que sufrir.");
            }}
            className="py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all border border-zinc-700 uppercase tracking-wider text-sm"
          >
            <Flag size={18} /> Rendirse
          </button>
        </div>
      </div>

      {/* Panel Derecho: Tablero */}
      <div className="w-full md:w-2/3 flex items-center justify-center bg-zinc-950 p-4 md:p-12 relative overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-950 to-zinc-950"></div>
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")' }}></div>
        
        <div className="w-full max-w-[650px] aspect-square shadow-2xl shadow-black rounded-lg overflow-hidden border-[12px] border-zinc-800 relative z-10 bg-zinc-800">
          <Chessboard 
            position={game.fen()} 
            onPieceDrop={onDrop}
            boardOrientation="white"
            customDarkSquareStyle={{ backgroundColor: '#52525b' }} // Zinc-600
            customLightSquareStyle={{ backgroundColor: '#a1a1aa' }} // Zinc-400
            animationDuration={200}
            customBoardStyle={{
              borderRadius: '2px',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
            }}
            customPieces={{
              // Aquí podrías añadir piezas personalizadas si quisieras
            }}
          />
        </div>
      </div>

    </div>
  );
}
