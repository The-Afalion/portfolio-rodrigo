-- Protect online chess/social tables exposed through Supabase APIs while
-- keeping server-side Prisma workflows and Realtime participant updates working.

ALTER TABLE "ChessGame" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LobbyMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GameInvitation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Friendship" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FriendDirectMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ArcadeQueue" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chess_games_select_participants" ON "ChessGame";
CREATE POLICY "chess_games_select_participants" ON "ChessGame"
  FOR SELECT
  TO authenticated
  USING (
    (select auth.uid())::text = "whitePlayerId"
    OR (select auth.uid())::text = "blackPlayerId"
  );

DROP POLICY IF EXISTS "game_messages_select_participants" ON "Message";
CREATE POLICY "game_messages_select_participants" ON "Message"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM "ChessGame"
      WHERE "ChessGame"."id" = "Message"."gameId"
        AND (
          "ChessGame"."whitePlayerId" = (select auth.uid())::text
          OR "ChessGame"."blackPlayerId" = (select auth.uid())::text
        )
    )
  );

DROP POLICY IF EXISTS "game_messages_insert_participants" ON "Message";
CREATE POLICY "game_messages_insert_participants" ON "Message"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    "senderId" = (select auth.uid())::text
    AND EXISTS (
      SELECT 1
      FROM "ChessGame"
      WHERE "ChessGame"."id" = "Message"."gameId"
        AND (
          "ChessGame"."whitePlayerId" = (select auth.uid())::text
          OR "ChessGame"."blackPlayerId" = (select auth.uid())::text
        )
    )
  );

DROP POLICY IF EXISTS "lobby_messages_select_authenticated" ON "LobbyMessage";
CREATE POLICY "lobby_messages_select_authenticated" ON "LobbyMessage"
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "lobby_messages_insert_own" ON "LobbyMessage";
CREATE POLICY "lobby_messages_insert_own" ON "LobbyMessage"
  FOR INSERT
  TO authenticated
  WITH CHECK ("senderId" = (select auth.uid())::text);

DROP POLICY IF EXISTS "game_invitations_select_participants" ON "GameInvitation";
CREATE POLICY "game_invitations_select_participants" ON "GameInvitation"
  FOR SELECT
  TO authenticated
  USING (
    (select auth.uid())::text = "inviterId"
    OR (select auth.uid())::text = "inviteeId"
  );

DROP POLICY IF EXISTS "friendships_select_participants" ON "Friendship";
CREATE POLICY "friendships_select_participants" ON "Friendship"
  FOR SELECT
  TO authenticated
  USING (
    (select auth.uid())::text = "requesterId"
    OR (select auth.uid())::text = "addresseeId"
  );

DROP POLICY IF EXISTS "friend_messages_select_participants" ON "FriendDirectMessage";
CREATE POLICY "friend_messages_select_participants" ON "FriendDirectMessage"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM "Friendship"
      WHERE "Friendship"."id" = "FriendDirectMessage"."friendshipId"
        AND (
          "Friendship"."requesterId" = (select auth.uid())::text
          OR "Friendship"."addresseeId" = (select auth.uid())::text
        )
    )
  );

DROP POLICY IF EXISTS "friend_messages_insert_participants" ON "FriendDirectMessage";
CREATE POLICY "friend_messages_insert_participants" ON "FriendDirectMessage"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    "senderId" = (select auth.uid())::text
    AND EXISTS (
      SELECT 1
      FROM "Friendship"
      WHERE "Friendship"."id" = "FriendDirectMessage"."friendshipId"
        AND "Friendship"."status" = 'ACCEPTED'
        AND (
          "Friendship"."requesterId" = (select auth.uid())::text
          OR "Friendship"."addresseeId" = (select auth.uid())::text
        )
    )
  );

DROP POLICY IF EXISTS "arcade_queue_select_own" ON "ArcadeQueue";
CREATE POLICY "arcade_queue_select_own" ON "ArcadeQueue"
  FOR SELECT
  TO authenticated
  USING ("userId" = (select auth.uid())::text);
