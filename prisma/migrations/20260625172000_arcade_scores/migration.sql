CREATE TABLE "ArcadeScore" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameKey" TEXT NOT NULL,
    "bestScore" INTEGER NOT NULL DEFAULT 0,
    "lastScore" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArcadeScore_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ArcadeScore_userId_gameKey_key" ON "ArcadeScore"("userId", "gameKey");
CREATE INDEX "ArcadeScore_gameKey_bestScore_idx" ON "ArcadeScore"("gameKey", "bestScore");
CREATE INDEX "ArcadeScore_userId_idx" ON "ArcadeScore"("userId");

ALTER TABLE "ArcadeScore"
ADD CONSTRAINT "ArcadeScore_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "Profile"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
