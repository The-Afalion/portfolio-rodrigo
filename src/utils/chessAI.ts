import { Chess } from "chess.js";
import {
  evaluatePosition,
  rankMoves,
  searchBestMove,
  type EngineMove,
  type EngineStyle,
} from "@/lib/chess-engine";

export type EstiloIA = "agresivo" | "defensivo" | "equilibrado" | "caotico";

export interface AnalisisMovimientoIA {
  san: string;
  from: string;
  to: string;
  promotion?: string;
  score: number;
  quality: number;
  bestQuality: number;
  rank: number;
  classification: "best" | "strong" | "risky" | "blunder";
  tags: {
    capture: boolean;
    check: boolean;
    castle: boolean;
    promotion: boolean;
  };
}

const OPENING_BOOK: Record<EstiloIA, string[]> = {
  agresivo: ["e4", "d4", "Nf3", "Bc4", "f4", "c4"],
  defensivo: ["d4", "Nf3", "c4", "e3", "g3", "b3"],
  equilibrado: ["e4", "d4", "Nf3", "c4", "e3", "Nc3"],
  caotico: ["Nf3", "c4", "b3", "g3", "e4", "f4"],
};

function pickOpeningMove(partida: Chess, elo: number, estilo: EstiloIA): AnalisisMovimientoIA | null {
  const historyLength =
    (partida as unknown as { history?: () => string[] }).history?.().length ??
    Math.max(0, (Number(partida.fen().split(" ")[5]) - 1) * 2 + (partida.turn() === "b" ? 1 : 0));
  if (historyLength >= 8) {
    return null;
  }

  const legalMoves = partida.moves({ verbose: true }) as Array<{
    san: string;
    from: string;
    to: string;
    promotion?: string;
    captured?: string;
    flags: string;
  }>;
  const book = OPENING_BOOK[estilo] ?? OPENING_BOOK.equilibrado;
  const bookCandidates = book
    .map((san) => legalMoves.find((move) => move.san === san))
    .filter((move): move is NonNullable<typeof move> => Boolean(move));

  if (bookCandidates.length === 0) {
    return null;
  }

  const bookChance = elo >= 1700 ? 0.72 : elo >= 1200 ? 0.52 : elo >= 800 ? 0.34 : 0.18;
  if (Math.random() > bookChance) {
    return null;
  }

  const move = bookCandidates[Math.floor(Math.random() * bookCandidates.length)];

  return {
    san: move.san,
    from: move.from,
    to: move.to,
    promotion: move.promotion,
    score: 0,
    quality: 0,
    bestQuality: 0,
    rank: 0,
    classification: "strong",
    tags: {
      capture: Boolean(move.captured),
      check: move.san.includes("+") || move.san.includes("#"),
      castle: move.flags.includes("k") || move.flags.includes("q"),
      promotion: Boolean(move.promotion),
    },
  };
}

function toLegacyAnalysis(move: EngineMove): AnalisisMovimientoIA {
  return {
    san: move.san,
    from: move.from,
    to: move.to,
    promotion: move.promotion,
    score: move.score,
    quality: move.quality,
    bestQuality: move.bestQuality,
    rank: move.rank,
    classification: move.classification,
    tags: move.tags,
  };
}

export function evaluarTablero(partida: Chess): number {
  return evaluatePosition(partida);
}

export function analizarMovimientoIA(partida: Chess, elo: number, estilo: EstiloIA): AnalisisMovimientoIA | null {
  const bookMove = pickOpeningMove(partida, elo, estilo);
  if (bookMove) {
    return bookMove;
  }

  const depth = elo >= 1900 ? 4 : elo >= 1200 ? 3 : 2;
  const maxNodes = elo >= 1900 ? 150_000 : elo >= 1200 ? 70_000 : 28_000;
  const timeLimitMs = elo >= 1900 ? 1_700 : elo >= 1200 ? 950 : 520;

  const result = searchBestMove(partida, {
    depth,
    maxNodes,
    timeLimitMs,
    elo,
    style: estilo,
  });

  return result ? toLegacyAnalysis(result) : null;
}

export function obtenerMovimientoIA(partida: Chess, elo: number, estilo: EstiloIA): string | null {
  return analizarMovimientoIA(partida, elo, estilo)?.san ?? null;
}

export function analizarMovimientoDeterminista(fen: string, style?: EngineStyle) {
  return searchBestMove(fen, {
    depth: 4,
    maxNodes: 140_000,
    timeLimitMs: 1_600,
    style,
    deterministic: true,
  });
}

export function ordenarMovimientos(fen: string) {
  return rankMoves(fen, { depth: 3 });
}
