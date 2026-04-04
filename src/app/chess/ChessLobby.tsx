"use client";

import { motion } from "framer-motion";
import { Crown, Loader2, Radio, Swords, Users } from "lucide-react";
import Link from "next/link";
import { useRealtime } from "@/context/ContextoRealtime";
import { useChess } from "@/context/ContextoChess";

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

export default function ChessLobby() {
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
    <section className="mb-16">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
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
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="surface-panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/60 px-6 py-5">
            <div>
              <p className="text-sm font-semibold text-foreground">Jugadores disponibles</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Reta a cualquier usuario conectado a una partida de ajedrez.
              </p>
            </div>
            <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              En vivo
            </div>
          </div>

          <div className="divide-y divide-border/50">
            {usuariosOnline.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-lg font-medium text-foreground">Ahora mismo no hay rivales conectados</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Deja esta pestaña abierta y el lobby se actualizará solo cuando entre alguien.
                </p>
              </div>
            ) : (
              usuariosOnline.map((player, index) => {
                const alreadyInvited = invitacionesSalientes.some(
                  (invitation) => invitation.inviteeId === player.userId
                );
                const hasIncomingInvite = invitacionesEntrantes.some(
                  (invitation) => invitation.inviterId === player.userId
                );
                const isBusy = alreadyInvited || enviandoInvitacionA === player.userId;

                return (
                  <motion.div
                    key={player.userId}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-border/70 bg-background text-lg font-semibold text-foreground">
                        {player.username.slice(0, 2).toUpperCase()}
                        <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card bg-emerald-400" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-semibold text-foreground">{player.username}</p>
                          <span className="rounded-full border border-border/70 bg-background/80 px-2.5 py-1 text-xs text-muted-foreground">
                            ELO {player.elo}
                          </span>
                          {hasIncomingInvite ? (
                            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-xs font-medium text-amber-300">
                              Ya te ha invitado
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
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
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-panel overflow-hidden">
            <div className="border-b border-border/60 px-6 py-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Retos recibidos</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Acepta un reto y entra directo a la partida.
                  </p>
                </div>
                {cargandoInvitaciones ? <Loader2 size={16} className="animate-spin text-muted-foreground" /> : null}
              </div>
            </div>

            <div className="space-y-3 p-4">
              {invitacionesEntrantes.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border/70 bg-background/45 px-4 py-6 text-center text-sm text-muted-foreground">
                  No tienes retos pendientes.
                </div>
              ) : (
                invitacionesEntrantes.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="rounded-3xl border border-border/70 bg-background/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{invitation.inviterName}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          ELO {invitation.inviterElo} · {invitation.modeLabel} · {formatRelativeTime(invitation.createdAt)}
                        </p>
                      </div>
                      <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
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
            <div className="border-b border-border/60 px-6 py-5">
              <p className="text-sm font-semibold text-foreground">Retos enviados</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tus desafíos activos se mantienen aquí hasta que te respondan.
              </p>
            </div>

            <div className="space-y-3 p-4">
              {invitacionesSalientes.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border/70 bg-background/45 px-4 py-6 text-center text-sm text-muted-foreground">
                  Todavía no has retado a nadie.
                </div>
              ) : (
                invitacionesSalientes.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="rounded-3xl border border-border/70 bg-background/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{invitation.inviteeName}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          ELO {invitation.inviteeElo} · {invitation.modeLabel} · enviado {formatRelativeTime(invitation.createdAt)}
                        </p>
                      </div>
                      <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-2.5 py-1 text-xs font-medium text-sky-300">
                        Esperando
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="surface-panel-muted px-6 py-5">
            <p className="text-sm font-semibold text-foreground">Flujo recomendado</p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              Invita desde el lobby, espera la aceptación y ambos entraréis a la misma partida automáticamente.
            </p>
            <Link
              href="/chess/invitations"
              className="mt-4 inline-flex text-sm font-medium text-foreground underline underline-offset-4"
            >
              Ver bandeja completa de invitaciones
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
