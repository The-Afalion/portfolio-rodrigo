import type { CSSProperties } from "react";
import { Chess } from "chess.js";

export type ChessMoveLike = {
  san: string;
  flags: string;
  captured?: string;
};

export type SquareStyleMap = Record<string, CSSProperties>;

export function buildMoveHintStyles(selectedSquare: string | null, legalTargets: string[]) {
  const styles: SquareStyleMap = {};

  if (selectedSquare) {
    styles[selectedSquare] = {
      background:
        "radial-gradient(circle, rgba(56,189,248,0.22) 0%, rgba(56,189,248,0.38) 62%, rgba(15,23,42,0.1) 100%)",
      boxShadow: "inset 0 0 0 3px rgba(56,189,248,0.55)",
    };
  }

  for (const square of legalTargets) {
    styles[square] = {
      background:
        "radial-gradient(circle, rgba(15,23,42,0) 0 58%, rgba(56,189,248,0.85) 58% 70%, rgba(15,23,42,0) 70%)",
    };
  }

  return styles;
}

export function getLegalTargets(game: Chess, square: string) {
  return game.moves({ square, verbose: true }).map((move) => move.to);
}
