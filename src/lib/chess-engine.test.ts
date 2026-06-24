import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { Chess } from "chess.js";
import { evaluatePosition, rankMoves, searchBestMove } from "./chess-engine";
import { groupCommunityVotes, buildSyntheticVotePlan } from "./community-chess";

describe("chess engine", () => {
  test("searchBestMove returns a legal move in the initial position", () => {
    const game = new Chess();
    const move = searchBestMove(game, {
      depth: 2,
      maxNodes: 8_000,
      timeLimitMs: 250,
      deterministic: true,
    });

    assert.ok(move);
    const legalMoves = game.moves({ verbose: true }) as Array<{ from: string; to: string }>;
    assert.ok(legalMoves.some((legalMove) => legalMove.from === move.from && legalMove.to === move.to));
  });

  test("searchBestMove finds an immediate checkmate when available", () => {
    const game = new Chess("7k/6pp/8/8/8/8/6PP/5RK1 w - - 0 1");
    const move = searchBestMove(game, {
      depth: 2,
      maxNodes: 12_000,
      timeLimitMs: 300,
      deterministic: true,
    });

    assert.equal(move?.san, "Rf8#");
  });

  test("rankMoves returns legal SAN moves only", () => {
    const game = new Chess();
    const ranked = rankMoves(game.fen(), { depth: 3 });
    const legalSan = new Set(game.moves() as string[]);

    assert.ok(ranked.length > 0);
    ranked.forEach((entry) => {
      assert.ok(legalSan.has(entry.move));
    });
  });

  test("evaluatePosition is finite for tactical positions", () => {
    const game = new Chess("r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3");
    assert.ok(Number.isFinite(evaluatePosition(game)));
  });
});

describe("community chess helpers", () => {
  test("groupCommunityVotes orders by count and move name", () => {
    const grouped = groupCommunityVotes([
      { move: "e4" },
      { move: "d4" },
      { move: "e4" },
      { move: "Nf3" },
      { move: "d4" },
      { move: "e4" },
    ]);

    assert.deepEqual(grouped, [
      { move: "e4", count: 3 },
      { move: "d4", count: 2 },
      { move: "Nf3", count: 1 },
    ]);
  });

  test("buildSyntheticVotePlan never creates more votes than requested", () => {
    const plan = buildSyntheticVotePlan(new Chess().fen(), 17);
    const totalVotes = plan.reduce((sum, entry) => sum + entry.count, 0);

    assert.equal(totalVotes, 17);
    const legalMoves = new Chess().moves() as string[];
    assert.ok(plan.every((entry) => legalMoves.includes(entry.move)));
  });
});
