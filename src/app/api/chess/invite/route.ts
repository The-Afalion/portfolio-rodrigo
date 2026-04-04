import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { qstash } from "@/lib/qstash";
import { ensureProfileForUserSafely } from "@/lib/profile";

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

  if (typeof opponentId !== "string" || opponentId.trim().length === 0) {
    return NextResponse.json({ error: "Missing opponent id" }, { status: 400 });
  }

  if (user.id === opponentId) {
    return NextResponse.json(
      { error: "You cannot invite yourself" },
      { status: 400 }
    );
  }

  try {
    await ensureProfileForUserSafely(user);

    const opponentProfile = await prisma.profile.findUnique({
      where: {
        id: opponentId,
      },
    });

    if (!opponentProfile) {
      return NextResponse.json(
        { error: "This player is not available anymore" },
        { status: 404 }
      );
    }

    const existingInvitation = await prisma.gameInvitation.findFirst({
      where: {
        status: "PENDING",
        OR: [
          {
            inviterId: user.id,
            inviteeId: opponentId,
          },
          {
            inviterId: opponentId,
            inviteeId: user.id,
          },
        ],
      },
      include: {
        game: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (existingInvitation) {
      if (existingInvitation.inviterId === user.id) {
        return NextResponse.json(existingInvitation);
      }

      return NextResponse.json(
        { error: "This player has already invited you. Accept their challenge instead." },
        { status: 409 }
      );
    }

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

    if (process.env.QSTASH_TOKEN) {
      await qstash.publishJSON({
        topic: "chess-invitations",
        body: {
          invitationId: invitation.id,
          inviteeId: opponentId,
          inviterId: user.id,
        },
      });
    }

    return NextResponse.json(invitation);
  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 }
    );
  }
}
