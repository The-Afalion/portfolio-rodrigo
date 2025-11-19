"use client";
import { useEffect, useState } from "react";
import { User, Trophy, Swords } from "lucide-react";

interface ChessStats {
  chess_rapid?: { last: { rating: number } };
  chess_blitz?: { last: { rating: number } };
  chess_bullet?: { last: { rating: number } };
}

interface ChessProfile {
  avatar?: string;
  url?: string;
  username?: string;
}

export default function ChessProfile({ username }: { username: string }) {
  const [stats, setStats] = useState<ChessStats | null>(null);
  const [profile, setProfile] = useState<ChessProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const statsRes = await fetch(`https://api.chess.com/pub/player/${username}/stats`);
        const profileRes = await fetch(`https://api.chess.com/pub/player/${username}`);

        if (statsRes.ok) setStats(await statsRes.json());
        if (profileRes.ok) setProfile(await profileRes.json());
      } catch (e) {
        console.error("Error fetching chess.com data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [username]);

  if (loading) return <div className="animate-pulse h-24 w-full bg-white/5 rounded-xl"></div>;
  if (!profile) return null;

  return (
    <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-xl p-4 flex items-center gap-4 shadow-lg">
      <img
        src={profile.avatar || "https://www.chess.com/bundles/web/images/user-image.svg"}
        alt={username}
        className="w-16 h-16 rounded-full border-2 border-green-500"
      />

      <div className="flex-1">
        <h3 className="text-white font-bold flex items-center gap-2">
          {profile.username}
          <a href={profile.url} target="_blank" className="text-xs text-green-400 hover:underline">@chess.com</a>
        </h3>

        <div className="flex gap-4 mt-2 text-sm">
          <div className="flex flex-col items-center p-2 bg-white/5 rounded">
            <span className="text-gray-400 text-[10px] uppercase">Rapid</span>
            <span className="font-mono text-white">{stats?.chess_rapid?.last?.rating || "N/A"}</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-white/5 rounded">
            <span className="text-gray-400 text-[10px] uppercase">Blitz</span>
            <span className="font-mono text-white">{stats?.chess_blitz?.last?.rating || "N/A"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}