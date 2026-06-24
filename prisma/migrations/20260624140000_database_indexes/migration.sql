-- Cover foreign keys flagged by Supabase performance advisors.

CREATE INDEX IF NOT EXISTS "Post_authorId_idx" ON "Post"("authorId");
CREATE INDEX IF NOT EXISTS "GameInvitation_friendshipId_idx" ON "GameInvitation"("friendshipId");
CREATE INDEX IF NOT EXISTS "ArcadeQueue_userId_idx" ON "ArcadeQueue"("userId");
