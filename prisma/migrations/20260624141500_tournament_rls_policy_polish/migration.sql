-- Optimize owner-scoped RLS policies and reduce anonymous GraphQL discovery
-- for private wallet/betting tables.

DROP POLICY IF EXISTS "profiles_select_own" ON "Profile";
CREATE POLICY "profiles_select_own" ON "Profile"
  FOR SELECT
  TO authenticated
  USING ((select auth.uid())::text = id);

DROP POLICY IF EXISTS "tournament_bets_select_own" ON "TournamentBet";
CREATE POLICY "tournament_bets_select_own" ON "TournamentBet"
  FOR SELECT
  TO authenticated
  USING ((select auth.uid())::text = "profileId");

REVOKE SELECT ON TABLE "Profile" FROM anon;
REVOKE SELECT ON TABLE "TournamentBet" FROM anon;
