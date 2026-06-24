-- Harden community chess and enable realtime updates.

ALTER TABLE "CommunityChessGame" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CommunityVote" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_game_public_read" ON "CommunityChessGame";
CREATE POLICY "community_game_public_read" ON "CommunityChessGame"
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "community_votes_public_fake_read" ON "CommunityVote";
CREATE POLICY "community_votes_public_fake_read" ON "CommunityVote"
  FOR SELECT
  TO anon, authenticated
  USING ("isFake" = true);

DROP POLICY IF EXISTS "community_votes_user_read_own" ON "CommunityVote";
CREATE POLICY "community_votes_user_read_own" ON "CommunityVote"
  FOR SELECT
  TO authenticated
  USING ("userId" = (select auth.uid())::text);

DROP POLICY IF EXISTS "community_votes_user_insert_own" ON "CommunityVote";
CREATE POLICY "community_votes_user_insert_own" ON "CommunityVote"
  FOR INSERT
  TO authenticated
  WITH CHECK ("userId" = (select auth.uid())::text AND "isFake" = false);

DROP POLICY IF EXISTS "community_votes_user_update_own" ON "CommunityVote";
CREATE POLICY "community_votes_user_update_own" ON "CommunityVote"
  FOR UPDATE
  TO authenticated
  USING ("userId" = (select auth.uid())::text)
  WITH CHECK ("userId" = (select auth.uid())::text AND "isFake" = false);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'CommunityChessGame'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "CommunityChessGame";
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'CommunityVote'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "CommunityVote";
  END IF;
END $$;
