import { searchBestMove, rankMoves } from "@/lib/chess-engine";

export function getRankedMoves(fen: string, depth = 3): { move: string; score: number }[] {
  return rankMoves(fen, { depth }).map((entry) => ({
    move: entry.move,
    score: entry.score,
  }));
}

export function getBestMove(fen: string, depth = 3): string | null {
  return searchBestMove(fen, {
    depth,
    deterministic: true,
    maxNodes: depth >= 4 ? 140_000 : 70_000,
    timeLimitMs: depth >= 4 ? 1_600 : 900,
  })?.san ?? null;
}

