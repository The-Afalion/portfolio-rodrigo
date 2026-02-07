"use client";

import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, ChevronRight, Play } from 'lucide-react';
import { startNewTournament } from './actions';
import toast from 'react-hot-toast';

// --- COMPONENTES PEQUEÑOS ---

function MatchCard({ match, onClick, isSelected }: { match: any, onClick: () => void, isSelected: boolean }) {
  const p1 = match.player1;
  const p2 = match.player2;
  return (
    <motion.div
      onClick={onClick}
      className={`p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'border-blue-500 bg-blue-500/10' : 'border-border bg-secondary/50 hover:bg-secondary/80'}`}
      whileHover={{ scale: 1.03 }}
    >
      <div className="flex justify-between items-center">
        <span className="font-mono text-sm font-bold">{p1.name}</span>
        <span className="text-xs font-mono text-muted-foreground">{p1.elo}</span>
      </div>
      <div className="text-center text-xs font-mono text-muted-foreground my-1">vs</div>
      <div className="flex justify-between items-center">
        <span className="font-mono text-sm font-bold">{p2.name}</span>
        <span className="text-xs font-mono text-muted-foreground">{p2.elo}</span>
      </div>
    </motion.div>
  );
}

function Leaderboard({ leaderboard }: { leaderboard: any[] }) {
  return (
    <div className="bg-secondary/50 backdrop-blur-sm border border-border rounded-lg p-4 h-full">
      <h3 className="text-lg font-bold text-center mb-4">Leaderboard de IAs</h3>
      <div className="space-y-3">
        {leaderboard.map((player, index) => (
          <div key={player.name} className="flex items-center justify-between text-sm font-mono">
            <div className="flex items-center gap-3">
              {index === 0 ? <Crown className="text-yellow-500" size={16} /> : <span className="w-4 text-center">{index + 1}</span>}
              <span>{player.name}</span>
            </div>
            <span className="font-bold">{player.elo}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Bracket({ tournament, showNextRound }: { tournament: any, showNextRound: boolean }) {
  const rounds: { [key: number]: any[] } = {};
  tournament.matches.forEach((match: any) => {
    if (!rounds[match.round]) rounds[match.round] = [];
    rounds[match.round].push(match);
  });

  const roundNames = ['Octavos', 'Cuartos', 'Semifinal', 'Final'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Object.keys(rounds).sort((a, b) => Number(a) - Number(b)).map(roundNumStr => {
        const roundNum = Number(roundNumStr);
        return (
          <div key={roundNum} className="flex flex-col gap-4">
            <h3 className="text-center font-bold font-mono">{roundNames[roundNum - 1]}</h3>
            <div className="flex flex-col gap-6">
              {rounds[roundNum].map((match: any) => (
                <div key={match.id} className="flex items-center gap-2">
                  <div className="w-full p-3 rounded-lg border bg-secondary/50 border-border">
                    <p className="font-mono text-sm font-bold truncate">{match.player1.name}</p>
                    <p className="font-mono text-sm font-bold truncate mt-2">{match.player2.name}</p>
                  </div>
                  <AnimatePresence>
                    {showNextRound && match.winnerId && (
                      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                        <ChevronRight className="text-green-500" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ForceStartButton() {
  const [pending, setPending] = useState(false);
  const handleStart = async () => {
    setPending(true);
    toast.loading('Forzando inicio de un nuevo torneo...');
    const result = await startNewTournament();
    toast.dismiss();
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success || '¡Torneo iniciado!');
    }
    setPending(false);
  };

  return (
    <button onClick={handleStart} disabled={pending} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-mono rounded-md hover:bg-blue-700 disabled:bg-gray-500">
      <Play size={16} />
      Forzar Inicio de Torneo
    </button>
  );
}


// --- COMPONENTE PRINCIPAL ---

export default function TournamentClient({ tournament, leaderboard }: { tournament: any, leaderboard: any[] }) {
  const [activeMatch, setActiveMatch] = useState<any>(null);
  const [game, setGame] = useState(new Chess());
  const [showNextRound, setShowNextRound] = useState(false);

  const activeRoundMatches = tournament?.matches.filter((m: any) => m.status === 'ACTIVE') || [];

  useEffect(() => {
    if (activeRoundMatches.length > 0) {
      setActiveMatch(activeRoundMatches[0]);
    }
  }, [tournament]);

  useEffect(() => {
    if (!activeMatch || !activeMatch.moves) return;

    const moves = activeMatch.moves as { move: string, timestamp: string }[];
    const now = new Date().getTime();
    let timeouts: NodeJS.Timeout[] = [];

    let lastMoveIndex = -1;
    for (let i = 0; i < moves.length; i++) {
      if (new Date(moves[i].timestamp).getTime() <= now) {
        lastMoveIndex = i;
      } else {
        break;
      }
    }

    const initialGame = new Chess();
    for (let i = 0; i <= lastMoveIndex; i++) {
      initialGame.move(moves[i].move);
    }
    setGame(initialGame);

    for (let i = lastMoveIndex + 1; i < moves.length; i++) {
      const moveTime = new Date(moves[i].timestamp).getTime();
      const delay = moveTime - now;
      
      const timeoutId = setTimeout(() => {
        setGame(prevGame => {
          const newGame = new Chess(prevGame.fen());
          newGame.move(moves[i].move);
          return newGame;
        });
        if (i === moves.length - 1 && activeMatch.id === activeRoundMatches[activeRoundMatches.length - 1].id) {
          setTimeout(() => setShowNextRound(true), 1000);
        }
      }, delay);
      timeouts.push(timeoutId);
    }

    return () => timeouts.forEach(clearTimeout);
  }, [activeMatch]);

  if (!tournament) {
    return (
      <div className="text-center bg-secondary/50 backdrop-blur-sm border border-border p-8 rounded-lg">
        <h2 className="text-2xl font-bold font-mono">Torneo en Preparación</h2>
        <p className="text-muted-foreground mt-2 mb-6">El Cron Job de mantenimiento se está ejecutando. Si es la primera vez, las IAs se están creando.</p>
        <ForceStartButton />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap gap-2">
            {activeRoundMatches.map((match: any) => (
              <MatchCard 
                key={match.id} 
                match={match} 
                onClick={() => {
                  setShowNextRound(false);
                  setActiveMatch(match);
                }}
                isSelected={activeMatch?.id === match.id}
              />
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={activeMatch?.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Chessboard position={game.fen()} boardOrientation={game.turn() === 'w' ? 'white' : 'black'} />
            </motion.div>
          </AnimatePresence>
        </div>
        <Leaderboard leaderboard={leaderboard} />
      </div>
      <Bracket tournament={tournament} showNextRound={showNextRound} />
    </div>
  );
}
