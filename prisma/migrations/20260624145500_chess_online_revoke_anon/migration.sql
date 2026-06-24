-- Online chess/social data should only be discoverable by signed-in users.

REVOKE SELECT ON TABLE "ChessGame" FROM anon;
REVOKE SELECT ON TABLE "Message" FROM anon;
REVOKE SELECT ON TABLE "LobbyMessage" FROM anon;
REVOKE SELECT ON TABLE "GameInvitation" FROM anon;
REVOKE SELECT ON TABLE "Friendship" FROM anon;
REVOKE SELECT ON TABLE "FriendDirectMessage" FROM anon;
REVOKE SELECT ON TABLE "ArcadeQueue" FROM anon;
