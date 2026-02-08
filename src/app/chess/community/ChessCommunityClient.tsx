"use client";

import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { executeMoveAndInjectVotes, submitVote } from './actions';
import toast from 'react-hot-toast';

export default function ChessCommunityClient({ gameData, votes: initialVotes, player }: { gameData: any, votes: any[], player: any }) {
  const [game, setGame] = useState(new Chess(gameData.fen));
  const [selectedMove, setSelectedMove] = useState('');
  const [pending, setPending] = useState(false);
  const [visibleVotes, setVisibleVotes] = useState<any[]>([]);

  // Lógica para mostrar votos progresivamente
  useEffect(() => {
    const now = new Date();
    const filtered = initialVotes.filter(v => new Date(v.createdAt) <= now);
    setVisibleVotes(filtered);
  }, [initialVotes]);

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    const gameCopy = new Chess(game.fen());
    try {
      const move = gameCopy.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
      if (move) {
        setSelectedMove(move.san);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const handleVote = async () => {
    if (!selectedMove) {
      toast.error("Selecciona un movimiento en el tablero.");
      return;
    }
    setPending(true);
    const result = await submitVote(player.email, selectedMove);
    if (result.error) toast.error(result.error);
    else toast.success(result.success || "Voto registrado");
    setPending(false);
  };

  const handleExecute = async () => {
    setPending(true);
    toast.loading("Ejecutando movimiento e inyectando votos...");
    const result = await executeMoveAndInjectVotes();
    toast.dismiss();
    if (result.error) toast.error(result.error);
    else toast.success(result.success || "Movimiento ejecutado");
    setPending(false);
  };

  const voteCounts = visibleVotes.reduce((acc, vote) => {
    acc[vote.move] = (acc[vote.move] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedVotes = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Chessboard 
          position={game.fen()}
          onPieceDrop={onDrop}
          boardOrientation={player?.assignedSide === 'b' ? 'black' : 'white'}
        />
        {selectedMove && (
          <div className="mt-4 text-center">
            <p className="font-mono text-muted-foreground">Movimiento seleccionado: <span className="font-bold text-foreground">{selectedMove}</span></p>
            <button onClick={handleVote} disabled={pending} className="mt-2 px-6 py-2 bg-primary text-primary-foreground font-bold rounded-md hover:opacity-90 disabled:opacity-50">
              {pending ? "Enviando..." : "Confirmar Voto"}
            </button>
          </div>
        )}
      </div>
      <div className="bg-secondary/50 p-6 rounded-lg border border-border">
        <h3 className="text-xl font-bold mb-4">Votos Actuales</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {sortedVotes.map(([move, count]) => (
            <div key={move} className="flex justify-between items-center p-2 bg-background/50 rounded">
              <span className="font-mono font-bold">{move}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono">{count} {count > 1 ? 'votos' : 'voto'}</span>
              </div>
            </div>
          ))}
          {sortedVotes.length === 0 && (
            <p className="text-muted-foreground text-sm font-mono">Esperando votos...</p>
          )}
        </div>
        
        {/* Botón de ejecución para admin */}
        {player?.email === "tu-email-de-admin@ejemplo.com" && (
          <div className="mt-6 border-t border-border pt-4">
            <button onClick={handleExecute} disabled={pending} className="w-full px-4 py-2 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 disabled:opacity-50">
              Ejecutar e Inyectar Votos
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
