import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowLeft, Clock3, Crown, Users } from "lucide-react";
import { Chess } from "chess.js";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { hasSupabaseBrowserEnv } from "@/lib/supabase-env";
import { ensureProfileForUserSafely, getUserDisplayName } from "@/lib/profile";
import {
  communitySideToTurn,
  ensureCommunityGame,
  ensureSyntheticVotes,
  getCommunitySideLabel,
  groupCommunityVotes,
} from "@/lib/community-chess";
import Countdown from "./Countdown";
import ChessCommunityClient from "./ChessCommunityClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function formatDate(value: Date) {
  return value.toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function CommunityPage() {
  if (!hasSupabaseBrowserEnv()) {
    return <div className="container mx-auto p-4">Configura Supabase para cargar la partida comunal.</div>;
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center px-4">
        <div className="surface-panel w-full max-w-2xl p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Ajedrez comunal</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
            Inicia sesión para unirte a tu bando
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Tu equipo de blancas o negras se asigna automáticamente a tu cuenta y te acompaña en cada ronda diaria.
          </p>
          <Link
            href="/chess"
            className="mt-8 inline-flex rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background"
          >
            Volver al club
          </Link>
        </div>
      </div>
    );
  }

  const profile = await ensureProfileForUserSafely(user);
  const game = await ensureCommunityGame();
  await ensureSyntheticVotes(game.id, game.fen);

  const [votes, sideCounts] = await Promise.all([
    prisma.communityVote.findMany({
      where: { gameId: game.id },
      orderBy: { createdAt: "asc" },
    }),
    prisma.profile.groupBy({
      by: ["communitySide"],
      where: {
        communitySide: {
          not: null,
        },
      },
      _count: {
        _all: true,
      },
    }),
  ]);

  const chess = new Chess(game.fen);
  const playerTurn = communitySideToTurn(profile.communitySide);
  const currentTurn = chess.turn();
  const currentTurnLabel = currentTurn === "w" ? "Blancas" : "Negras";
  const userVote = votes.find((vote) => vote.userId === user.id) ?? null;
  const hasVoted = Boolean(userVote);
  const canVote = playerTurn === currentTurn && new Date() < game.nextMoveDue && !chess.isGameOver();
  const voteSummary = hasVoted
    ? groupCommunityVotes(votes).map((entry) => ({
        ...entry,
        percentage: votes.length > 0 ? Math.round((entry.count / votes.length) * 100) : 0,
      }))
    : [];

  const whiteTeamCount = sideCounts.find((entry) => entry.communitySide === "WHITE")?._count._all ?? 0;
  const blackTeamCount = sideCounts.find((entry) => entry.communitySide === "BLACK")?._count._all ?? 0;

  return (
    <div className="page-shell min-h-screen">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <Link
          href="/chess"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Volver al Chess Club
        </Link>

        <section className="surface-panel overflow-hidden">
          <div className="grid gap-10 px-6 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Ajedrez comunal
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                Un movimiento al día, elegido por la comunidad
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                Cada cuenta entra automáticamente en el bando de blancas o negras. Cuando le toque a tu equipo,
                votas una jugada legal y al cerrar la ronda diaria se ejecuta la opción más apoyada.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="surface-panel-muted px-5 py-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Crown size={16} />
                    <span className="text-xs uppercase tracking-[0.2em]">Tu bando</span>
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-foreground">{getCommunitySideLabel(profile.communitySide)}</p>
                </div>
                <div className="surface-panel-muted px-5 py-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock3 size={16} />
                    <span className="text-xs uppercase tracking-[0.2em]">Turno</span>
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-foreground">{currentTurnLabel}</p>
                </div>
                <div className="surface-panel-muted px-5 py-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users size={16} />
                    <span className="text-xs uppercase tracking-[0.2em]">Equipos</span>
                  </div>
                  <p className="mt-3 text-lg font-semibold text-foreground">
                    {whiteTeamCount} blancas · {blackTeamCount} negras
                  </p>
                </div>
              </div>
            </div>

            <div className="surface-panel-muted flex flex-col justify-between rounded-[32px] p-6">
              <div>
                <p className="text-sm font-semibold text-foreground">Ronda actual</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  El movimiento ganador se ejecutará automáticamente cuando acabe este contador.
                </p>
              </div>
              <div className="mt-8 rounded-3xl border border-border/70 bg-background/80 px-4 py-6">
                <Countdown targetDate={game.nextMoveDue} />
              </div>
              <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                <p>Último movimiento ejecutado: {formatDate(game.lastMoveAt)}</p>
                <p>Próxima resolución: {formatDate(game.nextMoveDue)}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-10">
          <ChessCommunityClient
            player={{
              id: user.id,
              displayName: getUserDisplayName(user),
              communitySide: profile.communitySide,
              communitySideLabel: getCommunitySideLabel(profile.communitySide),
              canVote,
              hasVoted,
              currentVote: userVote?.move ?? null,
            }}
            game={{
              fen: game.fen,
              nextMoveDue: game.nextMoveDue.toISOString(),
              isGameOver: chess.isGameOver(),
              currentTurn,
              currentTurnLabel,
            }}
            voteResults={voteSummary}
          />
        </div>
      </main>
    </div>
  );
}
