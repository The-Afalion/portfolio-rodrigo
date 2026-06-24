-- Enable Supabase Realtime for online chess tables used by live games,
-- game chat, lobby invitations and direct messages.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'ChessGame'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "ChessGame";
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'Message'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "Message";
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'GameInvitation'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "GameInvitation";
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'LobbyMessage'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "LobbyMessage";
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'Friendship'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "Friendship";
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'FriendDirectMessage'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "FriendDirectMessage";
  END IF;
END $$;
