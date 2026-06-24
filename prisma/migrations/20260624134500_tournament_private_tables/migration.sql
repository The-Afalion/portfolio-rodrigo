-- Make intentionally private tournament internals explicit for the Supabase API.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'AIBotMatchupMemory' AND policyname = 'bot_memory_private') THEN
    CREATE POLICY "bot_memory_private" ON "AIBotMatchupMemory"
      FOR ALL
      TO anon, authenticated
      USING (false)
      WITH CHECK (false);
  END IF;
END $$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_wins() FROM PUBLIC;
REVOKE ALL ON TABLE "AIBotMatchupMemory" FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE "TournamentBet" FROM anon, authenticated;
