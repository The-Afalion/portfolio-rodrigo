import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { invitationId } = await request.json();

  try {
    const invitation = await prisma.gameInvitation.update({
      where: {
        id: invitationId,
        inviteeId: user.id,
      },
      data: {
        status: "ACCEPTED",
      },
      include: {
        game: true,
      },
    });

    if (invitation.game) {
      await prisma.chessGame.update({
        where: {
          id: invitation.game.id,
        },
        data: {
          status: "IN_PROGRESS",
        },
      });
    }

    return NextResponse.json({ gameId: invitation.game?.id });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    );
  }
}
