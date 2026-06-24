-- Tighten public API exposure for tournament and wallet data.
-- Prisma server-side access continues to use the database connection directly.

ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChessBot" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AITournament" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AITournamentMatch" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AIBotMatchupMemory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TournamentBet" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'Profile' AND policyname = 'profiles_select_own') THEN
    CREATE POLICY "profiles_select_own" ON "Profile"
      FOR SELECT
      TO authenticated
      USING (auth.uid()::text = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ChessBot' AND policyname = 'chess_bots_public_read') THEN
    CREATE POLICY "chess_bots_public_read" ON "ChessBot"
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'AITournament' AND policyname = 'ai_tournaments_public_read') THEN
    CREATE POLICY "ai_tournaments_public_read" ON "AITournament"
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'AITournamentMatch' AND policyname = 'ai_tournament_matches_public_read') THEN
    CREATE POLICY "ai_tournament_matches_public_read" ON "AITournamentMatch"
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'TournamentBet' AND policyname = 'tournament_bets_select_own') THEN
    CREATE POLICY "tournament_bets_select_own" ON "TournamentBet"
      FOR SELECT
      TO authenticated
      USING (auth.uid()::text = "profileId");
  END IF;
END $$;

ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;
ALTER FUNCTION public.increment_wins() SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
