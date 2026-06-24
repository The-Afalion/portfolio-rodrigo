-- AI tournament learning, rodes wallet and betting markets.
-- Idempotent by design so it can be applied to an existing Supabase project.

ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "rodes" INTEGER NOT NULL DEFAULT 1000;

ALTER TABLE "ChessBot" ADD COLUMN IF NOT EXISTS "winsTotal" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ChessBot" ADD COLUMN IF NOT EXISTS "matchesPlayed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ChessBot" ADD COLUMN IF NOT EXISTS "matchWins" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ChessBot" ADD COLUMN IF NOT EXISTS "matchLosses" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "AITournament" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL DEFAULT 'Torneo de Titanes',
  "description" TEXT NOT NULL DEFAULT 'Bracket automático entre motores de ajedrez.',
  "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endDate" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "winnerId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endedAt" TIMESTAMP(3),
  CONSTRAINT "AITournament_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "AITournament" ADD COLUMN IF NOT EXISTS "winnerId" TEXT;
ALTER TABLE "AITournament" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "AITournament" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "AITournament" ADD COLUMN IF NOT EXISTS "endedAt" TIMESTAMP(3);
ALTER TABLE "AITournament" ALTER COLUMN "name" SET DEFAULT 'Torneo de Titanes';
ALTER TABLE "AITournament" ALTER COLUMN "description" SET DEFAULT 'Bracket automático entre motores de ajedrez.';
ALTER TABLE "AITournament" ALTER COLUMN "startDate" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "AITournament" ALTER COLUMN "endDate" DROP NOT NULL;
ALTER TABLE "AITournament" ALTER COLUMN "status" SET DEFAULT 'PENDING';

CREATE TABLE IF NOT EXISTS "AITournamentMatch" (
  "id" TEXT NOT NULL,
  "tournamentId" TEXT NOT NULL,
  "round" INTEGER NOT NULL,
  "player1Id" TEXT NOT NULL,
  "player2Id" TEXT NOT NULL,
  "winnerId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "fen" TEXT NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  "moves" JSONB NOT NULL DEFAULT '[]',
  "pgn" TEXT NOT NULL DEFAULT '',
  "lastMoveAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AITournamentMatch_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "AITournamentMatch" ADD COLUMN IF NOT EXISTS "winnerId" TEXT;
ALTER TABLE "AITournamentMatch" ADD COLUMN IF NOT EXISTS "fen" TEXT NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
ALTER TABLE "AITournamentMatch" ADD COLUMN IF NOT EXISTS "moves" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "AITournamentMatch" ADD COLUMN IF NOT EXISTS "pgn" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AITournamentMatch" ADD COLUMN IF NOT EXISTS "lastMoveAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "AIBotMatchupMemory" (
  "id" TEXT NOT NULL,
  "botId" TEXT NOT NULL,
  "opponentId" TEXT NOT NULL,
  "games" INTEGER NOT NULL DEFAULT 0,
  "wins" INTEGER NOT NULL DEFAULT 0,
  "losses" INTEGER NOT NULL DEFAULT 0,
  "draws" INTEGER NOT NULL DEFAULT 0,
  "styleBias" JSONB NOT NULL DEFAULT '{}',
  "openingBias" JSONB NOT NULL DEFAULT '{}',
  "tacticalNotes" JSONB NOT NULL DEFAULT '{}',
  "lastFen" TEXT,
  "lastUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AIBotMatchupMemory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TournamentBet" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "tournamentId" TEXT NOT NULL,
  "matchId" TEXT,
  "type" TEXT NOT NULL,
  "marketLabel" TEXT NOT NULL,
  "selections" JSONB NOT NULL,
  "stake" INTEGER NOT NULL,
  "odds" DOUBLE PRECISION NOT NULL,
  "potentialPayout" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "payout" INTEGER NOT NULL DEFAULT 0,
  "settledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TournamentBet_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AITournament_winnerId_fkey') THEN
    ALTER TABLE "AITournament" ADD CONSTRAINT "AITournament_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "ChessBot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AITournamentMatch_tournamentId_fkey') THEN
    ALTER TABLE "AITournamentMatch" ADD CONSTRAINT "AITournamentMatch_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "AITournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AITournamentMatch_player1Id_fkey') THEN
    ALTER TABLE "AITournamentMatch" ADD CONSTRAINT "AITournamentMatch_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "ChessBot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AITournamentMatch_player2Id_fkey') THEN
    ALTER TABLE "AITournamentMatch" ADD CONSTRAINT "AITournamentMatch_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "ChessBot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AITournamentMatch_winnerId_fkey') THEN
    ALTER TABLE "AITournamentMatch" ADD CONSTRAINT "AITournamentMatch_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "ChessBot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AIBotMatchupMemory_botId_fkey') THEN
    ALTER TABLE "AIBotMatchupMemory" ADD CONSTRAINT "AIBotMatchupMemory_botId_fkey" FOREIGN KEY ("botId") REFERENCES "ChessBot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AIBotMatchupMemory_opponentId_fkey') THEN
    ALTER TABLE "AIBotMatchupMemory" ADD CONSTRAINT "AIBotMatchupMemory_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "ChessBot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AIBotMatchupMemory_botId_opponentId_key') THEN
    ALTER TABLE "AIBotMatchupMemory" ADD CONSTRAINT "AIBotMatchupMemory_botId_opponentId_key" UNIQUE ("botId", "opponentId");
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TournamentBet_profileId_fkey') THEN
    ALTER TABLE "TournamentBet" ADD CONSTRAINT "TournamentBet_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TournamentBet_tournamentId_fkey') THEN
    ALTER TABLE "TournamentBet" ADD CONSTRAINT "TournamentBet_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "AITournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TournamentBet_matchId_fkey') THEN
    ALTER TABLE "TournamentBet" ADD CONSTRAINT "TournamentBet_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "AITournamentMatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "AITournament_status_createdAt_idx" ON "AITournament"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "AITournament_winnerId_idx" ON "AITournament"("winnerId");
CREATE INDEX IF NOT EXISTS "AITournamentMatch_tournamentId_round_status_idx" ON "AITournamentMatch"("tournamentId", "round", "status");
CREATE INDEX IF NOT EXISTS "AITournamentMatch_player1Id_idx" ON "AITournamentMatch"("player1Id");
CREATE INDEX IF NOT EXISTS "AITournamentMatch_player2Id_idx" ON "AITournamentMatch"("player2Id");
CREATE INDEX IF NOT EXISTS "AITournamentMatch_winnerId_idx" ON "AITournamentMatch"("winnerId");
CREATE INDEX IF NOT EXISTS "AIBotMatchupMemory_opponentId_idx" ON "AIBotMatchupMemory"("opponentId");
CREATE INDEX IF NOT EXISTS "TournamentBet_profileId_status_idx" ON "TournamentBet"("profileId", "status");
CREATE INDEX IF NOT EXISTS "TournamentBet_tournamentId_status_idx" ON "TournamentBet"("tournamentId", "status");
CREATE INDEX IF NOT EXISTS "TournamentBet_matchId_status_idx" ON "TournamentBet"("matchId", "status");
CREATE INDEX IF NOT EXISTS "TournamentBet_type_status_idx" ON "TournamentBet"("type", "status");
