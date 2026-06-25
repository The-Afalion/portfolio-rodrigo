type MemoryQueueEntry = {
  userId: string;
  gameKey: string;
  joinedAt: number;
};

export type MemoryArtillerySnapshot = {
  turn: 1 | 2;
  message: string;
  angle: number;
  power: number;
  wind: { strength: number; label: string };
  hasGuide: boolean;
  game: unknown;
};

type MemoryArtilleryMatch = {
  id: string;
  gameKey: string;
  players: { player1: string; player2: string };
  snapshot: MemoryArtillerySnapshot | null;
  version: number;
  updatedAt: number;
};

type ArcadeMemoryStore = {
  queue: MemoryQueueEntry[];
  artilleryMatches: Map<string, MemoryArtilleryMatch>;
};

const globalStore = globalThis as typeof globalThis & { __arcadeMemoryStore?: ArcadeMemoryStore };

export function getArcadeMemoryStore() {
  if (!globalStore.__arcadeMemoryStore) {
    globalStore.__arcadeMemoryStore = {
      queue: [],
      artilleryMatches: new Map(),
    };
  }
  return globalStore.__arcadeMemoryStore;
}

export function pruneArcadeMemory() {
  const store = getArcadeMemoryStore();
  const now = Date.now();
  store.queue = store.queue.filter((entry) => now - entry.joinedAt < 120_000);
  for (const [id, match] of store.artilleryMatches) {
    if (now - match.updatedAt > 1000 * 60 * 60) {
      store.artilleryMatches.delete(id);
    }
  }
}

export function ensureMemoryArtilleryMatch(matchId: string, player1Id: string, player2Id: string, gameKey = "artillery") {
  const store = getArcadeMemoryStore();
  const existing = store.artilleryMatches.get(matchId);
  if (existing) return existing;
  const match: MemoryArtilleryMatch = {
    id: matchId,
    gameKey,
    players: { player1: player1Id, player2: player2Id },
    snapshot: null,
    version: 0,
    updatedAt: Date.now(),
  };
  store.artilleryMatches.set(matchId, match);
  return match;
}
