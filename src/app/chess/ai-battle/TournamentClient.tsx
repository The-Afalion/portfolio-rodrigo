"use client";

import { useState, useEffect, useMemo } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Play, Coins, Wand2, ChevronDown, Trophy, Layers3, Activity, TimerReset } from 'lucide-react';
import { placeBetAction, startNewTournament } from './actions';
import toast from 'react-hot-toast';
import { AI_DATA } from './ai-data';
import { getBotBoardTheme } from '@/utils/chessThemes';

// --- COMPONENTES DE UI ---
// (Los componentes pequeños como AiCard, Champions, etc. no cambian)
function SpiderChart({ stats }: { stats: { [key: string]: number } }) {
  const entries = Object.entries(stats);

  return (
    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-muted-foreground">
      {entries.map(([key, value]) => (
        <div key={key} className="rounded border border-border/70 bg-background/60 p-2">
          <div className="flex items-center justify-between gap-2">
            <span className="capitalize">{key}</span>
            <span>{value}/10</span>
          </div>
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-foreground" style={{ width: `${Math.min(100, value * 10)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function AiCard({ ai }: { ai: any }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/40 p-4 backdrop-blur-sm">
      <p className="font-bold">{ai.name}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">{ai.personality}</p>
      <p className="mt-3 line-clamp-3 text-xs leading-5 text-muted-foreground">{ai.description}</p>
      <div className="mt-4">
        <SpiderChart stats={ai.stats} />
      </div>
    </div>
  );
}

function Champions({ leaderboard }: { leaderboard: any[] }) {
  return (
    <section className="rounded-xl border border-border bg-secondary/40 p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center gap-2">
        <Crown size={18} className="text-amber-400" />
        <h2 className="text-xl font-bold">Ranking de motores</h2>
      </div>
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
        {leaderboard.slice(0, 8).map((bot, index) => (
          <div key={bot.id ?? bot.name} className="rounded-lg border border-border/70 bg-background/60 p-3">
            <p className="text-xs font-mono text-muted-foreground">#{index + 1}</p>
            <p className="font-semibold">{bot.name}</p>
            <p className="text-xs text-muted-foreground">ELO {bot.elo} · {bot.winsTotal ?? 0} torneos</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {bot.matchesPlayed ?? 0} partidas · {bot.matchWins ?? 0}W / {bot.matchLosses ?? 0}L
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TournamentStatus({ tournament }: { tournament: any }) {
  const matches = tournament?.matches ?? [];
  const finished = matches.filter((match: any) => match.status === "FINISHED").length;
  const active = matches.find((match: any) => match.status === "ACTIVE");
  const pending = matches.filter((match: any) => match.status === "PENDING").length;

  return (
    <section className="grid gap-3 md:grid-cols-3">
      <div className="rounded-xl border border-border bg-secondary/35 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
          <Activity size={15} />
          Estado
        </div>
        <p className="mt-2 text-xl font-semibold">{tournament.status === "PENDING" ? "Pre-torneo" : tournament.status === "FINISHED" ? "Finalizado" : "En juego"}</p>
      </div>
      <div className="rounded-xl border border-border bg-secondary/35 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
          <Layers3 size={15} />
          Progreso
        </div>
        <p className="mt-2 text-xl font-semibold">{finished}/{matches.length || 7} partidas</p>
        <p className="text-xs text-muted-foreground">{pending} pendientes</p>
      </div>
      <div className="rounded-xl border border-border bg-secondary/35 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
          <TimerReset size={15} />
          Foco actual
        </div>
        <p className="mt-2 text-sm font-semibold">
          {active ? `${active.player1?.name} vs ${active.player2?.name}` : tournament.winner ? `Campeón: ${tournament.winner.name}` : "Esperando primer tick"}
        </p>
      </div>
    </section>
  );
}

function MatchList({ matches, onSelect, selectedId }: { matches: any[], onSelect: (match: any) => void, selectedId: string | null }) {
  if (matches.length === 0) {
    return <p className="rounded-lg border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">No hay partidas activas en esta ronda.</p>;
  }

  return (
    <div className="space-y-2">
      {matches.map((match) => (
        <button
          key={match.id}
          onClick={() => onSelect(match)}
          className={`w-full rounded-lg border p-3 text-left transition-colors ${
            selectedId === match.id ? "border-foreground bg-foreground text-background" : "border-border bg-secondary/40 hover:border-foreground/50"
          }`}
        >
          <p className="text-xs font-mono uppercase tracking-[0.18em] opacity-70">Ronda {match.round} · {match.status}</p>
          <p className="mt-1 font-semibold">{match.player1?.name} vs {match.player2?.name}</p>
          {match.winner ? <p className="mt-1 text-xs opacity-75">Ganador: {match.winner.name}</p> : null}
        </button>
      ))}
    </div>
  );
}

function GameInfo({ game, activeMatch }: { game: Chess, activeMatch: any }) {
  if (!activeMatch) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-secondary/40 p-4 text-sm backdrop-blur-sm">
      <p className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">Lectura de partida</p>
      <p className="mt-3">Turno: {game.turn() === "w" ? activeMatch.player1?.name : activeMatch.player2?.name}</p>
      <p>Movimientos: {activeMatch.moves?.length ?? 0}</p>
      <p>Estado: {game.isGameOver() ? "Finalizada" : "En juego"}</p>
    </div>
  );
}

function Bracket({ tournament }: { tournament: any }) {
  const rounds = new Map<number, any[]>();
  for (const match of tournament?.matches ?? []) {
    rounds.set(match.round, [...(rounds.get(match.round) ?? []), match]);
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from(rounds.entries()).map(([round, matches]) => (
        <div key={round} className="rounded-xl border border-border bg-secondary/40 p-4 backdrop-blur-sm">
          <h3 className="mb-3 font-bold">Ronda {round}</h3>
          <div className="space-y-2">
            {matches.map((match) => (
              <div key={match.id} className="rounded border border-border/70 bg-background/60 p-3 text-sm">
                <p>{match.player1?.name} vs {match.player2?.name}</p>
                <p className="text-xs text-muted-foreground">{match.winner ? `Ganador: ${match.winner.name}` : match.status}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function getTournamentBots(tournament: any) {
  const bots = new Map<string, any>();

  for (const match of tournament?.matches ?? []) {
    if (match.player1) bots.set(match.player1.id, match.player1);
    if (match.player2) bots.set(match.player2.id, match.player2);
  }

  return Array.from(bots.values());
}

function BettingPanel({ tournament, betting }: { tournament: any, betting: any }) {
  const [stakes, setStakes] = useState<Record<string, number>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [comboIds, setComboIds] = useState<string[]>([]);
  const bots = useMemo(() => getTournamentBots(tournament), [tournament]);
  const hasStarted = Boolean((tournament?.matches ?? []).some((match: any) => match.status !== "PENDING"));
  const [custom, setCustom] = useState({
    finalistA: "",
    finalistB: "",
    winnerId: "",
    minWinnerKnightsAtEnd: 0,
    stake: 25,
  });

  useEffect(() => {
    if (bots.length > 0) {
      setCustom((current) => ({
        ...current,
        finalistA: current.finalistA || bots[0]?.id || "",
        finalistB: current.finalistB || bots[1]?.id || "",
        winnerId: current.winnerId || bots[0]?.id || "",
      }));
    }
  }, [bots]);

  if (!tournament) {
    return null;
  }

  const placeBet = async (market: any, stake: number) => {
    setPendingId(market.id);
    const result = await placeBetAction({
      tournamentId: tournament.id,
      type: market.type,
      marketLabel: market.label,
      stake,
      selections: market.selections,
    });
    setPendingId(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(result.success ?? "Apuesta registrada.");
    window.location.reload();
  };

  const placeCustom = async () => {
    const finalists = [custom.finalistA, custom.finalistB].filter(Boolean);
    if (finalists.length !== 2 || finalists[0] === finalists[1]) {
      toast.error("Elige dos finalistas distintos.");
      return;
    }
    if (!finalists.includes(custom.winnerId)) {
      toast.error("El ganador personalizado debe ser uno de los finalistas.");
      return;
    }
    const market = {
      id: "custom-final",
      type: "CUSTOM_FINAL",
      label: "Final personalizada",
      selections: {
        finalists,
        winnerId: custom.winnerId,
        minWinnerKnightsAtEnd: custom.minWinnerKnightsAtEnd,
      },
    };
    await placeBet(market, custom.stake);
  };

  const quickMarkets = betting?.markets ?? [];
  const recentBets = betting?.bets ?? [];
  const selectedComboMarkets = quickMarkets.filter((market: any) => comboIds.includes(market.id) && !market.locked);
  const comboStake = stakes.combo ?? 25;

  const toggleComboMarket = (marketId: string) => {
    setComboIds((current) => {
      if (current.includes(marketId)) {
        return current.filter((id) => id !== marketId);
      }
      if (current.length >= 4) {
        toast.error("Una combinada admite hasta 4 selecciones.");
        return current;
      }
      return [...current, marketId];
    });
  };

  const placeCombo = async () => {
    if (selectedComboMarkets.length < 2) {
      toast.error("Selecciona al menos dos mercados para combinar.");
      return;
    }

    await placeBet({
      id: "combo",
      type: "COMBO",
      label: `Combinada x${selectedComboMarkets.length}`,
      selections: { legs: selectedComboMarkets.map((market: any) => market.selections) },
    }, comboStake);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-border/70 bg-background/75 shadow-2xl shadow-black/10 backdrop-blur-xl">
      <div className="flex flex-col gap-4 border-b border-border/70 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
            <Coins size={15} />
            Mercado de Rodes
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Apuestas del torneo</h2>
        </div>
        <div className="rounded-full border border-border bg-secondary/60 px-4 py-2 text-sm font-semibold">
          {betting?.isAuthenticated ? `${betting.wallet} rodes` : "Entra para apostar"}
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="p-5">
          {betting?.message ? <p className="text-sm text-muted-foreground">{betting.message}</p> : null}
          <div className="grid gap-3 md:grid-cols-2">
            {quickMarkets.slice(0, 8).map((market: any) => {
              const stake = stakes[market.id] ?? 25;
              const canCombo = !market.locked && (market.type === "MATCH_WINNER" || market.type === "TOURNAMENT_WINNER");
              return (
                <div key={market.id} className="rounded-xl border border-border/70 bg-secondary/30 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold leading-snug">{market.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{market.description}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-foreground px-2.5 py-1 text-xs font-bold text-background">x{market.odds}</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <input
                      type="number"
                      min={10}
                      value={stake}
                      onChange={(event) => setStakes((current) => ({ ...current, [market.id]: Number(event.target.value) }))}
                      className="min-w-0 flex-1 rounded-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
                    />
                    <button
                      onClick={() => placeBet(market, stake)}
                      disabled={market.locked || pendingId === market.id || !betting?.isAuthenticated}
                      className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {market.locked ? "Cerrada" : pendingId === market.id ? "..." : "Apostar"}
                    </button>
                  </div>
                  {canCombo ? (
                    <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={comboIds.includes(market.id)}
                        onChange={() => toggleComboMarket(market.id)}
                        className="h-3.5 w-3.5 accent-foreground"
                      />
                      Añadir a combinada
                    </label>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="mt-4 rounded-xl border border-border/70 bg-secondary/25 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">Combinada rápida</p>
                <p className="text-xs text-muted-foreground">{selectedComboMarkets.length || 0} selecciones activas</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={10}
                  value={comboStake}
                  onChange={(event) => setStakes((current) => ({ ...current, combo: Number(event.target.value) }))}
                  className="min-w-0 rounded-full border border-border bg-background px-3 py-2 text-sm"
                />
                <button
                  onClick={placeCombo}
                  disabled={!betting?.isAuthenticated || pendingId === "combo" || selectedComboMarkets.length < 2}
                  className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background disabled:opacity-45"
                >
                  Combinar
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => setCustomOpen((value) => !value)}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-4 py-2 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            <Wand2 size={16} />
            Apuesta personalizada
            <ChevronDown size={16} className={`transition-transform ${customOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {customOpen ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 grid gap-3 rounded-xl border border-border/70 bg-secondary/30 p-4 md:grid-cols-5">
                  <select value={custom.finalistA} onChange={(event) => setCustom((value) => ({ ...value, finalistA: event.target.value }))} className="rounded-full border border-border bg-background px-3 py-2 text-sm">
                    {bots.map((bot) => <option key={bot.id} value={bot.id}>{bot.name}</option>)}
                  </select>
                  <select value={custom.finalistB} onChange={(event) => setCustom((value) => ({ ...value, finalistB: event.target.value }))} className="rounded-full border border-border bg-background px-3 py-2 text-sm">
                    {bots.map((bot) => <option key={bot.id} value={bot.id}>{bot.name}</option>)}
                  </select>
                  <select value={custom.winnerId} onChange={(event) => setCustom((value) => ({ ...value, winnerId: event.target.value }))} className="rounded-full border border-border bg-background px-3 py-2 text-sm">
                    {bots.map((bot) => <option key={bot.id} value={bot.id}>{bot.name} gana</option>)}
                  </select>
                  <select value={custom.minWinnerKnightsAtEnd} onChange={(event) => setCustom((value) => ({ ...value, minWinnerKnightsAtEnd: Number(event.target.value) }))} className="rounded-full border border-border bg-background px-3 py-2 text-sm">
                    <option value={0}>Sin condición</option>
                    <option value={1}>Con 1+ caballos</option>
                    <option value={2}>Con 2 caballos</option>
                  </select>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={10}
                      value={custom.stake}
                      onChange={(event) => setCustom((value) => ({ ...value, stake: Number(event.target.value) }))}
                      className="min-w-0 flex-1 rounded-full border border-border bg-background px-3 py-2 text-sm"
                    />
                    <button onClick={placeCustom} disabled={!betting?.isAuthenticated || pendingId === "custom-final" || hasStarted} className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background disabled:opacity-45">
                      {hasStarted ? "Cerrada" : "Crear"}
                    </button>
                  </div>
                  {hasStarted ? <p className="md:col-span-5 text-xs text-muted-foreground">Las finales personalizadas se cierran cuando el torneo empieza.</p> : null}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <aside className="border-t border-border/70 bg-secondary/20 p-5 lg:border-l lg:border-t-0">
          <div className="mb-3 flex items-center gap-2">
            <Trophy size={16} />
            <h3 className="font-semibold">Tus últimos boletos</h3>
          </div>
          {recentBets.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no hay apuestas registradas en este torneo.</p>
          ) : (
            <div className="space-y-2">
              {recentBets.map((bet: any) => (
                <div key={bet.id} className="rounded-lg border border-border/70 bg-background/60 p-3 text-sm">
                  <p className="font-medium">{bet.marketLabel}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {bet.stake} rodes · x{bet.odds} · {bet.status === "WON" ? "ganada" : bet.status === "LOST" ? "perdida" : "pendiente"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

function ForceStartButton() {
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    setPending(true);
    const result = await startNewTournament();
    setPending(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(result.success ?? "Torneo iniciado.");
  };

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background disabled:opacity-60"
    >
      <Play size={16} />
      {pending ? "Preparando..." : "Iniciar torneo"}
    </button>
  );
}

// --- COMPONENTE PRINCIPAL CON LÓGICA DE POLLING ---

export default function TournamentClient({ initialTournament, initialLeaderboard, initialBetting }: { initialTournament: any, initialLeaderboard: any[], initialBetting: any }) {
  const [tournament, setTournament] = useState(initialTournament);
  const [leaderboard, setLeaderboard] = useState(initialLeaderboard);
  const [betting, setBetting] = useState(initialBetting);
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
      if (data.betting) {
        setBetting((current: any) => ({
          ...data.betting,
          wallet: current?.wallet ?? data.betting.wallet,
          bets: current?.bets ?? [],
          isAuthenticated: current?.isAuthenticated ?? false,
        }));
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
      <TournamentStatus tournament={tournament} />
      <BettingPanel tournament={tournament} betting={betting} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div key={activeMatch?.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Chessboard 
                position={game.fen()} 
                boardOrientation={boardOrientation} 
                customDarkSquareStyle={{ backgroundColor: activeMatch?.player1?.id ? getBotBoardTheme(activeMatch.player1.id).dark : "#5e6b4f" }}
                customLightSquareStyle={{ backgroundColor: activeMatch?.player1?.id ? getBotBoardTheme(activeMatch.player1.id).light : "#ede3c8" }}
              />
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
