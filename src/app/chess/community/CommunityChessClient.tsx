"use client";

import { useState, useMemo } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from "react-chessboard";
import Countdown from './Countdown';
import { submitVote } from './actions';
import toast from 'react-hot-toast';

export default function CommunityChessClient({ gameData }: { gameData: any }) {
  const { game, sortedVotes, totalVotes } = gameData;
  
  const [email, setEmail] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState('');
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [customSquareStyles, setCustomSquareStyles] = useState({});

  const chessGame = useMemo(() => new Chess(game.fen), [game.fen]);

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
        promotion: 'q', // Promocionar a reina por defecto
      });

      if (move) {
        toast.loading('Registrando voto...');
        const result = await submitVote(email, move.san);
        toast.dismiss();
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(result.success || 'Voto registrado.');
        }
        chessGame.undo(); // Revertir el movimiento en el cliente para mantener el estado del servidor
      }
    }

    // Limpiar selección
    setSelectedPiece('');
    setPossibleMoves([]);
    setCustomSquareStyles({});
  }

  const handleRegister = () => {
    if (email && email.includes('@')) {
      setIsRegistered(true);
      toast.success(`¡Bienvenido, ${email}! Ahora puedes votar moviendo las piezas.`);
    } else {
      toast.error("Por favor, introduce un email válido.");
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row items-center justify-center gap-8 p-8">
      <div className="w-full max-w-lg lg:max-w-xl">
        <Chessboard
          position={game.fen}
          onPieceClick={onPieceClick}
          onSquareClick={onSquareClick}
          customSquareStyles={customSquareStyles}
          boardOrientation={isRegistered ? (game.turn === 'w' ? 'white' : 'black') : 'white'}
        />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tighter">Ajedrez Comunitario</h1>
          <p className="text-muted-foreground font-mono">El mundo decide el próximo movimiento.</p>
        </div>

        <div className="bg-secondary p-6 rounded-lg border border-border mb-8">
          <h2 className="text-lg font-bold text-center mb-2">Tiempo para el Próximo Movimiento</h2>
          <Countdown targetDate={new Date(game.nextMoveDue)} />
        </div>

        {!isRegistered ? (
          <div className="p-6 bg-secondary border border-border rounded-lg">
            <h3 className="text-lg font-bold mb-2">Regístrate para Votar</h3>
            <p className="text-sm text-muted-foreground mb-4">Tu email se usará para asignarte un bando y contar tu voto.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 bg-background border border-border rounded"
              />
              <button onClick={handleRegister} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Registrar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Movimientos Más Votados</h3>
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
        )}
      </div>
    </main>
  );
}
