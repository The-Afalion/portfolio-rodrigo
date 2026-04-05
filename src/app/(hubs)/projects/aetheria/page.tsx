"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  BrainCircuit,
  Crown,
  ShieldAlert,
  Sparkles,
  Swords,
  WandSparkles,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

type PlayerId = 'P1' | 'P2';
type Mode = 'STORY' | 'LOCAL' | null;
type Phase = 'MENU' | 'PLAYING' | 'GAMEOVER';
type Ability = 'NONE' | 'RALLY' | 'WARD' | 'RUSH' | 'PULSE' | 'DRAIN' | 'THORNS' | 'BERSERK';
type Rarity = 'COMMON' | 'RARE' | 'LEGEND';
type Edge = 'top' | 'right' | 'bottom' | 'left';

type CardTemplate = {
  id: string;
  name: string;
  faction: 'SOLARI' | 'UMBRA' | 'NEUTRAL';
  cost: number;
  health: number;
  rarity: Rarity;
  ability: Ability;
  text: string;
  edges: Record<Edge, number>;
};

type CardInstance = CardTemplate & {
  instanceId: string;
  currentHp: number;
};

type BoardSlot = {
  owner: PlayerId;
  card: CardInstance;
};

type CommanderState = {
  name: string;
  title: string;
  hp: number;
  maxMana: number;
  mana: number;
  deck: CardInstance[];
  hand: CardInstance[];
};

type CombatBurst = {
  id: string;
  r: number;
  c: number;
  label: string;
  kind: 'damage' | 'heal' | 'buff';
};

type GameState = {
  phase: Phase;
  mode: Mode;
  board: (BoardSlot | null)[][];
  activePlayer: PlayerId;
  initiative: PlayerId;
  round: number;
  actionsTaken: Record<PlayerId, boolean>;
  players: Record<PlayerId, CommanderState>;
  battleLog: string[];
  storyText: string;
  winner: PlayerId | 'DRAW' | null;
};

const BOARD_SIZE = 4;
const STARTING_HAND = 4;
const STARTING_HP = 30;
const STARTING_MANA = 2;
const MAX_MANA = 10;

const CARD_LIBRARY: CardTemplate[] = [
  {
    id: 'solari-scout',
    name: 'Scout of First Light',
    faction: 'SOLARI',
    cost: 1,
    health: 3,
    rarity: 'COMMON',
    ability: 'RALLY',
    text: 'Adjacent allies gain +1 damage on every side.',
    edges: { top: 2, right: 1, bottom: 1, left: 1 },
  },
  {
    id: 'solari-guard',
    name: 'Bastion Guard',
    faction: 'SOLARI',
    cost: 2,
    health: 6,
    rarity: 'COMMON',
    ability: 'WARD',
    text: 'Receives 1 less damage from combat each round.',
    edges: { top: 1, right: 2, bottom: 3, left: 2 },
  },
  {
    id: 'solari-mender',
    name: 'Radiant Mender',
    faction: 'SOLARI',
    cost: 2,
    health: 4,
    rarity: 'COMMON',
    ability: 'PULSE',
    text: 'After combat, heals adjacent allies for 1.',
    edges: { top: 1, right: 1, bottom: 2, left: 2 },
  },
  {
    id: 'solari-lancer',
    name: 'Sunlance Rider',
    faction: 'SOLARI',
    cost: 3,
    health: 5,
    rarity: 'RARE',
    ability: 'RUSH',
    text: 'On play, deals 2 damage to adjacent enemies.',
    edges: { top: 4, right: 2, bottom: 1, left: 2 },
  },
  {
    id: 'solari-drake',
    name: 'Skyfire Drake',
    faction: 'SOLARI',
    cost: 4,
    health: 7,
    rarity: 'RARE',
    ability: 'DRAIN',
    text: 'If it deals damage this round, heal your leader for 1.',
    edges: { top: 4, right: 3, bottom: 2, left: 3 },
  },
  {
    id: 'solari-matriarch',
    name: 'Matriarch of Dawn',
    faction: 'SOLARI',
    cost: 6,
    health: 9,
    rarity: 'LEGEND',
    ability: 'RALLY',
    text: 'A legendary standard bearer that supercharges nearby allies.',
    edges: { top: 5, right: 4, bottom: 4, left: 4 },
  },
  {
    id: 'umbra-stalker',
    name: 'Rift Stalker',
    faction: 'UMBRA',
    cost: 1,
    health: 3,
    rarity: 'COMMON',
    ability: 'THORNS',
    text: 'Attackers take 1 damage back when striking this card.',
    edges: { top: 1, right: 2, bottom: 2, left: 1 },
  },
  {
    id: 'umbra-bulwark',
    name: 'Night Bulwark',
    faction: 'UMBRA',
    cost: 2,
    health: 6,
    rarity: 'COMMON',
    ability: 'WARD',
    text: 'Receives 1 less damage from combat each round.',
    edges: { top: 2, right: 2, bottom: 3, left: 1 },
  },
  {
    id: 'umbra-weaver',
    name: 'Hex Weaver',
    faction: 'UMBRA',
    cost: 3,
    health: 4,
    rarity: 'RARE',
    ability: 'RUSH',
    text: 'On play, detonates shadow shards into adjacent enemies.',
    edges: { top: 3, right: 3, bottom: 1, left: 2 },
  },
  {
    id: 'umbra-reaver',
    name: 'Reaver of Dusk',
    faction: 'UMBRA',
    cost: 4,
    health: 6,
    rarity: 'RARE',
    ability: 'BERSERK',
    text: 'When damaged, every side gains +1 damage.',
    edges: { top: 4, right: 4, bottom: 2, left: 2 },
  },
  {
    id: 'umbra-harvester',
    name: 'Soul Harvester',
    faction: 'UMBRA',
    cost: 5,
    health: 7,
    rarity: 'RARE',
    ability: 'DRAIN',
    text: 'If it wounds something, Nyx heals 1.',
    edges: { top: 4, right: 3, bottom: 4, left: 2 },
  },
  {
    id: 'umbra-queen',
    name: 'Nyx, Veil Queen',
    faction: 'UMBRA',
    cost: 6,
    health: 9,
    rarity: 'LEGEND',
    ability: 'THORNS',
    text: 'A living breach that punishes every attacker.',
    edges: { top: 5, right: 4, bottom: 5, left: 3 },
  },
  {
    id: 'neutral-engineer',
    name: 'Prism Engineer',
    faction: 'NEUTRAL',
    cost: 2,
    health: 4,
    rarity: 'COMMON',
    ability: 'PULSE',
    text: 'Stabilises adjacent allies after combat.',
    edges: { top: 2, right: 1, bottom: 2, left: 1 },
  },
  {
    id: 'neutral-sentinel',
    name: 'Mirror Sentinel',
    faction: 'NEUTRAL',
    cost: 3,
    health: 5,
    rarity: 'COMMON',
    ability: 'NONE',
    text: 'Pure efficiency on every side.',
    edges: { top: 2, right: 3, bottom: 2, left: 3 },
  },
  {
    id: 'neutral-cannon',
    name: 'Siege Prism',
    faction: 'NEUTRAL',
    cost: 4,
    health: 5,
    rarity: 'RARE',
    ability: 'RUSH',
    text: 'Immediately blasts enemies around the impact point.',
    edges: { top: 5, right: 1, bottom: 1, left: 3 },
  },
  {
    id: 'neutral-champion',
    name: 'Border Champion',
    faction: 'NEUTRAL',
    cost: 5,
    health: 8,
    rarity: 'LEGEND',
    ability: 'BERSERK',
    text: 'A relentless duelist that escalates as the fight drags on.',
    edges: { top: 4, right: 4, bottom: 3, left: 4 },
  },
];

const CARD_MAP = Object.fromEntries(CARD_LIBRARY.map((card) => [card.id, card]));

const DAWN_DECK = [
  'solari-scout',
  'solari-scout',
  'solari-guard',
  'solari-guard',
  'solari-mender',
  'solari-mender',
  'solari-lancer',
  'solari-lancer',
  'neutral-engineer',
  'neutral-sentinel',
  'neutral-sentinel',
  'solari-drake',
  'solari-drake',
  'neutral-cannon',
  'solari-matriarch',
  'neutral-champion',
];

const UMBRA_DECK = [
  'umbra-stalker',
  'umbra-stalker',
  'umbra-bulwark',
  'umbra-bulwark',
  'umbra-weaver',
  'umbra-weaver',
  'neutral-engineer',
  'neutral-sentinel',
  'neutral-sentinel',
  'umbra-reaver',
  'umbra-reaver',
  'umbra-harvester',
  'umbra-harvester',
  'neutral-cannon',
  'umbra-queen',
  'neutral-champion',
];

const DIRECTIONS: Array<{ edge: Edge; dr: number; dc: number; opposite: Edge }> = [
  { edge: 'top', dr: -1, dc: 0, opposite: 'bottom' },
  { edge: 'right', dr: 0, dc: 1, opposite: 'left' },
  { edge: 'bottom', dr: 1, dc: 0, opposite: 'top' },
  { edge: 'left', dr: 0, dc: -1, opposite: 'right' },
];

function createCardInstance(id: string): CardInstance {
  const card = CARD_MAP[id];
  return {
    ...card,
    currentHp: card.health,
    instanceId: `${id}-${Math.random().toString(36).slice(2, 9)}`,
  };
}

function shuffle<T>(items: T[]) {
  const clone = [...items];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[swap]] = [clone[swap], clone[index]];
  }
  return clone;
}

function buildDeck(list: string[]) {
  return shuffle(list.map(createCardInstance));
}

function drawCards(player: CommanderState, count: number) {
  const drawn = player.deck.slice(0, count);
  return {
    ...player,
    deck: player.deck.slice(count),
    hand: [...player.hand, ...drawn],
  };
}

function emptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array<BoardSlot | null>(BOARD_SIZE).fill(null));
}

function otherPlayer(player: PlayerId): PlayerId {
  return player === 'P1' ? 'P2' : 'P1';
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function withLog(log: string[], message: string) {
  return [message, ...log].slice(0, 7);
}

function createInitialGame(mode: Mode): GameState {
  const p1Base: CommanderState = {
    name: 'Seraphine Vale',
    title: 'Warden of the Prism Bastion',
    hp: STARTING_HP,
    maxMana: STARTING_MANA,
    mana: STARTING_MANA,
    deck: buildDeck(DAWN_DECK),
    hand: [],
  };

  const p2Base: CommanderState = {
    name: mode === 'STORY' ? 'Nyx Vesper' : 'Cassian Dusk',
    title: mode === 'STORY' ? 'Queen Beyond the Veil' : 'Master of the Hollow Court',
    hp: STARTING_HP,
    maxMana: STARTING_MANA,
    mana: STARTING_MANA,
    deck: buildDeck(UMBRA_DECK),
    hand: [],
  };

  return {
    phase: 'PLAYING',
    mode,
    board: emptyBoard(),
    activePlayer: 'P1',
    initiative: 'P1',
    round: 1,
    actionsTaken: { P1: false, P2: false },
    players: {
      P1: drawCards(p1Base, STARTING_HAND),
      P2: drawCards(p2Base, STARTING_HAND),
    },
    battleLog: [
      mode === 'STORY'
        ? 'Nyx abre la grieta sobre Bastion Prism. Cada borde del tablero late como un campo de guerra.'
        : 'Duelo local iniciado. Controla el cuadrante y rompe la línea rival.',
    ],
    storyText:
      mode === 'STORY'
        ? 'Acto I. La reina Nyx intenta devorar el Bastión Prisma desde el borde norte. Aguanta la brecha y castiga cada flanco.'
        : 'Modo duelo. Cada ronda ambos jugadores despliegan una carta y el tablero resuelve el choque de bordes.',
    winner: null,
  };
}

function getAdjacentCoords(r: number, c: number) {
  return DIRECTIONS.map((direction) => ({
    r: r + direction.dr,
    c: c + direction.dc,
    edge: direction.edge,
    opposite: direction.opposite,
  })).filter(({ r: nr, c: nc }) => nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE);
}

function getRallyBonus(board: (BoardSlot | null)[][], r: number, c: number, owner: PlayerId) {
  let bonus = 0;
  for (const neighbor of getAdjacentCoords(r, c)) {
    const slot = board[neighbor.r][neighbor.c];
    if (slot && slot.owner === owner && slot.card.ability === 'RALLY') {
      bonus += 1;
    }
  }
  return bonus;
}

function getOutgoingPower(board: (BoardSlot | null)[][], r: number, c: number, slot: BoardSlot, edge: Edge) {
  let power = slot.card.edges[edge];
  power += getRallyBonus(board, r, c, slot.owner);

  if (slot.card.ability === 'BERSERK' && slot.card.currentHp <= Math.ceil(slot.card.health / 2)) {
    power += 1;
  }

  return power;
}

function evaluateExhaustion(game: GameState) {
  const noCardsLeft =
    game.players.P1.hand.length === 0 &&
    game.players.P2.hand.length === 0 &&
    game.players.P1.deck.length === 0 &&
    game.players.P2.deck.length === 0;

  if (!noCardsLeft) return null;

  const occupied = game.board.flat().some(Boolean);
  if (occupied) return null;

  if (game.players.P1.hp > game.players.P2.hp) return 'P1' as const;
  if (game.players.P2.hp > game.players.P1.hp) return 'P2' as const;
  return 'DRAW' as const;
}

function applyOnPlayEffect(
  board: (BoardSlot | null)[][],
  r: number,
  c: number,
  owner: PlayerId,
  bursts: CombatBurst[],
  log: string[],
) {
  const slot = board[r][c];
  if (!slot) {
    return { board, bursts, log };
  }

  const nextBoard = board.map((row) =>
    row.map((cell) => (cell ? { owner: cell.owner, card: { ...cell.card } } : null)),
  );
  const actor = nextBoard[r][c]!;
  let nextLog = log;

  if (actor.card.ability === 'RUSH') {
    for (const neighbor of getAdjacentCoords(r, c)) {
      const target = nextBoard[neighbor.r][neighbor.c];
      if (target && target.owner !== owner) {
        target.card.currentHp -= 2;
        bursts.push({
          id: `${target.card.instanceId}-rush`,
          r: neighbor.r,
          c: neighbor.c,
          label: '-2',
          kind: 'damage',
        });

        if (target.card.currentHp <= 0) {
          nextBoard[neighbor.r][neighbor.c] = null;
          nextLog = withLog(nextLog, `${actor.card.name} destruye a ${target.card.name} al entrar en juego.`);
        }
      }
    }
  }

  return { board: nextBoard, bursts, log: nextLog };
}

function resolveRound(game: GameState) {
  const board = game.board.map((row) =>
    row.map((cell) => (cell ? { owner: cell.owner, card: { ...cell.card } } : null)),
  );
  const incoming: Record<string, number> = {};
  const heals: Record<string, number> = {};
  const damageDealt: Record<string, number> = {};
  const bursts: CombatBurst[] = [];
  let p1LeaderDelta = 0;
  let p2LeaderDelta = 0;
  let battleLog = game.battleLog;

  for (let r = 0; r < BOARD_SIZE; r += 1) {
    for (let c = 0; c < BOARD_SIZE; c += 1) {
      const slot = board[r][c];
      if (!slot) continue;

      for (const direction of DIRECTIONS) {
        const power = getOutgoingPower(board, r, c, slot, direction.edge);
        if (power <= 0) continue;

        const nr = r + direction.dr;
        const nc = c + direction.dc;

        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
          const target = board[nr][nc];

          if (target && target.owner !== slot.owner) {
            incoming[target.card.instanceId] = (incoming[target.card.instanceId] ?? 0) + power;
            damageDealt[slot.card.instanceId] = (damageDealt[slot.card.instanceId] ?? 0) + power;
            bursts.push({
              id: `${slot.card.instanceId}-${target.card.instanceId}-${direction.edge}`,
              r: nr,
              c: nc,
              label: `-${power}`,
              kind: 'damage',
            });

            if (target.card.ability === 'THORNS') {
              incoming[slot.card.instanceId] = (incoming[slot.card.instanceId] ?? 0) + 1;
            }
          }
        } else {
          if (slot.owner === 'P1' && direction.edge === 'top' && r === 0) {
            p2LeaderDelta -= power;
            damageDealt[slot.card.instanceId] = (damageDealt[slot.card.instanceId] ?? 0) + power;
          }

          if (slot.owner === 'P2' && direction.edge === 'bottom' && r === BOARD_SIZE - 1) {
            p1LeaderDelta -= power;
            damageDealt[slot.card.instanceId] = (damageDealt[slot.card.instanceId] ?? 0) + power;
          }
        }
      }
    }
  }

  for (let r = 0; r < BOARD_SIZE; r += 1) {
    for (let c = 0; c < BOARD_SIZE; c += 1) {
      const slot = board[r][c];
      if (!slot) continue;

      if (slot.card.ability === 'PULSE') {
        for (const neighbor of getAdjacentCoords(r, c)) {
          const target = board[neighbor.r][neighbor.c];
          if (target && target.owner === slot.owner) {
            heals[target.card.instanceId] = (heals[target.card.instanceId] ?? 0) + 1;
            bursts.push({
              id: `${target.card.instanceId}-pulse`,
              r: neighbor.r,
              c: neighbor.c,
              label: '+1',
              kind: 'heal',
            });
          }
        }
      }
    }
  }

  for (let r = 0; r < BOARD_SIZE; r += 1) {
    for (let c = 0; c < BOARD_SIZE; c += 1) {
      const slot = board[r][c];
      if (!slot) continue;

      let damage = incoming[slot.card.instanceId] ?? 0;
      const healing = heals[slot.card.instanceId] ?? 0;

      if (slot.card.ability === 'WARD' && damage > 0) {
        damage = Math.max(0, damage - 1);
      }

      slot.card.currentHp = clamp(slot.card.currentHp - damage + healing, 0, slot.card.health);

      if (slot.card.ability === 'DRAIN' && (damageDealt[slot.card.instanceId] ?? 0) > 0) {
        if (slot.owner === 'P1') p1LeaderDelta += 1;
        if (slot.owner === 'P2') p2LeaderDelta += 1;
      }

      if (slot.card.currentHp <= 0) {
        battleLog = withLog(battleLog, `${slot.card.name} cae en el cuadrante ${r + 1}-${c + 1}.`);
        board[r][c] = null;
      }
    }
  }

  const p1 = {
    ...game.players.P1,
    hp: clamp(game.players.P1.hp + p1LeaderDelta, 0, STARTING_HP),
  };
  const p2 = {
    ...game.players.P2,
    hp: clamp(game.players.P2.hp + p2LeaderDelta, 0, STARTING_HP),
  };

  if (p2LeaderDelta < 0) {
    battleLog = withLog(battleLog, `La línea solar golpea a ${p2.name} por ${Math.abs(p2LeaderDelta)}.`);
  }
  if (p1LeaderDelta < 0) {
    battleLog = withLog(battleLog, `La grieta umbral golpea a ${p1.name} por ${Math.abs(p1LeaderDelta)}.`);
  }

  const nextInitiative = otherPlayer(game.initiative);
  const nextRound = game.round + 1;
  const p1Prepared = drawCards(
    { ...p1, maxMana: Math.min(MAX_MANA, p1.maxMana + 1), mana: Math.min(MAX_MANA, p1.maxMana + 1) },
    1,
  );
  const p2Prepared = drawCards(
    { ...p2, maxMana: Math.min(MAX_MANA, p2.maxMana + 1), mana: Math.min(MAX_MANA, p2.maxMana + 1) },
    1,
  );

  let winner: PlayerId | 'DRAW' | null = null;
  if (p1.hp <= 0 && p2.hp <= 0) winner = 'DRAW';
  else if (p1.hp <= 0) winner = 'P2';
  else if (p2.hp <= 0) winner = 'P1';

  const candidateState: GameState = {
    ...game,
    board,
    round: nextRound,
    initiative: nextInitiative,
    activePlayer: nextInitiative,
    actionsTaken: { P1: false, P2: false },
    players: { P1: p1Prepared, P2: p2Prepared },
    battleLog,
    storyText:
      game.mode === 'STORY'
        ? nextRound < 5
          ? 'La brecha se expande. Aprovecha los huecos para hacer daño directo con tus bordes superiores.'
          : 'Nyx empieza a tensar la grieta. Si dejas la fila superior libre, su presión será letal.'
        : 'Nueva ronda. Ambos bandos rearman su mano y sus reservas de éter.',
    winner,
  };

  if (!winner) {
    const exhaustionWinner = evaluateExhaustion(candidateState);
    if (exhaustionWinner) {
      candidateState.winner = exhaustionWinner;
      candidateState.phase = 'GAMEOVER';
      candidateState.storyText = 'Ambos mazos se agotaron y la batalla se decidió por resistencia.';
    }
  }

  if (candidateState.winner) {
    candidateState.phase = 'GAMEOVER';
  }

  return { state: candidateState, bursts };
}

function evaluatePlacement(game: GameState, card: CardInstance, r: number, c: number) {
  let score = 0;
  const board = game.board;

  for (const direction of DIRECTIONS) {
    const nr = r + direction.dr;
    const nc = c + direction.dc;
    const power = card.edges[direction.edge];

    if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
      const target = board[nr][nc];
      if (target?.owner === 'P1') {
        score += power * 2;
        score -= target.card.edges[direction.opposite];
      }
      if (target?.owner === 'P2') {
        score += 1;
      }
    } else if (r === BOARD_SIZE - 1 && direction.edge === 'bottom') {
      score += power * 1.6;
    }
  }

  if (card.ability === 'RUSH') score += 3;
  if (card.ability === 'THORNS') score += 2;
  if (card.ability === 'WARD') score += 2;
  if (card.cost > game.players.P2.mana) score = -999;

  return score;
}

function pickAiMove(game: GameState) {
  const hand = game.players.P2.hand.filter((card) => card.cost <= game.players.P2.mana);
  if (hand.length === 0) return null;

  let best: { card: CardInstance; r: number; c: number; score: number } | null = null;

  for (const card of hand) {
    for (let r = 0; r < BOARD_SIZE; r += 1) {
      for (let c = 0; c < BOARD_SIZE; c += 1) {
        if (game.board[r][c]) continue;
        const score = evaluatePlacement(game, card, r, c);
        if (!best || score > best.score) {
          best = { card, r, c, score };
        }
      }
    }
  }

  return best;
}

function renderEdgeValue(value: number, className: string) {
  return <div className={className}>{value}</div>;
}

function rarityClass(rarity: Rarity) {
  if (rarity === 'LEGEND') return 'border-amber-300/60 bg-amber-200/10';
  if (rarity === 'RARE') return 'border-cyan-300/50 bg-cyan-200/10';
  return 'border-white/10 bg-white/5';
}

function abilityLabel(ability: Ability) {
  return ability === 'NONE' ? 'Sin habilidad' : ability;
}

export default function AetheriaPage() {
  const [game, setGame] = useState<GameState>({
    phase: 'MENU',
    mode: null,
    board: emptyBoard(),
    activePlayer: 'P1',
    initiative: 'P1',
    round: 1,
    actionsTaken: { P1: false, P2: false },
    players: {
      P1: { name: '', title: '', hp: STARTING_HP, maxMana: STARTING_MANA, mana: STARTING_MANA, deck: [], hand: [] },
      P2: { name: '', title: '', hp: STARTING_HP, maxMana: STARTING_MANA, mana: STARTING_MANA, deck: [], hand: [] },
    },
    battleLog: [],
    storyText: '',
    winner: null,
  });
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [bursts, setBursts] = useState<CombatBurst[]>([]);

  const selectedCard = useMemo(
    () => game.players[game.activePlayer].hand.find((card) => card.instanceId === selectedCardId) ?? null,
    [game, selectedCardId],
  );

  useEffect(() => {
    if (bursts.length === 0) return;
    const timer = window.setTimeout(() => setBursts([]), 950);
    return () => window.clearTimeout(timer);
  }, [bursts]);

  useEffect(() => {
    if (game.phase !== 'PLAYING' || game.mode !== 'STORY' || game.activePlayer !== 'P2') return;

    const timer = window.setTimeout(() => {
      const move = pickAiMove(game);
      if (!move) {
        passTurn();
        return;
      }
      placeCard(move.card.instanceId, move.r, move.c);
    }, 850);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game]);

  const startGame = (mode: Mode) => {
    setSelectedCardId(null);
    setBursts([]);
    setGame(createInitialGame(mode));
  };

  const advanceAfterAction = (stateAfterAction: GameState, newBursts: CombatBurst[] = []) => {
    const bothPlayed = stateAfterAction.actionsTaken.P1 && stateAfterAction.actionsTaken.P2;
    if (bothPlayed) {
      const resolution = resolveRound(stateAfterAction);
      setBursts([...newBursts, ...resolution.bursts]);
      setGame(resolution.state);
    } else {
      setBursts(newBursts);
      setGame({
        ...stateAfterAction,
        activePlayer: otherPlayer(stateAfterAction.activePlayer),
      });
    }
  };

  const placeCard = (instanceId: string, r: number, c: number) => {
    setSelectedCardId(null);

    setGame((current) => {
      if (current.phase !== 'PLAYING') return current;
      if (current.board[r][c]) return current;

      const active = current.activePlayer;
      const player = current.players[active];
      const card = player.hand.find((entry) => entry.instanceId === instanceId);
      if (!card || card.cost > player.mana) return current;

      const board = current.board.map((row) => row.map((cell) => (cell ? { owner: cell.owner, card: { ...cell.card } } : null)));
      board[r][c] = { owner: active, card: { ...card } };

      const players = {
        ...current.players,
        [active]: {
          ...player,
          mana: player.mana - card.cost,
          hand: player.hand.filter((entry) => entry.instanceId !== instanceId),
        },
      };

      const actionsTaken = { ...current.actionsTaken, [active]: true };
      const prepared = {
        ...current,
        board,
        players,
        actionsTaken,
        battleLog: withLog(current.battleLog, `${players[active].name} despliega ${card.name}.`),
      };

      const result = applyOnPlayEffect(
        prepared.board,
        r,
        c,
        active,
        [],
        prepared.battleLog,
      );

      const nextState = {
        ...prepared,
        board: result.board,
        battleLog: result.log,
      };

      queueMicrotask(() => advanceAfterAction(nextState, result.bursts));
      return current;
    });
  };

  const passTurn = () => {
    setSelectedCardId(null);

    setGame((current) => {
      if (current.phase !== 'PLAYING') return current;

      const active = current.activePlayer;
      const nextState = {
        ...current,
        actionsTaken: { ...current.actionsTaken, [active]: true },
        battleLog: withLog(current.battleLog, `${current.players[active].name} cede la iniciativa.`),
      };

      queueMicrotask(() => advanceAfterAction(nextState));
      return current;
    });
  };

  const activePlayer = game.players[game.activePlayer];
  const canAct = game.phase === 'PLAYING' && (game.mode === 'LOCAL' || game.activePlayer === 'P1');

  const renderCard = (card: CardInstance, owner: PlayerId | null, selectable: boolean) => (
    <motion.button
      key={card.instanceId}
      layout
      whileHover={selectable ? { y: -6, scale: 1.01 } : undefined}
      onClick={selectable ? () => setSelectedCardId(card.instanceId) : undefined}
      className={`relative h-[170px] w-[132px] rounded-[24px] border p-3 text-left shadow-[0_18px_45px_rgba(0,0,0,0.35)] transition ${
        rarityClass(card.rarity)
      } ${selectedCardId === card.instanceId ? 'ring-2 ring-cyan-300/70' : ''} ${
        selectable ? 'cursor-pointer' : 'cursor-default'
      } ${owner === 'P1' ? 'bg-gradient-to-b from-amber-950/90 to-slate-950/95' : owner === 'P2' ? 'bg-gradient-to-b from-violet-950/90 to-slate-950/95' : 'bg-slate-950/90'}`}
    >
      <div className="absolute left-1/2 top-2 -translate-x-1/2 text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-300">
        {card.name}
      </div>

      {renderEdgeValue(card.edges.top, 'absolute left-1/2 top-9 -translate-x-1/2 rounded-full bg-white/10 px-2 py-1 text-xs font-bold text-white')}
      {renderEdgeValue(card.edges.bottom, 'absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-2 py-1 text-xs font-bold text-white')}
      {renderEdgeValue(card.edges.left, 'absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-2 py-1 text-xs font-bold text-white')}
      {renderEdgeValue(card.edges.right, 'absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-2 py-1 text-xs font-bold text-white')}

      <div className="mt-10 flex h-full flex-col justify-between rounded-[18px] border border-white/10 bg-black/25 p-3">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-slate-400">
          <span>{card.faction}</span>
          <span>{card.cost}E</span>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-white">{abilityLabel(card.ability)}</p>
          <p className="text-xs leading-5 text-slate-300">{card.text}</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="rounded-full bg-rose-400/15 px-2 py-1 text-xs font-semibold text-rose-200">
            HP {card.currentHp}/{card.health}
          </span>
          {owner && (
            <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.22em] ${owner === 'P1' ? 'bg-amber-300/15 text-amber-200' : 'bg-violet-300/15 text-violet-200'}`}>
              {owner}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );

  return (
    <main className="min-h-screen w-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_rgba(10,15,28,1)_45%,_rgba(5,7,16,1)_100%)] text-slate-100">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '42px 42px' }} />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1500px] flex-col px-6 py-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/projects" className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/50 px-4 py-2 text-sm text-slate-300 transition hover:text-white">
            <ArrowLeft size={16} /> Volver al hub
          </Link>
          <div className="rounded-full border border-cyan-300/15 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100">
            Aetheria Reforged
          </div>
        </div>

        {game.phase === 'MENU' && (
          <div className="flex flex-1 items-center justify-center">
            <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[32px] border border-white/10 bg-slate-950/70 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-amber-300/12 p-3 text-amber-200">
                    <Sparkles size={30} />
                  </div>
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.35em] text-cyan-300/75">Nuevo capítulo</p>
                    <h1 className="mt-2 text-5xl font-semibold tracking-tight">Aetheria: Siege of the Prism Bastion</h1>
                  </div>
                </div>

                <p className="mt-8 max-w-3xl text-lg leading-8 text-slate-300">
                  He rehecho Aetheria como un card battler táctico por rondas. Cada carta ocupa un cuadrante del tablero y sus cuatro bordes golpean al final de la ronda. Si una cara enemiga queda adyacente, ambas se hieren a la vez. Si una fila queda abierta hacia el comandante rival, el borde expuesto castiga directamente su vida.
                </p>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cyan-300">Ritmo</p>
                    <p className="mt-3 text-sm leading-6 text-slate-300">Cada ronda ambos bandos juegan una carta y el tablero resuelve en simultáneo.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cyan-300">Identidad</p>
                    <p className="mt-3 text-sm leading-6 text-slate-300">Solari protege y sinergiza. Umbra presiona, refleja daño y remata huecos.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cyan-300">Objetivo</p>
                    <p className="mt-3 text-sm leading-6 text-slate-300">Bajar la vida del comandante rival a 0 o ganar por agotamiento táctico.</p>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    onClick={() => startGame('STORY')}
                    className="flex items-center gap-2 rounded-full border border-amber-300/45 bg-amber-300 px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-slate-950 transition hover:scale-[1.02]"
                  >
                    <BookOpen size={16} /> Campaña contra Nyx
                  </button>
                  <button
                    onClick={() => startGame('LOCAL')}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-slate-100 transition hover:bg-white/10"
                  >
                    <Swords size={16} /> Duelo local
                  </button>
                </div>
              </div>

              <div className="rounded-[32px] border border-white/10 bg-slate-950/70 p-8 backdrop-blur-xl">
                <h2 className="text-2xl font-semibold">Cómo se gana aquí</h2>
                <div className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
                  <p>1. Coloca una carta en un espacio vacío y paga su coste de éter.</p>
                  <p>2. Cuando ambos terminan, cada borde golpea a la carta enemiga que tenga delante.</p>
                  <p>3. Si una carta Solari llega a la fila superior, su borde superior daña a Nyx. Si Umbra alcanza la fila inferior, golpea a Seraphine.</p>
                  <p>4. Las habilidades dan ritmo: `RUSH` impacta al entrar, `RALLY` mejora vecinos, `WARD` reduce daño, `THORNS` refleja, `DRAIN` sostiene a su líder.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {game.phase !== 'MENU' && (
          <div className="mt-6 grid flex-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)_340px]">
            <div className="space-y-6">
              <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5 backdrop-blur-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.35em] text-amber-200/70">Comandante</p>
                    <h2 className="mt-2 text-2xl font-semibold">{game.players.P1.name}</h2>
                    <p className="text-sm text-slate-400">{game.players.P1.title}</p>
                  </div>
                  <Crown className="text-amber-200" />
                </div>

                <div className="mt-5 space-y-3 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>Vida</span>
                    <span className="font-semibold text-white">{game.players.P1.hp}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-rose-400" style={{ width: `${(game.players.P1.hp / STARTING_HP) * 100}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Éter</span>
                    <span className="font-semibold text-white">{game.players.P1.mana}/{game.players.P1.maxMana}</span>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: game.players.P1.maxMana }).map((_, index) => (
                      <div key={index} className={`h-2 flex-1 rounded-full ${index < game.players.P1.mana ? 'bg-cyan-300' : 'bg-white/10'}`} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <WandSparkles className="text-cyan-200" />
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.35em] text-cyan-300/75">Crónica</p>
                    <h3 className="mt-1 text-lg font-semibold">Historia y objetivo</h3>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-300">{game.storyText}</p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="rounded-[28px] border border-white/10 bg-slate-950/65 p-5 backdrop-blur-xl">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.35em] text-cyan-300/75">Ronda {game.round}</p>
                    <h2 className="mt-1 text-2xl font-semibold">
                      {game.phase === 'GAMEOVER'
                        ? game.winner === 'DRAW'
                          ? 'Empate en la grieta'
                          : `${game.winner === 'P1' ? game.players.P1.name : game.players.P2.name} prevalece`
                        : `Turno de ${game.players[game.activePlayer].name}`}
                    </h2>
                  </div>

                  {game.phase === 'PLAYING' && (
                    <button
                      onClick={passTurn}
                      disabled={!canAct}
                      className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Pasar
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-slate-950/70 p-5 backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.35em] text-violet-300/70">Enemigo</p>
                    <p className="mt-1 text-lg font-semibold">{game.players.P2.name}</p>
                  </div>
                  <div className="text-right text-sm text-slate-300">
                    <p>Vida {game.players.P2.hp}</p>
                    <p>Mano {game.players.P2.hand.length}</p>
                  </div>
                </div>

                <div className="mb-5 flex min-h-[182px] flex-wrap gap-3 rounded-[24px] border border-white/10 bg-black/20 p-4">
                  {game.mode === 'STORY'
                    ? game.players.P2.hand.map((card) => (
                        <div key={card.instanceId} className="flex h-[170px] w-[132px] items-center justify-center rounded-[24px] border border-white/10 bg-slate-900/90 text-slate-500">
                          <BrainCircuit size={28} />
                        </div>
                      ))
                    : game.players.P2.hand.map((card) => renderCard(card, 'P2', game.activePlayer === 'P2' && game.phase === 'PLAYING'))}
                </div>

                <div className="relative mx-auto grid aspect-square w-full max-w-[720px] grid-cols-4 gap-3 rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.1),_rgba(3,7,18,0.92)_55%)] p-4 shadow-[inset_0_0_80px_rgba(8,47,73,0.35)]">
                  {game.board.map((row, r) =>
                    row.map((slot, c) => (
                      <button
                        key={`${r}-${c}`}
                        onClick={() => selectedCard && canAct && placeCard(selectedCard.instanceId, r, c)}
                        disabled={!selectedCard || !!slot || !canAct || game.phase !== 'PLAYING'}
                        className={`relative flex min-h-[132px] items-center justify-center rounded-[24px] border transition ${slot ? 'border-white/10 bg-white/[0.03]' : 'border-white/10 bg-white/[0.02]'} ${selectedCard && !slot && canAct ? 'hover:border-cyan-300/40 hover:bg-cyan-300/5' : ''}`}
                      >
                        {!slot && selectedCard && canAct && (
                          <div className="absolute inset-0 rounded-[24px] border border-dashed border-cyan-300/25" />
                        )}

                        {slot && renderCard(slot.card, slot.owner, false)}

                        <AnimatePresence>
                          {bursts.filter((burst) => burst.r === r && burst.c === c).map((burst) => (
                            <motion.div
                              key={burst.id}
                              initial={{ y: 18, opacity: 0 }}
                              animate={{ y: -18, opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className={`absolute z-20 rounded-full px-3 py-1 text-sm font-bold ${burst.kind === 'damage' ? 'bg-rose-500/20 text-rose-200' : burst.kind === 'heal' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-cyan-500/20 text-cyan-200'}`}
                            >
                              {burst.label}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </button>
                    )),
                  )}
                </div>

                <div className="mt-5 flex min-h-[182px] flex-wrap gap-3 rounded-[24px] border border-white/10 bg-black/20 p-4">
                  {game.players.P1.hand.map((card) => renderCard(card, 'P1', canAct && game.activePlayer === 'P1' && game.phase === 'PLAYING'))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5 backdrop-blur-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.35em] text-violet-300/75">Rival</p>
                    <h2 className="mt-2 text-2xl font-semibold">{game.players.P2.name}</h2>
                    <p className="text-sm text-slate-400">{game.players.P2.title}</p>
                  </div>
                  <ShieldAlert className="text-violet-200" />
                </div>

                <div className="mt-5 space-y-3 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>Vida</span>
                    <span className="font-semibold text-white">{game.players.P2.hp}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-violet-400" style={{ width: `${(game.players.P2.hp / STARTING_HP) * 100}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Éter</span>
                    <span className="font-semibold text-white">{game.players.P2.mana}/{game.players.P2.maxMana}</span>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: game.players.P2.maxMana }).map((_, index) => (
                      <div key={index} className={`h-2 flex-1 rounded-full ${index < game.players.P2.mana ? 'bg-violet-300' : 'bg-white/10'}`} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5 backdrop-blur-xl">
                <p className="font-mono text-xs uppercase tracking-[0.35em] text-cyan-300/75">Carta seleccionada</p>
                <div className="mt-4">
                  {selectedCard ? (
                    <div className="space-y-3 text-sm leading-7 text-slate-300">
                      <h3 className="text-xl font-semibold text-white">{selectedCard.name}</h3>
                      <p>{selectedCard.text}</p>
                      <p className="text-cyan-200">Coste {selectedCard.cost} | Vida {selectedCard.currentHp}</p>
                      <p className="text-slate-400">Bordes {selectedCard.edges.top}/{selectedCard.edges.right}/{selectedCard.edges.bottom}/{selectedCard.edges.left}</p>
                    </div>
                  ) : (
                    <p className="text-sm leading-7 text-slate-400">
                      Elige una carta de tu mano y colócala en un cuadrante vacío. La fila superior daña al rival si queda despejada para Solari; la inferior hace lo mismo para Umbra.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5 backdrop-blur-xl">
                <p className="font-mono text-xs uppercase tracking-[0.35em] text-cyan-300/75">Registro táctico</p>
                <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                  {game.battleLog.map((entry) => (
                    <p key={entry} className="rounded-2xl border border-white/6 bg-white/5 px-3 py-2">
                      {entry}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {game.phase === 'GAMEOVER' && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80 px-6 backdrop-blur-md">
            <div className="pointer-events-auto w-full max-w-2xl rounded-[32px] border border-white/10 bg-slate-950/92 p-8 text-center shadow-[0_0_80px_rgba(0,0,0,0.45)]">
              <p className="font-mono text-xs uppercase tracking-[0.35em] text-cyan-300/75">Duelo resuelto</p>
              <h2 className="mt-4 text-4xl font-semibold">
                {game.winner === 'DRAW'
                  ? 'Ningún bastión resistió'
                  : `${game.winner === 'P1' ? game.players.P1.name : game.players.P2.name} domina la grieta`}
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-300">{game.storyText}</p>
              <div className="mt-8 flex justify-center gap-4">
                <button
                  onClick={() => startGame(game.mode)}
                  className="rounded-full border border-amber-300/45 bg-amber-300 px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-slate-950"
                >
                  Revancha
                </button>
                <button
                  onClick={() => {
                    setSelectedCardId(null);
                    setBursts([]);
                    setGame((prev) => ({ ...prev, phase: 'MENU', mode: null, winner: null }));
                  }}
                  className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-slate-100"
                >
                  Volver al menú
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

