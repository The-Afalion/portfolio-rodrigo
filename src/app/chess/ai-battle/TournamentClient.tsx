"use client";

import { useState, useEffect, useMemo } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Crown, Play, Shield, Calendar, Zap, Swords, BookOpen, GitCompare, Target, GripVertical, Shuffle, Castle, Activity, BrainCircuit } from 'lucide-react';
import { startNewTournament } from './actions';
import toast from 'react-hot-toast';
import { AI_DATA } from './ai-data';

// --- COMPONENTES DE UI ---
// (Los componentes pequeños como AiCard, Champions, etc. no cambian)
function SpiderChart({ stats }: { stats: { [key: string]: number } }) { /* ... */ }
function AiCard({ ai }: { ai: any }) { /* ... */ }
function Champions({ leaderboard }: { leaderboard: any[] }) { /* ... */ }
function MatchList({ matches, onSelect, selectedId }: { matches: any[], onSelect: (match: any) => void, selectedId: string | null }) { /* ... */ }
function GameInfo({ game, activeMatch }: { game: any, activeMatch: any }) { /* ... */ }
function Bracket({ tournament }: { tournament: any }) { /* ... */ }
function ForceStartButton() { /* ... */ }

// --- COMPONENTE PRINCIPAL CON LÓGICA DE POLLING ---

export default function TournamentClient({ initialTournament, initialLeaderboard }: { initialTournament: any, initialLeaderboard: any[] }) {
  const [tournament, setTournament] = useState(initialTournament);
  const [leaderboard, setLeaderboard] = useState(initialLeaderboard);
  const [activeMatch, setActiveMatch] = useState<any>(null);
  const [game, setGame] = useState(new Chess());
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');

  // Polling para actualizar el estado del torneo
  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await fetch('/api/tournament-status');
      const data = await response.json();
      if (data.tournament) {
        setTournament(data.tournament);
      }
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
    }, 5000); // Cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  const activeRoundMatches = useMemo(() => 
    tournament?.matches.filter((m: any) => m.status === 'ACTIVE' || m.status === 'PENDING') || [], 
  [tournament]);

  const currentMatch = useMemo(() => 
    activeRoundMatches.find((m: any) => m.status === 'ACTIVE') || activeRoundMatches[0],
  [activeRoundMatches]);

  useEffect(() => {
    if (currentMatch) {
      setActiveMatch(currentMatch);
    }
  }, [currentMatch]);

  useEffect(() => {
    if (!activeMatch || !activeMatch.moves) {
      setGame(new Chess());
      return;
    };
    
    const newGame = new Chess();
    activeMatch.moves.forEach((m: any) => newGame.move(m.move));
    setGame(newGame);
    setBoardOrientation('white');

  }, [activeMatch]);

  if (!tournament) {
    return (
      <div className="text-center bg-secondary/50 backdrop-blur-sm border border-border p-8 rounded-lg flex flex-col items-center">
        <h2 className="text-2xl font-bold font-mono">Torneo en Preparación</h2>
        <p className="text-muted-foreground mt-2">El próximo torneo comenzará pronto...</p>
        <ForceStartButton />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <Champions leaderboard={leaderboard} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div key={activeMatch?.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Chessboard position={game.fen()} boardOrientation={boardOrientation} />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-center">Partidas de la Ronda</h3>
          <MatchList matches={activeRoundMatches} onSelect={setActiveMatch} selectedId={activeMatch?.id} />
          <GameInfo game={game} activeMatch={activeMatch} />
        </div>
      </div>
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">Bracket del Torneo</h2>
        <Bracket tournament={tournament} />
      </div>
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">Combatientes</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.values(AI_DATA).map(ai => <AiCard key={ai.name} ai={ai} />)}
        </div>
      </div>
    </div>
  );
}
