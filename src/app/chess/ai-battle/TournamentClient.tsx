"use client";

import { useState, useEffect, useMemo } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Crown, Play, Shield, Calendar, Zap, Swords, BookOpen, GitCompare, Target, GripVertical, Shuffle, Castle, Activity, BrainCircuit } from 'lucide-react';
import { startNewTournament } from './actions';
import toast from 'react-hot-toast';
import { AI_DATA } from './ai-data';

// --- COMPONENTES DE UI MEJORADOS ---

function SpiderChart({ stats }: { stats: { [key: string]: number } }) {
  const size = 100;
  const center = size / 2;
  const labels = Object.keys(stats);
  const numLabels = labels.length;
  const angleSlice = (Math.PI * 2) / numLabels;

  const points = labels.map((label, i) => {
    const value = stats[label];
    const angle = angleSlice * i - Math.PI / 2;
    const x = center + (center * 0.8 * (value / 10)) * Math.cos(angle);
    const y = center + (center * 0.8 * (value / 10)) * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-24 h-24">
      {[...Array(5)].map((_, i) => (
        <circle key={i} cx={center} cy={center} r={(center * 0.8 * (i + 1)) / 5} fill="none" stroke="currentColor" className="text-border" strokeWidth="0.5" />
      ))}
      <polygon points={points} fill="currentColor" className="text-blue-500/30" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function AiCard({ ai }: { ai: any }) {
  const Icon = {Swords, BookOpen, GitCompare, Target, GripVertical, Shuffle, Castle, Activity, BrainCircuit, Zap, Shield, Crown}[ai.icon] || Zap;
  return (
    <div className="bg-secondary/50 backdrop-blur-sm border border-border rounded-lg p-4 text-center flex flex-col items-center">
      <div className="flex items-center gap-2 font-bold text-lg">
        <Icon size={20} /> {ai.name}
      </div>
      <p className="text-xs text-muted-foreground font-mono mt-1 mb-3 h-16">{ai.description}</p>
      <SpiderChart stats={ai.stats} />
    </div>
  );
}

function Champions({ leaderboard }: { leaderboard: any[] }) {
  const dailyChamp = useMemo(() => [...leaderboard].sort((a, b) => b.winsDaily - a.winsDaily)[0], [leaderboard]);
  const weeklyChamp = useMemo(() => [...leaderboard].sort((a, b) => b.winsWeekly - a.winsWeekly)[0], [leaderboard]);
  const monthlyChamp = useMemo(() => [...leaderboard].sort((a, b) => b.winsMonthly - a.winsMonthly)[0], [leaderboard]);

  const champCard = (title: string, champ: any, icon: React.ReactNode) => (
    <div className="bg-secondary/50 backdrop-blur-sm border border-border rounded-lg p-4 flex flex-col items-center justify-center text-center">
      <div className="flex items-center gap-2 text-muted-foreground font-mono text-sm">{icon} {title}</div>
      <p className="font-bold text-lg truncate">{champ?.name || 'N/A'}</p>
      <p className="text-xs text-amber-400">{champ?.winsTotal || 0} Victorias Totales</p>
    </div>
  );
  return <div className="grid grid-cols-3 gap-4 mb-8">{champCard("Campeón del Día", dailyChamp, <Zap size={14} />)}{champCard("Campeón Semanal", weeklyChamp, <Shield size={14} />)}{champCard("Campeón Mensual", monthlyChamp, <Calendar size={14} />)}</div>;
}

function MatchList({ matches, onSelect, selectedId }: { matches: any[], onSelect: (match: any) => void, selectedId: string | null }) {
  return (
    <div className="flex flex-col gap-2">
      {matches.map((match) => (
        <button key={match.id} onClick={() => onSelect(match)} className={`w-full text-left p-2 rounded-md transition-colors text-sm font-mono ${selectedId === match.id ? 'bg-blue-500/20 text-foreground' : 'text-muted-foreground hover:bg-secondary/80'}`}>
          <span className={match.winnerId === match.player1.id ? 'font-bold' : ''}>{match.player1.name}</span> vs <span className={match.winnerId === match.player2.id ? 'font-bold' : ''}>{match.player2.name}</span>
        </button>
      ))}
    </div>
  );
}

function GameInfo({ game, activeMatch }: { game: any, activeMatch: any }) {
  if (!activeMatch) return null;
  const history = game.history({ verbose: true });
  const p1 = AI_DATA[activeMatch.player1.name];
  const p2 = AI_DATA[activeMatch.player2.name];
  const P1Icon = p1 ? {Swords, BookOpen, GitCompare, Target, GripVertical, Shuffle, Castle, Activity, BrainCircuit, Zap, Shield, Crown}[p1.icon] || Zap : Zap;
  const P2Icon = p2 ? {Swords, BookOpen, GitCompare, Target, GripVertical, Shuffle, Castle, Activity, BrainCircuit, Zap, Shield, Crown}[p2.icon] || Zap : Zap;

  return (
    <div className="bg-secondary/50 backdrop-blur-sm border border-border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center text-center">
        <div className={`w-1/3 flex flex-col items-center gap-1 ${game.turn() === 'w' ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
          <P1Icon size={16} /><span>{activeMatch.player1.name}</span>
        </div>
        <div className="font-mono text-sm">vs</div>
        <div className={`w-1/3 flex flex-col items-center gap-1 ${game.turn() === 'b' ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
          <P2Icon size={16} /><span>{activeMatch.player2.name}</span>
        </div>
      </div>
      <div className="h-32 overflow-y-auto bg-background/50 rounded p-2 text-xs font-mono grid grid-cols-3 gap-x-4 gap-y-1">
        {history.map((move: any, i: number) => (
          <div key={i} className="flex gap-2"><span className="text-muted-foreground">{Math.floor(i / 2) + 1}.</span><span>{move.san}</span></div>
        ))}
      </div>
      <AnimatePresence>
        {game.isCheckmate() && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center font-bold text-amber-400">¡JAQUE MATE!</motion.div>}
      </AnimatePresence>
    </div>
  );
}

function ForceStartButton() {
  // ... (sin cambios)
}

// --- COMPONENTE PRINCIPAL ---

export default function TournamentClient({ tournament, leaderboard }: { tournament: any, leaderboard: any[] }) {
  // ... (lógica principal sin cambios)
}
