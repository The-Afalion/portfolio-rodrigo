"use client";

import { useState } from 'react';
import { Play } from 'lucide-react';
import { startNewTournament } from './actions';
import toast from 'react-hot-toast';

export default function ForceStartButton() {
  const [pending, setPending] = useState(false);

  const handleStart = async () => {
    setPending(true);
    toast.loading('Forzando inicio de un nuevo torneo...');
    const result = await startNewTournament();
    toast.dismiss();
    if (result.error) {
      toast.error(`Error: ${result.error}`);
    } else {
      toast.success(result.success || '¡Torneo iniciado!');
    }
    setPending(false);
  };

  return (
    <button 
      onClick={handleStart} 
      disabled={pending} 
      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-mono rounded-md hover:bg-blue-700 disabled:bg-gray-500 transition-colors mt-6"
    >
      <Play size={16} />
      Forzar Inicio de Torneo
    </button>
  );
}
