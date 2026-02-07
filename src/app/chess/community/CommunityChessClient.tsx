"use client";

import { useState, useMemo, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from "react-chessboard";
import Countdown from './Countdown';
import { submitVote } from './actions';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft, Shield, Swords, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import FondoAjedrez from '@/components/FondoAjedrez';

export default function CommunityChessClient({ gameData, error, playerEmail }: { gameData: any, error?: string | null, playerEmail: string }) {
  const { fen, turn, nextMoveDue, sortedVotes, totalVotes } = gameData;
  
  const [selectedPiece, setSelectedPiece] = useState('');
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [customSquareStyles, setCustomSquareStyles] = useState({});
  const [playerSide, setPlayerSide] = useState<'w' | 'b' | null>(null);

  const chessGame = useMemo(() => new Chess(fen), [fen]);
  const targetDate = useMemo(() => new Date(nextMoveDue), [nextMoveDue]);

  // Obtener el bando del jugador al cargar
  useEffect(() => {
    // Pequeña trampa: como no tenemos el bando del jugador en el cliente,
    // lo inferimos del primer voto que hizo o lo guardamos en el estado.
    // Por ahora, lo simularemos. En una app real, lo obtendríamos de la DB.
    // Para este caso, simplemente lo asignaremos basado en el turno.
    // Esto es una simplificación visual. La validación real está en el servidor.
    setPlayerSide(turn === 'w' ? 'w' : 'b');
  }, [turn]);


  function onPieceClick(piece: string, sourceSquare: string) {
    // Solo permitir mover piezas si es el turno de tu bando (visualmente)
    if (chessGame.turn() !== playerSide) return;

    const moves = chessGame.moves({ square: sourceSquare, verbose: true });
    if (moves.length === 0) return;

    const newPossibleMoves = moves.map(move => move.to);
    setPossibleMoves(newPossibleMoves);
    setSelectedPiece(sourceSquare);

    const newStyles: { [key: string]: any } = {};
    newStyles[sourceSquare] = { background: "rgba(255, 255, 0, 0.4)" };
    newPossibleMoves.forEach(move => {
      newStyles[move] = {
        background: "radial-gradient(circle, rgba(0,0,0,0.1) 25%, transparent 25%)",
        borderRadius: "50%",
      };
    });
    setCustomSquareStyles(newStyles);
  }

  async function onSquareClick(square: string) {
    if (!selectedPiece || !possibleMoves.includes(square)) return;

    const move = chessGame.move({ from: selectedPiece, to: square, promotion: 'q' });
    if (!move) return;

    toast.loading('Registrando voto...');
    const result = await submitVote(playerEmail, move.san);
    toast.dismiss();
    if (result.error) {
      toast.error(result.error);
      chessGame.undo(); // Revertir si hay error
    } else {
      toast.success(result.success || 'Voto registrado.');
      // No revertimos el movimiento para dar feedback instantáneo,
      // la página se recargará con el estado real de la DB.
    }

    setSelectedPiece('');
    setPossibleMoves([]);
    setCustomSquareStyles({});
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 overflow-hidden relative">
      <FondoAjedrez />
      <div className="absolute top-6 left-6 z-20">
        <Link href="/#chess-hub" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-mono">
            <ArrowLeft size={20} />
            Volver al Laboratorio
        </Link>
      </div>
      {error && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg font-mono z-30">
          {error}
        </div>
      )}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-12 w-full z-10">
        <motion.div 
          className="w-full max-w-lg lg:max-w-xl"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Chessboard
            position={fen}
            onPieceClick={onPieceClick}
            onSquareClick={onSquareClick}
            customSquareStyles={customSquareStyles}
            boardOrientation={playerSide === 'w' ? 'white' : 'black'}
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

          <div className="bg-secondary/50 backdrop-blur-sm p-4 rounded-lg border border-border mb-6 text-center">
            <p className="text-sm text-muted-foreground font-mono">Bienvenido, <span className="text-foreground font-bold">{playerEmail}</span></p>
            <p className="text-sm text-muted-foreground font-mono">
              Es el turno de las {turn === 'w' ? 'Blancas' : 'Negras'}.
            </p>
          </div>

          <div className="bg-secondary/50 backdrop-blur-sm p-6 rounded-lg border border-border mb-6">
            <h2 className="text-lg font-bold text-center mb-2">Tiempo para el Próximo Movimiento</h2>
            <Countdown targetDate={targetDate} />
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-center">Movimientos Más Votados</h3>
            {sortedVotes.slice(0, 5).map(([move, count]: [string, number], index: number) => (
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
                  <span className="text-muted-foreground">{totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(1) + '%' : '0%'}</span>
                </div>
                <div className="w-full bg-background rounded-full h-1.5 mt-2">
                  <motion.div 
                    className="bg-blue-600 h-1.5 rounded-full" 
                    initial={{ width: 0 }}
                    animate={{ width: `${totalVotes > 0 ? (count / totalVotes) * 100 : 0}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            ))}
            {sortedVotes.length === 0 && <p className="text-muted-foreground text-center font-mono">Aún no hay votos para esta ronda.</p>}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
