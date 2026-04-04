import { Chess } from "chess.js";

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

type ChessMoveLike = {
  san: string;
  flags: string;
  to: string;
  captured?: string;
  promotion?: string;
};

type BoardPiece = {
  type: string;
  color: "w" | "b";
} | null;

const INFINITY_SCORE = 100_000;
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 335,
  r: 500,
  q: 900,
  k: 20_000,
};

const PAWN_TABLE = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [6, 6, 12, 26, 26, 12, 6, 6],
  [0, 0, 0, 22, 22, 0, 0, 0],
  [6, -4, -10, 0, 0, -10, -4, 6],
  [6, 12, 12, -18, -18, 12, 12, 6],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const KNIGHT_TABLE = [
  [-50, -35, -30, -30, -30, -30, -35, -50],
  [-35, -10, 0, 5, 5, 0, -10, -35],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-35, -10, 0, 0, 0, 0, -10, -35],
  [-50, -35, -30, -30, -30, -30, -35, -50],
];

const BISHOP_TABLE = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10, 8, 0, 0, 0, 0, 8, -10],
  [-10, 10, 10, 12, 12, 10, 10, -10],
  [-10, 0, 12, 14, 14, 12, 0, -10],
  [-10, 5, 5, 14, 14, 5, 5, -10],
  [-10, 0, 5, 10, 10, 5, 0, -10],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20],
];

const ROOK_TABLE = [
  [0, 0, 4, 10, 10, 4, 0, 0],
  [-6, 0, 0, 0, 0, 0, 0, -6],
  [-6, 0, 0, 0, 0, 0, 0, -6],
  [-6, 0, 0, 0, 0, 0, 0, -6],
  [-6, 0, 0, 0, 0, 0, 0, -6],
  [-6, 0, 0, 0, 0, 0, 0, -6],
  [6, 12, 12, 12, 12, 12, 12, 6],
  [0, 0, 4, 10, 10, 4, 0, 0],
];

const QUEEN_TABLE = [
  [-20, -10, -10, -5, -5, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 6, 6, 6, 6, 0, -10],
  [-5, 0, 6, 6, 6, 6, 0, -5],
  [0, 0, 6, 6, 6, 6, 0, -5],
  [-10, 5, 6, 6, 6, 6, 0, -10],
  [-10, 0, 5, 0, 0, 0, 0, -10],
  [-20, -10, -10, -5, -5, -10, -10, -20],
];

const KING_MIDDLE_TABLE = [
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [20, 20, 0, 0, 0, 0, 20, 20],
  [20, 30, 10, 0, 0, 10, 30, 20],
];

const KING_END_TABLE = [
  [-50, -40, -30, -20, -20, -30, -40, -50],
  [-30, -20, -10, 0, 0, -10, -20, -30],
  [-30, -10, 20, 30, 30, 20, -10, -30],
  [-30, -10, 30, 40, 40, 30, -10, -30],
  [-30, -10, 30, 40, 40, 30, -10, -30],
  [-30, -10, 20, 30, 30, 20, -10, -30],
  [-30, -30, 0, 0, 0, 0, -30, -30],
  [-50, -30, -30, -30, -30, -30, -30, -50],
];

const POSITION_TABLES: Record<string, number[][]> = {
  p: PAWN_TABLE,
  n: KNIGHT_TABLE,
  b: BISHOP_TABLE,
  r: ROOK_TABLE,
  q: QUEEN_TABLE,
  k: KING_MIDDLE_TABLE,
};

function mirrorRow(row: number) {
  return 7 - row;
}

function getPieceSquareValue(pieceType: string, color: "w" | "b", row: number, column: number, endgame: boolean) {
  const table =
    pieceType === "k" && endgame
      ? KING_END_TABLE
      : POSITION_TABLES[pieceType] ?? PAWN_TABLE;

  const boardRow = color === "w" ? row : mirrorRow(row);
  return table[boardRow][column] ?? 0;
}

function countMaterialWithoutKings(partida: Chess) {
  let total = 0;
  const board = partida.board() as BoardPiece[][];

  board.forEach((row) => {
    row.forEach((piece) => {
      if (!piece || piece.type === "k") {
        return;
      }

      total += PIECE_VALUES[piece.type];
    });
  });

  return total;
}

function isEndgame(partida: Chess) {
  return countMaterialWithoutKings(partida) <= 2_200;
}

function replaceTurnInFen(fen: string, turn: "w" | "b") {
  const segments = fen.split(" ");
  segments[1] = turn;
  return segments.join(" ");
}

function countLegalMovesForTurn(fen: string, turn: "w" | "b") {
  const simulation = new Chess(replaceTurnInFen(fen, turn));
  return simulation.moves().length;
}

function evaluateKingSafety(partida: Chess) {
  const fen = partida.fen();
  const [board, , castling] = fen.split(" ");
  const rows = board.split("/");
  let score = 0;

  const whiteKingRow = rows.findIndex((row) => row.includes("K"));
  const blackKingRow = rows.findIndex((row) => row.includes("k"));

  if (rows[whiteKingRow]?.includes("K") && rows[whiteKingRow]?.includes("K")) {
    if (rows[7]?.includes("K")) {
      score -= castling.includes("K") || castling.includes("Q") ? 6 : 16;
    }

    if (rows[7]?.includes("1K1") || rows[7]?.includes("2K")) {
      score += 18;
    }
  }

  if (rows[blackKingRow]?.includes("k") && rows[blackKingRow]?.includes("k")) {
    if (rows[0]?.includes("k")) {
      score += castling.includes("k") || castling.includes("q") ? 6 : 16;
    }

    if (rows[0]?.includes("1k1") || rows[0]?.includes("2k")) {
      score -= 18;
    }
  }

  return score;
}

function evaluateMobility(partida: Chess) {
  const fen = partida.fen();
  const whiteMoves = countLegalMovesForTurn(fen, "w");
  const blackMoves = countLegalMovesForTurn(fen, "b");
  return (whiteMoves - blackMoves) * 3;
}

export function evaluarTablero(partida: Chess): number {
  if (partida.isCheckmate()) {
    return partida.turn() === "w" ? -INFINITY_SCORE : INFINITY_SCORE;
  }

  if (partida.isDraw()) {
    return 0;
  }

  const endgame = isEndgame(partida);
  let score = 0;
  const board = partida.board() as BoardPiece[][];

  board.forEach((row, rowIndex) => {
    row.forEach((piece, columnIndex) => {
      if (!piece) {
        return;
      }

      const material = PIECE_VALUES[piece.type];
      const positional = getPieceSquareValue(piece.type, piece.color, rowIndex, columnIndex, endgame);
      const value = material + positional;
      score += piece.color === "w" ? value : -value;
    });
  });

  score += evaluateMobility(partida);
  score += evaluateKingSafety(partida);

  if (partida.isCheck()) {
    score += partida.turn() === "w" ? -24 : 24;
  }

  return score;
}

function getSearchDepth(elo: number, partida: Chess) {
  if (elo >= 1850) {
    return partida.moves().length <= 18 || isEndgame(partida) ? 4 : 3;
  }

  if (elo >= 1350) {
    return 3;
  }

  if (elo >= 750) {
    return 2;
  }

  return 1;
}

function getTemperature(elo: number, estilo: EstiloIA) {
  let temperature = 10;

  if (elo <= 500) {
    temperature = 160;
  } else if (elo <= 850) {
    temperature = 90;
  } else if (elo <= 1250) {
    temperature = 48;
  } else if (elo <= 1650) {
    temperature = 26;
  } else {
    temperature = 12;
  }

  if (estilo === "caotico") {
    return temperature * 1.45;
  }

  if (estilo === "defensivo") {
    return temperature * 0.8;
  }

  if (estilo === "agresivo") {
    return temperature * 0.92;
  }

  return temperature;
}

function getBlunderChance(elo: number, estilo: EstiloIA) {
  let chance = 0.01;

  if (elo <= 500) {
    chance = 0.28;
  } else if (elo <= 850) {
    chance = 0.18;
  } else if (elo <= 1250) {
    chance = 0.1;
  } else if (elo <= 1650) {
    chance = 0.05;
  } else {
    chance = 0.015;
  }

  if (estilo === "caotico") {
    return chance * 1.3;
  }

  if (estilo === "defensivo") {
    return chance * 0.8;
  }

  return chance;
}

function scoreMoveOrdering(move: ChessMoveLike) {
  let score = 0;

  if (move.captured) {
    score += 20 + PIECE_VALUES[move.captured];
  }

  if (move.promotion) {
    score += PIECE_VALUES[move.promotion];
  }

  if (move.san.includes("+")) {
    score += 35;
  }

  if (move.san.includes("#")) {
    score += 10_000;
  }

  if (move.flags.includes("k") || move.flags.includes("q")) {
    score += 12;
  }

  return score;
}

function orderMoves(moves: ChessMoveLike[]) {
  return [...moves].sort((left, right) => scoreMoveOrdering(right) - scoreMoveOrdering(left));
}

function alphaBeta(partida: Chess, depth: number, alpha: number, beta: number): number {
  if (depth === 0 || partida.isGameOver()) {
    return evaluarTablero(partida);
  }

  const moves = orderMoves(partida.moves({ verbose: true }) as ChessMoveLike[]);
  const maximizing = partida.turn() === "w";

  if (maximizing) {
    let value = -INFINITY_SCORE;

    for (const move of moves) {
      partida.move(move);
      value = Math.max(value, alphaBeta(partida, depth - 1, alpha, beta));
      partida.undo();
      alpha = Math.max(alpha, value);

      if (alpha >= beta) {
        break;
      }
    }

    return value;
  }

  let value = INFINITY_SCORE;

  for (const move of moves) {
    partida.move(move);
    value = Math.min(value, alphaBeta(partida, depth - 1, alpha, beta));
    partida.undo();
    beta = Math.min(beta, value);

    if (alpha >= beta) {
      break;
    }
  }

  return value;
}

function getStyleBonus(move: ChessMoveLike, estilo: EstiloIA) {
  if (estilo === "agresivo") {
    return (move.captured ? 46 : 0) + (move.san.includes("+") ? 52 : 0) - (move.flags.includes("k") || move.flags.includes("q") ? 4 : 0);
  }

  if (estilo === "defensivo") {
    return (move.flags.includes("k") || move.flags.includes("q") ? 24 : 0) + (move.captured ? 12 : 0);
  }

  if (estilo === "caotico") {
    return (move.captured ? 18 : 0) + (move.promotion ? 20 : 0) + ((move.to === "f2" || move.to === "f7" || move.to === "g2" || move.to === "g7") ? 12 : 0);
  }

  return (move.captured ? 10 : 0) + (move.flags.includes("k") || move.flags.includes("q") ? 10 : 0);
}

function classifyMove(gap: number): AnalisisMovimientoIA["classification"] {
  if (gap <= 18) {
    return "best";
  }

  if (gap <= 75) {
    return "strong";
  }

  if (gap <= 180) {
    return "risky";
  }

  return "blunder";
}

function chooseWeightedIndex(weights: number[]) {
  const total = weights.reduce((sum, weight) => sum + weight, 0);

  if (total <= 0) {
    return 0;
  }

  let cursor = Math.random() * total;

  for (let index = 0; index < weights.length; index += 1) {
    cursor -= weights[index];

    if (cursor <= 0) {
      return index;
    }
  }

  return 0;
}

export function analizarMovimientoIA(partida: Chess, elo: number, estilo: EstiloIA): AnalisisMovimientoIA | null {
  const moves = partida.moves({ verbose: true }) as ChessMoveLike[];

  if (moves.length === 0) {
    return null;
  }

  const moverIsWhite = partida.turn() === "w";
  const depth = getSearchDepth(elo, partida);
  const moveEvaluations = orderMoves(moves).map((move) => {
    partida.move(move);
    const boardScore = alphaBeta(partida, Math.max(0, depth - 1), -INFINITY_SCORE, INFINITY_SCORE);
    partida.undo();

    const sideAdjustedScore = moverIsWhite ? boardScore : -boardScore;
    const quality = sideAdjustedScore + getStyleBonus(move, estilo);

    return {
      move,
      score: boardScore,
      quality,
      tags: {
        capture: Boolean(move.captured),
        check: move.san.includes("+") || move.san.includes("#"),
        castle: move.flags.includes("k") || move.flags.includes("q"),
        promotion: Boolean(move.promotion),
      },
    };
  });

  const rankedMoves = [...moveEvaluations].sort((left, right) => right.quality - left.quality);
  const bestQuality = rankedMoves[0].quality;
  const temperature = getTemperature(elo, estilo);
  const blunderChance = getBlunderChance(elo, estilo);

  let candidatePool = rankedMoves;

  if (Math.random() < blunderChance && rankedMoves.length > 2) {
    const offset = Math.max(1, Math.floor(rankedMoves.length * 0.45));
    candidatePool = rankedMoves.slice(offset);
  } else if (elo <= 650 && rankedMoves.length > 5) {
    candidatePool = rankedMoves.slice(0, 5);
  }

  const weights = candidatePool.map((entry, index) => {
    const gap = Math.max(0, bestQuality - entry.quality);
    const baseWeight = Math.exp(-gap / temperature);
    const placementPenalty = estilo === "caotico" ? Math.max(0.35, 1 - index * 0.08) : 1;
    return baseWeight * placementPenalty;
  });

  const selected = candidatePool[chooseWeightedIndex(weights)] ?? rankedMoves[0];
  const rank = rankedMoves.findIndex((entry) => entry.move.san === selected.move.san);
  const gap = Math.max(0, bestQuality - selected.quality);

  return {
    san: selected.move.san,
    from: selected.move.from,
    to: selected.move.to,
    promotion: selected.move.promotion,
    score: selected.score,
    quality: selected.quality,
    bestQuality,
    rank: rank < 0 ? 0 : rank,
    classification: classifyMove(gap),
    tags: selected.tags,
  };
}

export function obtenerMovimientoIA(partida: Chess, elo: number, estilo: EstiloIA): string | null {
  return analizarMovimientoIA(partida, elo, estilo)?.san ?? null;
}
