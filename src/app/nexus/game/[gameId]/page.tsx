"use client";

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams, useRouter } from 'next/navigation';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import toast from 'react-hot-toast';
import { ArrowLeft, User, Wifi, WifiOff } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let supabase: any;
if (supabaseUrl && supabaseAnonKey) supabase = createClient(supabaseUrl, supabaseAnonKey);

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
      .subscribe(async (status) => {
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
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">Redirigiendo al Nexus...</div>;
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <header className="p-4 border-b border-neutral-800 flex justify-between items-center">
        <button onClick={() => router.push('/nexus')} className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors font-mono text-sm">
          <ArrowLeft size={16} /> Abandonar Partida
        </button>
        <div className={`flex items-center gap-2 text-xs font-mono ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
          {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
          {isConnected ? 'CONECTADO' : 'DESCONECTADO'}
        </div>
      </header>

      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="mb-4 text-center">
          <p className="font-mono text-lg">
            <span className="font-bold text-blue-400">{playerEmail.split('@')[0]}</span> (Tú) vs <span className="font-bold text-red-400">{opponent ? opponent.split('@')[0] : '...'}</span>
          </p>
          <p className="text-sm text-neutral-400">
            {game.isGameOver() ? 'Partida terminada' : `Turno de las ${game.turn() === 'w' ? 'Blancas' : 'Negras'}`}
          </p>
        </div>
        <div className="w-full max-w-lg">
          <Chessboard
            position={game.fen()}
            onPieceDrop={onDrop}
            boardOrientation={playerSide || 'white'}
          />
        </div>
      </div>
    </main>
  );
}
