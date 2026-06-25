CREATE TABLE "ArcadeMatch" (
    "id" TEXT NOT NULL,
    "gameKey" TEXT NOT NULL,
    "player1Id" TEXT NOT NULL,
    "player2Id" TEXT NOT NULL,
    "snapshot" JSONB,
    "version" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArcadeMatch_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ArcadeMatch_gameKey_status_idx" ON "ArcadeMatch"("gameKey", "status");
CREATE INDEX "ArcadeMatch_player1Id_idx" ON "ArcadeMatch"("player1Id");
CREATE INDEX "ArcadeMatch_player2Id_idx" ON "ArcadeMatch"("player2Id");
CREATE INDEX "ArcadeMatch_updatedAt_idx" ON "ArcadeMatch"("updatedAt");

ALTER TABLE "ArcadeMatch"
ADD CONSTRAINT "ArcadeMatch_player1Id_fkey"
FOREIGN KEY ("player1Id") REFERENCES "Profile"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ArcadeMatch"
ADD CONSTRAINT "ArcadeMatch_player2Id_fkey"
FOREIGN KEY ("player2Id") REFERENCES "Profile"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
