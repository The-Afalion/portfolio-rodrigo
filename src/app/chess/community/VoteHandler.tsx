"use client";

import { useState } from 'react';
import { Chess } from 'chess.js';
import toast from 'react-hot-toast';

async function submitVote(email: string, move: string) {
  // Esta sería una Server Action
  console.log(`Voto de ${email} para ${move}`);
  // Lógica para guardar en DB...
}

export default function VoteHandler({ fen }: { fen: string }) {
  const [email, setEmail] = useState('');
  const [selectedMove, setSelectedMove] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  const game = new Chess(fen);
  const possibleMoves = game.moves();

  const handleRegister = () => {
    if (email && email.includes('@')) {
      setIsRegistered(true);
      toast.success(`¡Registrado! Ahora puedes votar, ${email}.`);
    } else {
      toast.error("Por favor, introduce un email válido.");
    }
  };

  const handleVote = () => {
    if (!selectedMove) {
      toast.error("Selecciona un movimiento para votar.");
      return;
    }
    submitVote(email, selectedMove);
    toast.success(`¡Voto por ${selectedMove} registrado!`);
  };

  if (!isRegistered) {
    return (
      <div className="mt-8 p-6 bg-secondary border border-border rounded-lg">
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
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold mb-2">Tu Voto</h3>
      <div className="flex gap-2">
        <select 
          value={selectedMove}
          onChange={(e) => setSelectedMove(e.target.value)}
          className="w-full p-3 bg-background border border-border rounded font-mono"
        >
          <option value="" disabled>Selecciona un movimiento...</option>
          {possibleMoves.map(move => (
            <option key={move} value={move}>{move}</option>
          ))}
        </select>
        <button onClick={handleVote} className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          Votar
        </button>
      </div>
    </div>
  );
}
