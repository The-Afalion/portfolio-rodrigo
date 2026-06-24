-- Support online chess actions such as draw offers and richer history queries.

ALTER TABLE "ChessGame"
  ADD COLUMN IF NOT EXISTS "drawOfferById" TEXT;

CREATE INDEX IF NOT EXISTS "ChessGame_status_updatedAt_idx" ON "ChessGame"("status", "updatedAt");
