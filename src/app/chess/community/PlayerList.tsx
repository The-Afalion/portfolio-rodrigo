"use client";

import { useRouter } from "next/navigation";

async function handleInvite(opponentId: string, router: any) {
  const response = await fetch("/api/chess/invite", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ opponentId }),
  });

  if (response.ok) {
    alert("Invitation sent!");
    router.push("/chess/invitations");
  } else {
    const { error } = await response.json();
    alert(`Failed to send invitation: ${error}`);
  }
}

export function PlayerList({ players, currentUser }) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      {players.map((player) => (
        <div
          key={player.id}
          className="p-4 border rounded-lg flex justify-between items-center"
        >
          <div>
            <p>
              {player.id}{" "}
              <span className="text-gray-500">({player.elo})</span>
            </p>
          </div>
          {currentUser && (
            <button
              onClick={() => handleInvite(player.id, router)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              Invite
            </button>
          )}
        </div>
      ))}
      {players.length === 0 && <p>No other players found.</p>}
    </div>
  );
}
