"use client";

import { useState, useMemo } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

function MatchAnalyzer({ match }: { match: any }) {
  const [game, setGame] = useState(new Chess());
  const [moveIndex, setMoveIndex] = useState(-1);
  const moves = useMemo(() => match.moves.map((m: any) => m.move), [match]);

  const navigate = (index: number) => {
    const newIndex = Math.max(-1, Math.min(moves.length - 1, index));
    const newGame = new Chess();
    for (let i = 0; i <= newIndex; i++) {
      newGame.move(moves[i]);
    }
    setGame(newGame);
    setMoveIndex(newIndex);
  };

  return (
    <div className="space-y-4">
      <Chessboard position={game.fen()} />
      <div className="flex justify-center items-center gap-4 bg-secondary/50 p-2 rounded-lg">
        <button onClick={() => navigate(-1)}><ChevronsLeft /></button>
        <button onClick={() => navigate(moveIndex - 1)}><ArrowLeft /></button>
        <span className="font-mono text-sm">{moveIndex + 1} / {moves.length}</span>
        <button onClick={() => navigate(moveIndex + 1)}><ArrowRight /></button>
        <button onClick={() => navigate(moves.length - 1)}><ChevronsRight /></button>
      </div>
    </div>
  );
}

export default function ArchiveClient({ tournament }: { tournament: any }) {
  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  const rounds: { [key: number]: any[] } = {};
  tournament.matches.forEach((match: any) => {
    if (!rounds[match.round]) rounds[match.round] = [];
    rounds[match.round].push(match);
  });
  const roundNames = ['Octavos', 'Cuartos', 'Semifinal', 'Final'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        {selectedMatch ? (
          <MatchAnalyzer match={selectedMatch} />
        ) : (
          <div className="aspect-square bg-secondary/50 flex items-center justify-center rounded-lg">
            <p className="font-mono text-muted-foreground">Selecciona una partida del bracket para analizarla.</p>
          </div>
        )}
      </div>
      <div className="space-y-8">
        {Object.keys(rounds).sort((a, b) => Number(a) - Number(b)).map(roundNumStr => {
          const roundNum = Number(roundNumStr);
          return (
            <div key={roundNum}>
              <h3 className="text-center font-bold font-mono mb-4">{roundNames[roundNum - 1]}</h3>
              <div className="flex flex-col gap-2">
                {rounds[roundNum].map((match: any) => (
                  <button
                    key={match.id}
                    onClick={() => setSelectedMatch(match)}
                    className={`p-2 rounded-md border text-left transition-colors ${selectedMatch?.id === match.id ? 'bg-blue-500/20 border-blue-500' : 'bg-secondary/50 border-border hover:bg-secondary'}`}
                  >
                    <p className={`font-mono text-sm ${match.winnerId === match.player1.id ? 'font-bold' : ''}`}>{match.player1.name}</p>
                    <p className={`font-mono text-sm ${match.winnerId === match.player2.id ? 'font-bold' : ''}`}>{match.player2.name}</p>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
