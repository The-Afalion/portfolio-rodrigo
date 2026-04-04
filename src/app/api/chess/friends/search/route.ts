import { NextResponse } from "next/server";
import { findChessUsers, getAuthenticatedChessUser } from "@/lib/chess-social";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getAuthenticatedChessUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const results = await findChessUsers(query, user.id);

  return NextResponse.json({ results });
}
