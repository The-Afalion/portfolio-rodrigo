import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { getUserDisplayName } from "@/lib/profile";
import { listSupabaseUsersByIds } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type InvitationWithRelations = Awaited<ReturnType<typeof loadPendingInvitations>>[number];

async function loadPendingInvitations(userId: string) {
  return prisma.gameInvitation.findMany({
    where: {
      status: "PENDING",
      OR: [{ inviterId: userId }, { inviteeId: userId }],
    },
    include: {
      inviter: true,
      invitee: true,
      game: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

function buildFallbackName(userId: string) {
  return `Jugador ${userId.slice(0, 6)}`;
}

function serializeInvitation(
  invitation: InvitationWithRelations,
  displayNames: Map<string, string>
) {
  return {
    id: invitation.id,
    status: invitation.status,
    createdAt: invitation.createdAt.toISOString(),
    updatedAt: invitation.updatedAt.toISOString(),
    gameId: invitation.game?.id ?? null,
    inviterId: invitation.inviterId,
    inviterName: displayNames.get(invitation.inviterId) ?? buildFallbackName(invitation.inviterId),
    inviterElo: invitation.inviter.elo,
    inviteeId: invitation.inviteeId,
    inviteeName: displayNames.get(invitation.inviteeId) ?? buildFallbackName(invitation.inviteeId),
    inviteeElo: invitation.invitee.elo,
  };
}

export async function GET() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invitations = await loadPendingInvitations(user.id);
  const participantIds = Array.from(
    new Set(
      invitations.flatMap((invitation) => [invitation.inviterId, invitation.inviteeId])
    )
  );

  const displayNames = new Map<string, string>();

  try {
    const supabaseUsers = await listSupabaseUsersByIds(participantIds);
    supabaseUsers.forEach((supabaseUser) => {
      displayNames.set(supabaseUser.id, getUserDisplayName(supabaseUser));
    });
  } catch (resolveError) {
    console.warn("No se pudieron resolver todos los nombres del lobby de ajedrez.", resolveError);
  }

  const serialized = invitations.map((invitation) => serializeInvitation(invitation, displayNames));

  return NextResponse.json({
    incoming: serialized.filter((invitation) => invitation.inviteeId === user.id),
    outgoing: serialized.filter((invitation) => invitation.inviterId === user.id),
  });
}
