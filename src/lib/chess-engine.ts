import { Chess } from "chess.js";

export type EngineStyle =
  | "agresivo"
  | "defensivo"
  | "equilibrado"
  | "caotico"
  | "PAWN_MASTER"
  | "AGGRESSIVE"
  | "ADAPTIVE"
  | "BALANCED"
  | "CHAOTIC"
  | "DEFENSIVE"
  | "FORTRESS"
  | "OPENING_BOOK"
  | "BERSERKER"
  | "REACTIONARY"
  | "OPPORTUNIST"
  | "PRESSURER";

export type EngineMove = {
  san: string;
  from: string;
  to: string;
  promotion?: string;
  score: number;
  quality: number;
  bestQuality: number;
  rank: number;
  classification: "best" | "strong" | "risky" | "blunder";
  depth: number;
  nodes: number;
  tags: {
    capture: boolean;
    check: boolean;
    castle: boolean;
    promotion: boolean;
  };
};

type SearchOptions = {
  depth?: number;
  maxNodes?: number;
  timeLimitMs?: number;
  elo?: number;
  style?: EngineStyle;
  deterministic?: boolean;
};

type MoveLike = {
  san: string;
  from: string;
  to: string;
  flags: string;
  captured?: string;
  promotion?: string;
};

type BoardPiece = {
  type: string;
  color: "w" | "b";
} | null;

const MATE_SCORE = 1_000_000;
const DRAW_SCORE = 0;
const DEFAULT_DEPTH = 3;
const DEFAULT_MAX_NODES = 80_000;
const DEFAULT_TIME_LIMIT_MS = 1_200;

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
  [10, 10, 20, 32, 32, 20, 10, 10],
  [6, 6, 14, 28, 28, 14, 6, 6],
  [2, 2, 8, 24, 24, 8, 2, 2],
  [5, -5, -12, 0, 0, -12, -5, 5],
  [5, 12, 12, -18, -18, 12, 12, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const KNIGHT_TABLE = [
  [-55, -38, -30, -28, -28, -30, -38, -55],
  [-38, -16, 0, 4, 4, 0, -16, -38],
  [-30, 4, 14, 18, 18, 14, 4, -30],
  [-28, 2, 18, 24, 24, 18, 2, -28],
  [-28, 6, 18, 24, 24, 18, 6, -28],
  [-30, 0, 12, 18, 18, 12, 0, -30],
  [-38, -16, 0, 2, 2, 0, -16, -38],
  [-55, -38, -30, -28, -28, -30, -38, -55],
];

const BISHOP_TABLE = [
  [-22, -12, -10, -8, -8, -10, -12, -22],
  [-12, 8, 2, 2, 2, 2, 8, -12],
  [-10, 10, 12, 14, 14, 12, 10, -10],
  [-8, 2, 14, 18, 18, 14, 2, -8],
  [-8, 6, 8, 18, 18, 8, 6, -8],
  [-10, 2, 8, 12, 12, 8, 2, -10],
  [-12, 4, 2, 2, 2, 2, 4, -12],
  [-22, -12, -10, -8, -8, -10, -12, -22],
];

const ROOK_TABLE = [
  [0, 0, 5, 12, 12, 5, 0, 0],
  [-4, 0, 0, 4, 4, 0, 0, -4],
  [-6, 0, 0, 4, 4, 0, 0, -6],
  [-6, 0, 0, 4, 4, 0, 0, -6],
  [-6, 0, 0, 4, 4, 0, 0, -6],
  [-6, 0, 0, 4, 4, 0, 0, -6],
  [8, 14, 14, 14, 14, 14, 14, 8],
  [0, 0, 5, 12, 12, 5, 0, 0],
];

const QUEEN_TABLE = [
  [-22, -12, -10, -5, -5, -10, -12, -22],
  [-12, 0, 2, 2, 2, 2, 0, -12],
  [-10, 2, 8, 8, 8, 8, 2, -10],
  [-5, 2, 8, 10, 10, 8, 2, -5],
  [0, 2, 8, 10, 10, 8, 2, -5],
  [-10, 6, 8, 8, 8, 8, 2, -10],
  [-12, 0, 6, 2, 2, 2, 0, -12],
  [-22, -12, -10, -5, -5, -10, -12, -22],
];

const KING_MIDDLE_TABLE = [
  [-34, -42, -42, -54, -54, -42, -42, -34],
  [-34, -42, -42, -54, -54, -42, -42, -34],
  [-32, -40, -42, -52, -52, -42, -40, -32],
  [-26, -34, -36, -46, -46, -36, -34, -26],
  [-18, -26, -28, -34, -34, -28, -26, -18],
  [-8, -14, -14, -16, -16, -14, -14, -8],
  [22, 24, 4, 0, 0, 4, 24, 22],
  [24, 34, 12, 0, 0, 12, 34, 24],
];

const KING_END_TABLE = [
  [-52, -42, -32, -22, -22, -32, -42, -52],
  [-32, -18, -8, 2, 2, -8, -18, -32],
  [-30, -8, 22, 34, 34, 22, -8, -30],
  [-22, 0, 34, 46, 46, 34, 0, -22],
  [-22, 0, 34, 46, 46, 34, 0, -22],
  [-30, -8, 22, 34, 34, 22, -8, -30],
  [-32, -24, 0, 0, 0, 0, -24, -32],
  [-52, -32, -30, -24, -24, -30, -32, -52],
];

const TABLES: Record<string, number[][]> = {
  p: PAWN_TABLE,
  n: KNIGHT_TABLE,
  b: BISHOP_TABLE,
  r: ROOK_TABLE,
  q: QUEEN_TABLE,
  k: KING_MIDDLE_TABLE,
};

function mirror(row: number) {
  return 7 - row;
}

function normalizeStyle(style?: EngineStyle) {
  if (!style) {
    return "equilibrado";
  }

  const value = style.toString().toLowerCase();

  if (value.includes("aggressive") || value.includes("berserker") || value === "agresivo") {
    return "agresivo";
  }

  if (value.includes("defensive") || value.includes("fortress") || value === "defensivo") {
    return "defensivo";
  }

  if (value.includes("chaotic") || value === "caotico") {
    return "caotico";
  }

  return "equilibrado";
}

function materialWithoutKings(game: Chess) {
  let total = 0;
  const board = game.board() as BoardPiece[][];

  for (const row of board) {
    for (const piece of row) {
      if (piece && piece.type !== "k") {
        total += PIECE_VALUES[piece.type] ?? 0;
      }
    }
  }

  return total;
}

function isEndgame(game: Chess) {
  return materialWithoutKings(game) <= 2_200;
}

function pieceSquareValue(piece: NonNullable<BoardPiece>, row: number, column: number, endgame: boolean) {
  const table = piece.type === "k" && endgame ? KING_END_TABLE : TABLES[piece.type] ?? PAWN_TABLE;
  const tableRow = piece.color === "w" ? row : mirror(row);
  return table[tableRow]?.[column] ?? 0;
}

function replaceTurnInFen(fen: string, turn: "w" | "b") {
  const parts = fen.split(" ");
  parts[1] = turn;
  return parts.join(" ");
}

function legalMoveCountFor(fen: string, turn: "w" | "b") {
  try {
    return new Chess(replaceTurnInFen(fen, turn)).moves().length;
  } catch {
    return 0;
  }
}

function mobility(game: Chess) {
  const fen = game.fen();
  return (legalMoveCountFor(fen, "w") - legalMoveCountFor(fen, "b")) * 3;
}

function tempoAndCheck(game: Chess) {
  let score = game.turn() === "w" ? 8 : -8;

  if (game.isCheck()) {
    score += game.turn() === "w" ? -32 : 32;
  }

  return score;
}

export function evaluatePosition(game: Chess): number {
  if (game.isCheckmate()) {
    return game.turn() === "w" ? -MATE_SCORE : MATE_SCORE;
  }

  if (game.isDraw()) {
    return DRAW_SCORE;
  }

  const endgame = isEndgame(game);
  let score = 0;
  const board = game.board() as BoardPiece[][];

  board.forEach((row, rowIndex) => {
    row.forEach((piece, columnIndex) => {
      if (!piece) {
        return;
      }

      const value = (PIECE_VALUES[piece.type] ?? 0) + pieceSquareValue(piece, rowIndex, columnIndex, endgame);
      score += piece.color === "w" ? value : -value;
    });
  });

  return score + mobility(game) + tempoAndCheck(game);
}

function scoreForSide(game: Chess) {
  const score = evaluatePosition(game);
  return game.turn() === "w" ? score : -score;
}

function moveOrderingScore(move: MoveLike, killer?: string) {
  if (move.san === killer) {
    return 50_000;
  }

  let score = 0;

  if (move.san.includes("#")) {
    score += 100_000;
  }

  if (move.captured) {
    score += 20_000 + (PIECE_VALUES[move.captured] ?? 0);
  }

  if (move.promotion) {
    score += 12_000 + (PIECE_VALUES[move.promotion] ?? 0);
  }

  if (move.san.includes("+")) {
    score += 2_500;
  }

  if (move.flags.includes("k") || move.flags.includes("q")) {
    score += 900;
  }

  if (["d4", "e4", "d5", "e5", "c4", "c5", "f4", "f5"].includes(move.to)) {
    score += 140;
  }

  return score;
}

function orderedMoves(game: Chess, killer?: string) {
  return (game.moves({ verbose: true }) as MoveLike[]).sort(
    (left, right) => moveOrderingScore(right, killer) - moveOrderingScore(left, killer)
  );
}

function styleBonus(move: MoveLike, style: ReturnType<typeof normalizeStyle>) {
  if (style === "agresivo") {
    return (move.captured ? 42 : 0) + (move.san.includes("+") ? 52 : 0) + (move.promotion ? 35 : 0);
  }

  if (style === "defensivo") {
    return (move.flags.includes("k") || move.flags.includes("q") ? 34 : 0) + (move.captured ? 12 : 0);
  }

  if (style === "caotico") {
    return (move.captured ? 18 : 0) + (move.san.includes("+") ? 24 : 0) + (move.promotion ? 50 : 0);
  }

  return (move.captured ? 10 : 0) + (move.flags.includes("k") || move.flags.includes("q") ? 12 : 0);
}

function temperatureFor(elo: number, style: ReturnType<typeof normalizeStyle>) {
  const base = elo <= 500 ? 150 : elo <= 850 ? 85 : elo <= 1250 ? 44 : elo <= 1650 ? 22 : 8;
  return style === "caotico" ? base * 1.45 : style === "defensivo" ? base * 0.72 : base;
}

function blunderChanceFor(elo: number, style: ReturnType<typeof normalizeStyle>) {
  const base = elo <= 500 ? 0.24 : elo <= 850 ? 0.14 : elo <= 1250 ? 0.07 : elo <= 1650 ? 0.025 : 0.006;
  return style === "caotico" ? base * 1.45 : style === "defensivo" ? base * 0.6 : base;
}

function classify(gap: number): EngineMove["classification"] {
  if (gap <= 18) return "best";
  if (gap <= 75) return "strong";
  if (gap <= 180) return "risky";
  return "blunder";
}

function weightedIndex(weights: number[]) {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  if (total <= 0) return 0;

  let cursor = Math.random() * total;
  for (let index = 0; index < weights.length; index += 1) {
    cursor -= weights[index];
    if (cursor <= 0) return index;
  }

  return 0;
}

function transpositionKey(game: Chess, depth: number) {
  const [board, turn, castling, enPassant] = game.fen().split(" ");
  return `${board} ${turn} ${castling} ${enPassant} ${depth}`;
}

export function searchBestMove(input: string | Chess, options: SearchOptions = {}): EngineMove | null {
  const root = typeof input === "string" ? new Chess(input) : new Chess(input.fen());
  const rootTurn = root.turn();
  const style = normalizeStyle(options.style);
  const elo = options.elo ?? 1600;
  const maxDepth = Math.max(1, Math.min(options.depth ?? DEFAULT_DEPTH, 5));
  const maxNodes = Math.max(100, options.maxNodes ?? DEFAULT_MAX_NODES);
  const deadline = Date.now() + Math.max(100, options.timeLimitMs ?? DEFAULT_TIME_LIMIT_MS);
  const table = new Map<string, { depth: number; score: number }>();
  const killers = new Map<number, string>();
  let nodes = 0;
  let timedOut = false;

  function negamax(game: Chess, depth: number, alpha: number, beta: number, ply: number): number {
    nodes += 1;

    if (nodes >= maxNodes || Date.now() >= deadline) {
      timedOut = true;
      return scoreForSide(game);
    }

    if (depth === 0 || game.isGameOver()) {
      const terminal = scoreForSide(game);
      if (Math.abs(terminal) >= MATE_SCORE) {
        return terminal > 0 ? terminal - ply : terminal + ply;
      }
      return terminal;
    }

    const key = transpositionKey(game, depth);
    const cached = table.get(key);
    if (cached && cached.depth >= depth) {
      return cached.score;
    }

    let bestScore = -Infinity;
    const moves = orderedMoves(game, killers.get(ply));

    for (const move of moves) {
      game.move(move);
      const score = -negamax(game, depth - 1, -beta, -alpha, ply + 1);
      game.undo();

      if (score > bestScore) {
        bestScore = score;
      }

      if (score > alpha) {
        alpha = score;
      }

      if (alpha >= beta) {
        killers.set(ply, move.san);
        break;
      }
    }

    table.set(key, { depth, score: bestScore });
    return bestScore;
  }

  let ranked: Array<{ move: MoveLike; score: number; quality: number }> = [];
  let completedDepth = 0;

  for (let depth = 1; depth <= maxDepth; depth += 1) {
    const moves = orderedMoves(root);
    const depthRanked: Array<{ move: MoveLike; score: number; quality: number }> = [];

    for (const move of moves) {
      root.move(move);
      const score = -negamax(root, depth - 1, -Infinity, Infinity, 1);
      root.undo();

      const quality = score + styleBonus(move, style);
      depthRanked.push({ move, score, quality });

      if (timedOut) {
        break;
      }
    }

    if (depthRanked.length > 0) {
      ranked = depthRanked.sort((left, right) => right.quality - left.quality);
      completedDepth = depth;
    }

    if (timedOut) {
      break;
    }
  }

  if (ranked.length === 0) {
    return null;
  }

  const bestQuality = ranked[0].quality;
  let pool = ranked;

  if (!options.deterministic && Math.random() < blunderChanceFor(elo, style) && ranked.length > 2) {
    const offset = Math.max(1, Math.floor(ranked.length * 0.42));
    pool = ranked.slice(offset);
  } else if (!options.deterministic) {
    pool = ranked.slice(0, Math.min(ranked.length, elo >= 1700 ? 3 : elo >= 1100 ? 5 : 7));
  }

  const temperature = temperatureFor(elo, style);
  const selected =
    options.deterministic
      ? ranked[0]
      : pool[weightedIndex(pool.map((entry, index) => Math.exp(-Math.max(0, bestQuality - entry.quality) / temperature) * Math.max(0.35, 1 - index * 0.08)))] ?? ranked[0];

  const rank = Math.max(0, ranked.findIndex((entry) => entry.move.san === selected.move.san));
  const gap = Math.max(0, bestQuality - selected.quality);

  return {
    san: selected.move.san,
    from: selected.move.from,
    to: selected.move.to,
    promotion: selected.move.promotion,
    score: rootTurn === "w" ? selected.score : -selected.score,
    quality: selected.quality,
    bestQuality,
    rank,
    classification: classify(gap),
    depth: completedDepth,
    nodes,
    tags: {
      capture: Boolean(selected.move.captured),
      check: selected.move.san.includes("+") || selected.move.san.includes("#"),
      castle: selected.move.flags.includes("k") || selected.move.flags.includes("q"),
      promotion: Boolean(selected.move.promotion),
    },
  };
}

export function rankMoves(fen: string, options: SearchOptions = {}) {
  const game = new Chess(fen);
  const moves = game.moves({ verbose: true }) as MoveLike[];

  return moves
    .map((move) => {
      game.move(move);
      const score = evaluatePosition(game);
      game.undo();

      return {
        move: move.san,
        from: move.from,
        to: move.to,
        promotion: move.promotion,
        score: game.turn() === "w" ? score : -score,
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, options.depth && options.depth > 2 ? 12 : 8);
}
