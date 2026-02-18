"use client";

import { useState, useMemo, useReducer } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from "react-chessboard";
import Countdown from './Countdown';
import { submitVote } from './actions';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft, Crown, User, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import FondoAjedrez from '@/components/FondoAjedrez';

type GameState = {
  fen: string;
  sortedVotes: [string, number][];
  totalVotes: number;
  isSubmitting: boolean;
};

type Action =
  | { type: 'START_SUBMIT' }
  | { type: 'END_SUBMIT' };

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START_SUBMIT':
      return { ...state, isSubmitting: true };
    case 'END_SUBMIT':
      return { ...state, isSubmitting: false };
    default:
      return state;
  }
}

function StatusMessage({ playerEmail, playerSide, turn }: { playerEmail: string, playerSide: 'w' | 'b', turn: 'w' | 'b' }) {
  const isMyTurn = playerSide === turn;
  const turnColor = turn === 'w' ? 'Blancas' : 'Negras';
  const myColor = playerSide === 'w' ? 'Blancas' : 'Negras';

  return (
    <div className="bg-secondary/50 backdrop-blur-sm p-4 rounded-lg border border-border text-center">
      <p className="text-sm text-muted-foreground font-mono">
        Hola, <span className="font-bold text-foreground">{playerEmail}</span> (juegas con {myColor})
      </p>
      <p className={`text-md font-bold mt-1 ${isMyTurn ? 'text-green-400' : 'text-amber-400'}`}>
        {isMyTurn ? "Es tu turno para votar." : `Le toca mover a las ${turnColor}.`}
      </p>
    </div>
  );
}

export default function CommunityChessClient({ gameData, playerEmail, playerSide }: { gameData: any, playerEmail: string, playerSide: 'w' | 'b' }) {
  const { fen, turn, nextMoveDue, sortedVotes, totalVotes } = gameData;

  const [state, dispatch] = useReducer(gameReducer, {
    fen,
    sortedVotes,
    totalVotes,
    isSubmitting: false,
  });

  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  
  const chessGame = useMemo(() => new Chess(state.fen), [state.fen]);
  const targetDate = useMemo(() => new Date(nextMoveDue), [nextMoveDue]);

  async function onSquareClick(square: string) {
    if (!selectedSquare || !possibleMoves.includes(square) || state.isSubmitting) {
      setSelectedSquare(null);
      setPossibleMoves([]);
      return;
    }

    const move = { from: selectedSquare, to: square, promotion: 'q' };
    const moveSAN = new Chess(state.fen).move(move).san;
    
    dispatch({ type: 'START_SUBMIT' });
    const toastId = toast.loading('Registrando tu voto...');

    const result = await submitVote(playerEmail, moveSAN);
    
    toast.dismiss(toastId);
    dispatch({ type: 'END_SUBMIT' });

    if (result.error) {
      toast.error(result.error, { duration: 4000 });
    } else {
      toast.success(result.success || '¡Voto registrado!', { duration: 3000 });
      // Esperamos un momento para que el usuario lea el toast y luego recargamos
      setTimeout(() => window.location.reload(), 1500);
    }

    setSelectedSquare(null);
    setPossibleMoves([]);
  }

  function onPieceClick(piece: string, sourceSquare: string) {
    if (state.isSubmitting || chessGame.turn() !== playerSide) return;

    const moves = chessGame.moves({ square: sourceSquare, verbose: true });
    if (moves.length === 0) {
      setSelectedSquare(null);
      setPossibleMoves([]);
      return;
    }

    setSelectedSquare(sourceSquare);
    setPossibleMoves(moves.map(m => m.to));
  }

  const customSquareStyles: { [key: string]: any } = {};
  if (selectedSquare) customSquareStyles[selectedSquare] = { background: "rgba(255, 215, 0, 0.5)" };
  possibleMoves.forEach(move => {
    customSquareStyles[move] = { background: "radial-gradient(circle, rgba(0,0,0,0.2) 25%, transparent 25%)" };
  });

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 overflow-hidden relative">
      <FondoAjedrez />
      <div className="absolute top-6 left-6 z-20">
        <Link href="/chess" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-mono">
            <ArrowLeft size={20} />
            Volver al Chess Hub
        </Link>
      </div>
      
      <div className="flex flex-col lg:flex-row items-center justify-center gap-12 w-full z-10">
        <motion.div 
          className="w-full max-w-lg lg:max-w-xl"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Chessboard
            position={state.fen}
            onPieceClick={onPieceClick}
            onSquareClick={onSquareClick}
            customSquareStyles={customSquareStyles}
            boardOrientation={playerSide}
            arePiecesDraggable={false}
          />
        </motion.div>

        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold tracking-tighter">Ajedrez Comunitario</h1>
            <p className="text-muted-foreground font-mono">El mundo decide el próximo movimiento.</p>
          </div>

          <StatusMessage playerEmail={playerEmail} playerSide={playerSide} turn={turn} />

          <div className="bg-secondary/50 backdrop-blur-sm p-6 rounded-lg border border-border my-6">
            <h2 className="text-lg font-bold text-center mb-2">Tiempo para el Próximo Movimiento</h2>
            <Countdown targetDate={targetDate} />
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-center">Movimientos Más Votados</h3>
            {state.sortedVotes.slice(0, 5).map(([move, count]: [string, number], index: number) => (
              <motion.div 
                key={move} 
                className="bg-secondary/50 backdrop-blur-sm p-3 rounded-lg border border-border overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <div className="flex justify-between items-center font-mono">
                  <div className="flex items-center gap-3">
                    {index === 0 && <Crown size={16} className="text-yellow-500" />}
                    <span className="font-bold text-lg">{move}</span>
                  </div>
                  <span className="text-muted-foreground">{state.totalVotes > 0 ? ((count / state.totalVotes) * 100).toFixed(1) + '%' : '0%'}</span>
                </div>
                <div className="w-full bg-background rounded-full h-1.5 mt-2">
                  <motion.div 
                    className="bg-primary h-1.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${state.totalVotes > 0 ? (count / state.totalVotes) * 100 : 0}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            ))}
            {state.sortedVotes.length === 0 && <p className="text-muted-foreground text-center font-mono">Aún no hay votos para esta ronda.</p>}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
