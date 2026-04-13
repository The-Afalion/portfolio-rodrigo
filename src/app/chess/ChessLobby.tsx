"use client";

import { Crown, Loader2, Radio, Swords, Users } from "lucide-react";
import Link from "next/link";
import { useRealtime } from "@/context/ContextoRealtime";
import { useChess } from "@/context/ContextoChess";

type ChessLobbyProps = {
  compact?: boolean;
};

function formatRelativeTime(value: string) {
  const date = new Date(value);
  const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));

  if (seconds < 60) {
    return "ahora mismo";
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `hace ${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `hace ${hours} h`;
  }

  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChessLobby({ compact = false }: ChessLobbyProps) {
  const { usuario } = useChess();
  const {
    usuariosOnline,
    enviandoInvitacionA,
    cargandoInvitaciones,
    invitacionesEntrantes,
    invitacionesSalientes,
    invitarJugador,
    aceptarInvitacion,
    rechazarInvitacion,
  } = useRealtime();

  if (!usuario) {
    return null;
  }

  return (
    <section className={compact ? "h-full" : "mb-16"}>
      <div className={compact ? "mb-6 border-b border-white/10 pb-6" : "mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"}>
        {compact ? (
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Lobby global</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Rivales disponibles ahora
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                Consulta quién está conectado, lanza retos al instante y responde invitaciones sin salir de la sección.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.03] px-4 py-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <Users size={16} />
                  <span className="text-xs uppercase tracking-[0.2em]">Online</span>
                </div>
                <p className="mt-3 text-3xl font-semibold text-white">{usuariosOnline.length}</p>
              </div>
              <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.03] px-4 py-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <Swords size={16} />
                  <span className="text-xs uppercase tracking-[0.2em]">Entrantes</span>
                </div>
                <p className="mt-3 text-3xl font-semibold text-white">{invitacionesEntrantes.length}</p>
              </div>
              <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.03] px-4 py-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <Radio size={16} />
                  <span className="text-xs uppercase tracking-[0.2em]">Salientes</span>
                </div>
                <p className="mt-3 text-3xl font-semibold text-white">{invitacionesSalientes.length}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Lobby global
              </p>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                Jugadores conectados en tiempo real
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                Mira quién está online, lanza retos directos y responde invitaciones sin salir del club.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="surface-panel-muted min-w-[150px] px-5 py-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users size={16} />
                  <span className="text-xs uppercase tracking-[0.2em]">Online</span>
                </div>
                <p className="mt-3 text-3xl font-semibold text-foreground">{usuariosOnline.length}</p>
              </div>
              <div className="surface-panel-muted min-w-[150px] px-5 py-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Swords size={16} />
                  <span className="text-xs uppercase tracking-[0.2em]">Entrantes</span>
                </div>
                <p className="mt-3 text-3xl font-semibold text-foreground">{invitacionesEntrantes.length}</p>
              </div>
              <div className="surface-panel-muted min-w-[150px] px-5 py-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Radio size={16} />
                  <span className="text-xs uppercase tracking-[0.2em]">Salientes</span>
                </div>
                <p className="mt-3 text-3xl font-semibold text-foreground">{invitacionesSalientes.length}</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className={`grid gap-6 ${compact ? "2xl:grid-cols-[1.2fr_0.8fr]" : "xl:grid-cols-[1.25fr_0.75fr]"}`}>
        <div className="surface-panel overflow-hidden">
          <div className={`flex items-center justify-between px-6 py-5 ${compact ? "border-b border-white/10" : "border-b border-border/60"}`}>
            <div>
              <p className={`text-sm font-semibold ${compact ? "text-white" : "text-foreground"}`}>Jugadores disponibles</p>
              <p className={`mt-1 text-sm ${compact ? "text-slate-300" : "text-muted-foreground"}`}>
                Reta a cualquier usuario conectado a una partida de ajedrez.
              </p>
            </div>
            <div className={`rounded-full px-3 py-1 text-xs font-semibold ${compact ? "border border-emerald-300/20 bg-emerald-300/10 text-emerald-100" : "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"}`}>
              En vivo
            </div>
          </div>

          <div className={compact ? "divide-y divide-white/10" : "divide-y divide-border/50"}>
            {usuariosOnline.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className={`text-lg font-medium ${compact ? "text-white" : "text-foreground"}`}>Ahora mismo no hay rivales conectados</p>
                <p className={`mt-2 text-sm ${compact ? "text-slate-300" : "text-muted-foreground"}`}>
                  Deja esta pestaña abierta y el lobby se actualizará solo cuando entre alguien.
                </p>
              </div>
            ) : (
              usuariosOnline.map((player) => {
                const alreadyInvited = invitacionesSalientes.some(
                  (invitation) => invitation.inviteeId === player.userId
                );
                const hasIncomingInvite = invitacionesEntrantes.some(
                  (invitation) => invitation.inviterId === player.userId
                );
                const isBusy = alreadyInvited || enviandoInvitacionA === player.userId;

                return (
                  <div
                    key={player.userId}
                    className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`relative flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-semibold ${compact ? "border border-white/10 bg-white/[0.04] text-white" : "border border-border/70 bg-background text-foreground"}`}>
                        {player.username.slice(0, 2).toUpperCase()}
                        <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-400 ${compact ? "border-2 border-[#0b111b]" : "border-2 border-card"}`} />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className={`text-base font-semibold ${compact ? "text-white" : "text-foreground"}`}>{player.username}</p>
                          <span className={`rounded-full px-2.5 py-1 text-xs ${compact ? "border border-white/10 bg-white/[0.04] text-slate-300" : "border border-border/70 bg-background/80 text-muted-foreground"}`}>
                            ELO {player.elo}
                          </span>
                          {hasIncomingInvite ? (
                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${compact ? "border border-amber-300/20 bg-amber-300/10 text-amber-100" : "border border-amber-400/30 bg-amber-400/10 text-amber-300"}`}>
                              Ya te ha invitado
                            </span>
                          ) : null}
                        </div>
                        <p className={`mt-1 text-sm ${compact ? "text-slate-400" : "text-muted-foreground"}`}>
                          Conectado {formatRelativeTime(player.lastSeen)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {hasIncomingInvite ? (
                        <button
                          onClick={() => {
                            const invitation = invitacionesEntrantes.find(
                              (currentInvitation) => currentInvitation.inviterId === player.userId
                            );

                            if (invitation) {
                              void aceptarInvitacion(invitation.id);
                            }
                          }}
                          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
                        >
                          Aceptar reto
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              void invitarJugador(player.userId, {
                                modeKey: "chess_rapid_10m",
                              })
                            }
                            disabled={isBusy}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {enviandoInvitacionA === player.userId ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                Enviando...
                              </>
                            ) : alreadyInvited ? (
                              "Invitación pendiente"
                            ) : (
                              <>
                                <Crown size={16} />
                                Reto 10 min
                              </>
                            )}
                          </button>
                          <button
                            onClick={() =>
                              void invitarJugador(player.userId, {
                                modeKey: "chess_correspondence_3d",
                              })
                            }
                            disabled={isBusy}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-border/80 bg-background/80 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/60 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Correspondencia
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-panel overflow-hidden">
            <div className={`px-6 py-5 ${compact ? "border-b border-white/10" : "border-b border-border/60"}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className={`text-sm font-semibold ${compact ? "text-white" : "text-foreground"}`}>Retos recibidos</p>
                  <p className={`mt-1 text-sm ${compact ? "text-slate-300" : "text-muted-foreground"}`}>
                    Acepta un reto y entra directo a la partida.
                  </p>
                </div>
                {cargandoInvitaciones ? <Loader2 size={16} className={`animate-spin ${compact ? "text-slate-400" : "text-muted-foreground"}`} /> : null}
              </div>
            </div>

            <div className="space-y-3 p-4">
              {invitacionesEntrantes.length === 0 ? (
                <div className={`rounded-3xl border border-dashed px-4 py-6 text-center text-sm ${compact ? "border-white/10 bg-white/[0.02] text-slate-400" : "border-border/70 bg-background/45 text-muted-foreground"}`}>
                  No tienes retos pendientes.
                </div>
              ) : (
                invitacionesEntrantes.map((invitation) => (
                  <div
                    key={invitation.id}
                    className={`rounded-3xl border p-4 ${compact ? "border-white/10 bg-white/[0.03]" : "border-border/70 bg-background/70"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={`font-medium ${compact ? "text-white" : "text-foreground"}`}>{invitation.inviterName}</p>
                        <p className={`mt-1 text-sm ${compact ? "text-slate-300" : "text-muted-foreground"}`}>
                          ELO {invitation.inviterElo} · {invitation.modeLabel} · {formatRelativeTime(invitation.createdAt)}
                        </p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${compact ? "border border-emerald-300/20 bg-emerald-300/10 text-emerald-100" : "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"}`}>
                        Pendiente
                      </span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => void aceptarInvitacion(invitation.id)}
                        className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
                      >
                        Aceptar
                      </button>
                      <button
                        onClick={() => void rechazarInvitacion(invitation.id)}
                        className="rounded-full border border-border/80 bg-background/80 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary/60"
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="surface-panel overflow-hidden">
            <div className={`px-6 py-5 ${compact ? "border-b border-white/10" : "border-b border-border/60"}`}>
              <p className={`text-sm font-semibold ${compact ? "text-white" : "text-foreground"}`}>Retos enviados</p>
              <p className={`mt-1 text-sm ${compact ? "text-slate-300" : "text-muted-foreground"}`}>
                Tus desafíos activos se mantienen aquí hasta que te respondan.
              </p>
            </div>

            <div className="space-y-3 p-4">
              {invitacionesSalientes.length === 0 ? (
                <div className={`rounded-3xl border border-dashed px-4 py-6 text-center text-sm ${compact ? "border-white/10 bg-white/[0.02] text-slate-400" : "border-border/70 bg-background/45 text-muted-foreground"}`}>
                  Todavía no has retado a nadie.
                </div>
              ) : (
                invitacionesSalientes.map((invitation) => (
                  <div
                    key={invitation.id}
                    className={`rounded-3xl border p-4 ${compact ? "border-white/10 bg-white/[0.03]" : "border-border/70 bg-background/70"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={`font-medium ${compact ? "text-white" : "text-foreground"}`}>{invitation.inviteeName}</p>
                        <p className={`mt-1 text-sm ${compact ? "text-slate-300" : "text-muted-foreground"}`}>
                          ELO {invitation.inviteeElo} · {invitation.modeLabel} · enviado {formatRelativeTime(invitation.createdAt)}
                        </p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${compact ? "border border-sky-300/20 bg-sky-300/10 text-sky-100" : "border border-sky-400/30 bg-sky-400/10 text-sky-300"}`}>
                        Esperando
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={`surface-panel-muted px-6 py-5 ${compact ? "border border-white/10 bg-white/[0.03]" : ""}`}>
            <p className={`text-sm font-semibold ${compact ? "text-white" : "text-foreground"}`}>Flujo recomendado</p>
            <p className={`mt-2 text-sm leading-7 ${compact ? "text-slate-300" : "text-muted-foreground"}`}>
              Invita desde el lobby, espera la aceptación y ambos entraréis a la misma partida automáticamente.
            </p>
            <Link
              href="/chess/invitations"
              className={`mt-4 inline-flex text-sm font-medium underline underline-offset-4 ${compact ? "text-amber-200" : "text-foreground"}`}
            >
              Ver bandeja completa de invitaciones
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
