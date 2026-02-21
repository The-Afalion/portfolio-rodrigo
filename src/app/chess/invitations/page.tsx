import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { AcceptInvitationButton, DeclineInvitationButton } from "./InvitationButtons";

export default async function InvitationsPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

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
