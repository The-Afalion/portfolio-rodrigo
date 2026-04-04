"use client";

import { useRouter } from "next/navigation";

async function handleAccept(invitationId: string, router: any) {
  const response = await fetch("/api/chess/invitations/accept", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ invitationId }),
  });

  if (response.ok) {
    const { gameId } = await response.json();
    router.push(`/chess/play/${gameId}`);
  } else {
    alert("Failed to accept invitation");
  }
}

async function handleDecline(invitationId: string, router: any) {
  const response = await fetch("/api/chess/invitations/decline", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ invitationId }),
  });

  if (response.ok) {
    router.refresh();
  } else {
    alert("Failed to decline invitation");
  }
}

export function AcceptInvitationButton({
  invitationId,
}: {
  invitationId: string;
}) {
  const router = useRouter();
  return (
    <button
      onClick={() => handleAccept(invitationId, router)}
      className="bg-green-500 text-white px-4 py-2 rounded-lg"
    >
      Accept
    </button>
  );
}

export function DeclineInvitationButton({
  invitationId,
}: {
  invitationId: string;
}) {
  const router = useRouter();
  return (
    <button
      onClick={() => handleDecline(invitationId, router)}
      className="bg-red-500 text-white px-4 py-2 rounded-lg"
    >
      Decline
    </button>
  );
}
