import { NextResponse } from "next/server";
import { startTournament } from "@/lib/ai-tournament-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.NODE_ENV === "production" && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const tournament = await startTournament();
    return NextResponse.json({ message: `Nuevo torneo ${tournament?.id ?? ""} configurado.` });
  } catch (error) {
    console.error("No se pudo configurar el torneo:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "No se pudo configurar el torneo." },
      { status: 500 }
    );
  }
}

