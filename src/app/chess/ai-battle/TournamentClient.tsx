"use client";

import { useState, useEffect, useMemo } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { motion } from 'framer-motion';
import { Crown, Shield, Swords } from 'lucide-react';

function MatchCard({ match, isLive }: { match: any, isLive: boolean }) {
  const p1 = match.player1;
  const p2 = match.player2;
  const winner = match.winner;

  return (
    <div className={`p-3 rounded-lg border ${isLive ? 'border-blue-500 bg-blue-500/10' : 'border-border bg-secondary/50'}`}>
      <div className="flex justify-between items-center">
        <span className={`font-mono text-sm ${winner && winner.id === p1.id ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>{p1.name}</span>
        <span className="text-xs font-mono text-muted-foreground">{p1.elo}</span>
      </div>
      <div className="text-center text-xs font-mono text-muted-foreground my-1">vs</div>
      <div className="flex justify-between items-center">
        <span className={`font-mono text-sm ${winner && winner.id === p2.id ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>{p2.name}</span>
        <span className="text-xs font-mono text-muted-foreground">{p2.elo}</span>
      </div>
    </div>
  );
}

function Bracket({ tournament, liveMatchId }: { tournament: any, liveMatchId: string | null }) {
  const rounds: any = {};
  tournament.matches.forEach((match: any) => {
    if (!rounds[match.round]) rounds[match.round] = [];
    rounds[match.round].push(match);
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {Object.keys(rounds).sort().map(roundNum => (
        <div key={roundNum} className="flex flex-col gap-4">
          <h3 className="text-center font-bold font-mono">
            {roundNum == '1' ? 'Octavos' : roundNum == '2' ? 'Cuartos' : roundNum == '3' ? 'Semifinal' : 'Final'}
          </h3>
          <div className="flex flex-col gap-6">
            {rounds[roundNum].map((match: any) => (
              <MatchCard key={match.id} match={match} isLive={match.id === liveMatchId} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Leaderboard({ leaderboard }: { leaderboard: any[] }) {
  return (
    <div className="bg-secondary/50 backdrop-blur-sm border border-border rounded-lg p-4">
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

export default function TournamentClient({ tournament, leaderboard }: { tournament: any, leaderboard: any[] }) {
  const [game, setGame] = useState(new Chess());
  const [liveMatch, setLiveMatch] = useState<any>(null);

  useEffect(() => {
    const activeMatch = tournament.matches.find((m: any) => m.status === 'ACTIVE');
    if (!activeMatch || !activeMatch.moves) return;

    setLiveMatch(activeMatch);
    const moves = activeMatch.moves as { move: string, timestamp: string }[];
    const now = new Date().getTime();

    // Encontrar el último movimiento que ya debería haber ocurrido
    let lastMoveIndex = -1;
    for (let i = 0; i < moves.length; i++) {
      if (new Date(moves[i].timestamp).getTime() <= now) {
        lastMoveIndex = i;
      } else {
        break;
      }
    }

    // Aplicar todos los movimientos pasados
    const initialGame = new Chess();
    for (let i = 0; i <= lastMoveIndex; i++) {
      initialGame.move(moves[i].move);
    }
    setGame(initialGame);

    // Programar los movimientos futuros
    for (let i = lastMoveIndex + 1; i < moves.length; i++) {
      const moveTime = new Date(moves[i].timestamp).getTime();
      const delay = moveTime - now;
      
      setTimeout(() => {
        setGame(prevGame => {
          const newGame = new Chess(prevGame.fen());
          newGame.move(moves[i].move);
          return newGame;
        });
      }, delay);
    }
  }, [tournament]);

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {liveMatch ? (
            <Chessboard position={game.fen()} boardOrientation={game.turn() === 'w' ? 'white' : 'black'} />
          ) : (
            <div className="aspect-square bg-secondary/50 flex items-center justify-center rounded-lg">
              <p className="font-mono text-muted-foreground">Esperando la próxima partida...</p>
            </div>
          )}
        </div>
        <Leaderboard leaderboard={leaderboard} />
      </div>
      <Bracket tournament={tournament} liveMatchId={liveMatch?.id} />
    </div>
  );
}
