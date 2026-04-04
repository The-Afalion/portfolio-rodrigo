"use client";

import Link from "next/link";
import { ArrowLeft, Loader2, Mailbox, Swords } from "lucide-react";
import { useChess } from "@/context/ContextoChess";
import { useRealtime } from "@/context/ContextoRealtime";

function formatInvitationDate(value: string) {
  return new Date(value).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function InvitationsPage() {
  const { usuario } = useChess();
  const {
    cargandoInvitaciones,
    invitacionesEntrantes,
    invitacionesSalientes,
    aceptarInvitacion,
    rechazarInvitacion,
  } = useRealtime();

  if (!usuario) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center px-4">
        <div className="surface-panel w-full max-w-xl p-8 text-center">
          <h1 className="text-2xl font-semibold text-foreground">Necesitas iniciar sesión</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Entra con tu cuenta global para revisar y responder tus invitaciones.
          </p>
          <Link
            href="/chess"
            className="mt-6 inline-flex rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background"
          >
            Volver a Chess Club
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell min-h-screen">
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Link
              href="/chess"
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft size={16} />
              Volver al lobby
            </Link>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Bandeja de retos
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">Tus invitaciones</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
              Gestiona aquí los retos entrantes y salientes del lobby global de ajedrez.
            </p>
          </div>

          {cargandoInvitaciones ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-2 text-sm text-muted-foreground">
              <Loader2 size={16} className="animate-spin" />
              Actualizando
            </div>
          ) : null}
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="surface-panel overflow-hidden">
            <div className="border-b border-border/60 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background">
                  <Mailbox size={18} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Recibidas</h2>
                  <p className="text-sm text-muted-foreground">Acepta o rechaza los retos pendientes.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4">
              {invitacionesEntrantes.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border/70 bg-background/45 px-4 py-8 text-center text-sm text-muted-foreground">
                  No tienes invitaciones pendientes.
                </div>
              ) : (
                invitacionesEntrantes.map((invitation) => (
                  <div key={invitation.id} className="rounded-3xl border border-border/70 bg-background/70 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{invitation.inviterName}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          ELO {invitation.inviterElo} · {formatInvitationDate(invitation.createdAt)}
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
          </section>

          <section className="surface-panel overflow-hidden">
            <div className="border-b border-border/60 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background">
                  <Swords size={18} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Enviadas</h2>
                  <p className="text-sm text-muted-foreground">Retos que siguen esperando respuesta.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4">
              {invitacionesSalientes.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border/70 bg-background/45 px-4 py-8 text-center text-sm text-muted-foreground">
                  Aún no has enviado ningún reto.
                </div>
              ) : (
                invitacionesSalientes.map((invitation) => (
                  <div key={invitation.id} className="rounded-3xl border border-border/70 bg-background/70 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{invitation.inviteeName}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          ELO {invitation.inviteeElo} · {formatInvitationDate(invitation.createdAt)}
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
          </section>
        </div>
      </main>
    </div>
  );
}
