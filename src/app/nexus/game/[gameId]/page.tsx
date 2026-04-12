"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import toast from 'react-hot-toast';
import { ArrowLeft, User, Wifi, WifiOff } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

let supabase: ReturnType<typeof createClient> | null = null;

try {
  supabase = createClient();
} catch {
  supabase = null;
}

function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export default function GamePage() {
  const { gameId } = useParams();
  const router = useRouter();
  const [game, setGame] = useState(new Chess());
  const [isConnected, setIsConnected] = useState(false);
  const [playerSide, setPlayerSide] = useState<'white' | 'black' | null>(null);
  const [opponent, setOpponent] = useState<string | null>(null);

  const playerEmail = getCookie('player-email');

  useEffect(() => {
    if (!supabase || !gameId || !playerEmail) {
      if (!playerEmail) router.push('/nexus');
      return;
    }

    const channel = supabase.channel(`game-${gameId}`);

    channel
      .on('broadcast', { event: 'move' }, ({ payload }: { payload: { fen: string } }) => {
        setGame(new Chess(payload.fen));
        toast('Tu oponente ha movido.', { icon: '♟️' });
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const presences = Object.values(state).map((p: any) => p[0]);
        const opponentPresence = presences.find(p => p.user !== playerEmail);
        if (opponentPresence) setOpponent(opponentPresence.user);

        if (presences.length === 1 && presences[0].user === playerEmail && !playerSide) {
          setPlayerSide('white');
        } else if (presences.length > 1 && !playerSide) {
          setPlayerSide('black');
        }
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          await channel.track({ user: playerEmail, online_at: new Date().toISOString() });
        } else {
          setIsConnected(false);
        }
      });

    return () => { if (supabase) supabase.removeChannel(channel); };
  }, [gameId, playerEmail, playerSide, router]);

  function onDrop(sourceSquare: string, targetSquare: string) {
    if (game.turn() !== playerSide?.[0] || !playerSide) return false;

    const gameCopy = new Chess(game.fen());
    const move = gameCopy.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
    if (move === null) return false;

    setGame(gameCopy);

    const channel = supabase.channel(`game-${gameId}`);
    channel.send({ type: 'broadcast', event: 'move', payload: { fen: gameCopy.fen() } });

    return true;
  }

  if (!playerEmail) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f4ead5] text-[#3e3024] font-serif">Redirigiendo a Telegrama Global...</div>;
  }

  return (
    <main className="min-h-screen bg-[#f4ead5] text-[#3e3024] font-serif flex flex-col selection:bg-[#cc6640]/30 selection:text-[#3e3024]">
      <header className="px-6 py-4 border-b-2 border-dashed border-[#d6c4a5] flex justify-between items-center bg-[#fcfaf4]">
        <button onClick={() => router.push('/nexus')} className="flex items-center gap-2 text-[#8c673d] hover:text-[#3e2b22] transition-colors font-mono font-bold text-[10px] uppercase tracking-[0.2em]">
          <ArrowLeft size={16} /> Abandonar Mesa
        </button>
        <div className={`flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-mono font-bold ${isConnected ? 'text-[#6a8c54]' : 'text-[#8c4030]'}`}>
          {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
          {isConnected ? 'LÍNEA ACTIVA' : 'LÍNEA CORTADA'}
        </div>
      </header>

      <div className="flex-grow flex flex-col items-center justify-center p-4 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10 pointer-events-none mix-blend-multiply" />
        
        <div className="mb-8 text-center relative z-10 bg-[#fcfaf4] p-6 border-2 border-[#1a120e] shadow-[8px_12px_20px_rgba(60,40,30,0.2)] transform rotate-[-0.5deg]">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#ccaa40] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)] border border-[#a68659]" />
          <p className="font-mono text-sm tracking-widest mt-2 uppercase">
            <span className="font-bold text-[#3c5a6b]">{playerEmail.split('@')[0]}</span> (Tú) <span className="mx-2 text-[#8a765f] text-xs">vs</span> <span className="font-bold text-[#8c4030]">{opponent ? opponent.split('@')[0] : '...'}</span>
          </p>
          <div className="flex-1 border-t border-dashed border-[#d6c4a5] my-4" />
          <p className="text-xl font-bold font-serif text-[#3e3024] tracking-tight uppercase">
            {game.isGameOver() ? 'Partida Concluida' : `Turno: ${game.turn() === 'w' ? 'Piezas de Marfil' : 'Piezas de Nogal'}`}
          </p>
        </div>
        
        <div className="w-full max-w-2xl bg-[#1a120e] p-4 border-8 border-[#3e3024] shadow-[10px_15px_30px_rgba(60,40,30,0.3)] relative z-10">
          <Chessboard
            position={game.fen()}
            onPieceDrop={onDrop}
            boardOrientation={playerSide || 'white'}
            customDarkSquareStyle={{ backgroundColor: '#5c4033' }}
            customLightSquareStyle={{ backgroundColor: '#e3d7c5' }}
          />
        </div>
      </div>
    </main>
  );
}
