import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { qstash } from "@/lib/qstash";

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

  const { opponentId } = await request.json();

  if (user.id === opponentId) {
    return NextResponse.json(
      { error: "You cannot invite yourself" },
      { status: 400 }
    );
  }

  try {
    const invitation = await prisma.gameInvitation.create({
      data: {
        inviterId: user.id,
        inviteeId: opponentId,
        game: {
          create: {
            whitePlayerId: user.id,
            blackPlayerId: opponentId,
            moves: "",
            status: "PENDING",
          },
        },
      },
      include: {
        game: true,
      },
    });

    await qstash.publishJSON({
      topic: "chess-invitations",
      body: {
        invitationId: invitation.id,
        inviteeId: opponentId,
        inviterId: user.id,
      },
    });

    return NextResponse.json(invitation);
  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 }
    );
  }
}
