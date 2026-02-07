"use client";

import { useState, useMemo } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from "react-chessboard";
import Countdown from './Countdown';
import { submitVote } from './actions';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CommunityChessClient({ gameData, error, playerEmail }: { gameData: any, error?: string | null, playerEmail: string }) {
  const { fen, turn, nextMoveDue, sortedVotes, totalVotes } = gameData;
  
  const [selectedPiece, setSelectedPiece] = useState('');
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [customSquareStyles, setCustomSquareStyles] = useState({});

  const chessGame = useMemo(() => new Chess(fen), [fen]);
  const targetDate = useMemo(() => new Date(nextMoveDue), [nextMoveDue]);

  function onPieceClick(piece: string, sourceSquare: string) {
    const moves = chessGame.moves({
      square: sourceSquare,
      verbose: true,
    });

    if (moves.length === 0) {
      setPossibleMoves([]);
      setCustomSquareStyles({});
      return;
    }

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
    if (!selectedPiece) return;

    if (possibleMoves.includes(square)) {
      const move = chessGame.move({
        from: selectedPiece,
        to: square,
        promotion: 'q',
      });

      if (move) {
        toast.loading('Registrando voto...');
        // Usamos el email que viene de la cookie
        const result = await submitVote(playerEmail, move.san);
        toast.dismiss();
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(result.success || 'Voto registrado.');
        }
        chessGame.undo();
      }
    }

    setSelectedPiece('');
    setPossibleMoves([]);
    setCustomSquareStyles({});
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
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
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full">
        <div className="w-full max-w-lg lg:max-w-xl">
          <Chessboard
            position={fen}
            onPieceClick={onPieceClick}
            onSquareClick={onSquareClick}
            customSquareStyles={customSquareStyles}
            boardOrientation={turn === 'w' ? 'white' : 'black'}
          />
        </div>

        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tighter">Ajedrez Comunitario</h1>
            <p className="text-muted-foreground font-mono">El mundo decide el próximo movimiento.</p>
          </div>

          <div className="bg-secondary p-6 rounded-lg border border-border mb-8">
            <h2 className="text-lg font-bold text-center mb-2">Tiempo para el Próximo Movimiento</h2>
            <Countdown targetDate={targetDate} />
          </div>

          <div className="space-y-4">
            <div className='flex justify-between items-center'>
              <h3 className="text-xl font-bold">Movimientos Más Votados</h3>
              <p className='font-mono text-sm text-muted-foreground'>Jugando como {playerEmail}</p>
            </div>
            {sortedVotes.slice(0, 5).map(([move, count]: [string, number]) => (
              <div key={move} className="bg-secondary p-3 rounded-lg border border-border">
                <div className="flex justify-between items-center font-mono">
                  <span className="font-bold text-lg">{move}</span>
                  <span className="text-muted-foreground">{totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(1) + '%' : '0%'}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${totalVotes > 0 ? (count / totalVotes) * 100 : 0}%` }}></div>
                </div>
              </div>
            ))}
            {sortedVotes.length === 0 && <p className="text-muted-foreground text-center">Aún no hay votos para esta ronda.</p>}
          </div>
        </div>
      </div>
    </main>
  );
}
