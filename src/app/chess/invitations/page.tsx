import prisma from "@/lib/prisma";
import { AcceptInvitationButton, DeclineInvitationButton } from "./InvitationButtons";
import { cookies } from "next/headers";
import { hasSupabaseBrowserEnv } from "@/lib/supabase-env";
import { createClient } from "@/utils/supabase/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function InvitationsPage() {
  if (!hasSupabaseBrowserEnv()) {
    return <div className="container mx-auto p-4">Configura Supabase para ver tus invitaciones.</div>;
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>You must be logged in to see your invitations.</div>;
  }

  const invitations = await prisma.gameInvitation.findMany({
    where: {
      inviteeId: user.id,
      status: "PENDING",
    },
    include: {
      inviter: true,
    },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Invitations</h1>
      <div className="space-y-4">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="p-4 border rounded-lg flex justify-between items-center"
          >
            <div>
              <p>
                From: {invitation.inviter.id}{" "}
                <span className="text-gray-500">
                  ({invitation.inviter.elo})
                </span>
              </p>
              <p className="text-sm text-gray-500">
                Received: {invitation.createdAt.toLocaleString()}
              </p>
            </div>
            <div className="flex space-x-2">
              <AcceptInvitationButton invitationId={invitation.id} />
              <DeclineInvitationButton invitationId={invitation.id} />
            </div>
          </div>
        ))}
        {invitations.length === 0 && <p>No pending invitations.</p>}
      </div>
    </div>
  );
}
