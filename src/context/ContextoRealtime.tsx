"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { RealtimeChannel } from "@supabase/supabase-js";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { useChess } from "./ContextoChess";

export interface UsuarioOnline {
  userId: string;
  username: string;
  elo: number;
  status: "online" | "jugando" | "ausente";
  lastSeen: string;
}

export interface MensajeChat {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
  type: "chat" | "system";
}

export interface InvitacionLobby {
  id: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  createdAt: string;
  updatedAt: string;
  gameId: string | null;
  inviterId: string;
  inviterName: string;
  inviterElo: number;
  inviteeId: string;
  inviteeName: string;
  inviteeElo: number;
}

interface GameInvitePayload {
  targetUserId: string;
  invitation: InvitacionLobby;
}

interface InviteResponsePayload {
  invitationId: string;
  inviterId: string;
  inviteeId: string;
  inviteeName: string;
  status: "ACCEPTED" | "DECLINED";
  gameId: string | null;
}

interface ContextoRealtimeProps {
  usuariosOnline: UsuarioOnline[];
  mensajes: MensajeChat[];
  enviandoInvitacionA: string | null;
  cargandoInvitaciones: boolean;
  invitacionesEntrantes: InvitacionLobby[];
  invitacionesSalientes: InvitacionLobby[];
  enviarMensaje: (content: string) => Promise<void>;
  invitarJugador: (targetUserId: string) => Promise<void>;
  aceptarInvitacion: (invitationId: string) => Promise<void>;
  rechazarInvitacion: (invitationId: string) => Promise<void>;
  refrescarInvitaciones: () => Promise<void>;
}

const ContextoRealtime = createContext<ContextoRealtimeProps | undefined>(undefined);

function sortUsers(users: UsuarioOnline[]) {
  return [...users].sort((left, right) => {
    if (left.status !== right.status) {
      return left.status.localeCompare(right.status);
    }

    return left.username.localeCompare(right.username, "es", { sensitivity: "base" });
  });
}

export function ProveedorContextoRealtime({ children }: { children: ReactNode }) {
  const { usuario } = useChess();
  const router = useRouter();
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [usuariosOnline, setUsuariosOnline] = useState<UsuarioOnline[]>([]);
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [invitacionesEntrantes, setInvitacionesEntrantes] = useState<InvitacionLobby[]>([]);
  const [invitacionesSalientes, setInvitacionesSalientes] = useState<InvitacionLobby[]>([]);
  const [cargandoInvitaciones, setCargandoInvitaciones] = useState(false);
  const [enviandoInvitacionA, setEnviandoInvitacionA] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refrescarInvitaciones = useCallback(async () => {
    if (!usuario) {
      if (isMountedRef.current) {
        setInvitacionesEntrantes([]);
        setInvitacionesSalientes([]);
      }
      return;
    }

    setCargandoInvitaciones(true);

    try {
      const response = await fetch("/api/chess/invitations", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("No se pudieron cargar las invitaciones");
      }

      const payload = await response.json();

      if (!isMountedRef.current) {
        return;
      }

      setInvitacionesEntrantes(payload.incoming ?? []);
      setInvitacionesSalientes(payload.outgoing ?? []);
    } catch (error) {
      console.error("Error refrescando invitaciones del lobby:", error);
    } finally {
      if (isMountedRef.current) {
        setCargandoInvitaciones(false);
      }
    }
  }, [usuario]);

  useEffect(() => {
    if (!usuario) {
      setUsuariosOnline([]);
      setMensajes([]);
      setInvitacionesEntrantes([]);
      setInvitacionesSalientes([]);
      setChannel(null);
      return;
    }

    void refrescarInvitaciones();

    const refreshInterval = window.setInterval(() => {
      void refrescarInvitaciones();
    }, 20000);

    return () => {
      window.clearInterval(refreshInterval);
    };
  }, [refrescarInvitaciones, usuario]);

  const enviarMensaje = useCallback(async (content: string) => {
    if (!channel || !usuario) {
      return;
    }

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return;
    }

    const mensaje: MensajeChat = {
      id: crypto.randomUUID(),
      senderId: usuario.id,
      senderName: usuario.username,
      content: trimmedContent,
      timestamp: Date.now(),
      type: "chat",
    };

    await channel.send({
      type: "broadcast",
      event: "chat_message",
      payload: mensaje,
    });

    setMensajes((current) => [...current, mensaje]);
  }, [channel, usuario]);

  const invitarJugador = useCallback(async (targetUserId: string) => {
    if (!channel || !usuario || targetUserId === usuario.id) {
      return;
    }

    setEnviandoInvitacionA(targetUserId);

    try {
      const response = await fetch("/api/chess/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ opponentId: targetUserId }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? "No se pudo enviar la invitación");
      }

      await refrescarInvitaciones();

      const invitation: InvitacionLobby = {
        id: payload.id,
        status: payload.status,
        createdAt: payload.createdAt ?? new Date().toISOString(),
        updatedAt: payload.updatedAt ?? new Date().toISOString(),
        gameId: payload.game?.id ?? null,
        inviterId: usuario.id,
        inviterName: usuario.username,
        inviterElo: usuario.elo,
        inviteeId: targetUserId,
        inviteeName:
          usuariosOnline.find((onlineUser) => onlineUser.userId === targetUserId)?.username ?? "Jugador",
        inviteeElo:
          usuariosOnline.find((onlineUser) => onlineUser.userId === targetUserId)?.elo ?? 1000,
      };

      await channel.send({
        type: "broadcast",
        event: "game_invite",
        payload: {
          targetUserId,
          invitation,
        } satisfies GameInvitePayload,
      });

      toast.success("Invitación enviada");
    } catch (error) {
      console.error("Error enviando invitación de ajedrez:", error);
      toast.error(error instanceof Error ? error.message : "No se pudo enviar la invitación");
    } finally {
      if (isMountedRef.current) {
        setEnviandoInvitacionA(null);
      }
    }
  }, [channel, refrescarInvitaciones, usuario, usuariosOnline]);

  const aceptarInvitacion = useCallback(async (invitationId: string) => {
    if (!channel || !usuario) {
      return;
    }

    const invitation = invitacionesEntrantes.find((currentInvitation) => currentInvitation.id === invitationId);
    if (!invitation) {
      await refrescarInvitaciones();
      return;
    }

    try {
      const response = await fetch("/api/chess/invitations/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ invitationId }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? "No se pudo aceptar la invitación");
      }

      await channel.send({
        type: "broadcast",
        event: "game_invite_response",
        payload: {
          invitationId,
          inviterId: invitation.inviterId,
          inviteeId: usuario.id,
          inviteeName: usuario.username,
          status: "ACCEPTED",
          gameId: payload?.gameId ?? invitation.gameId,
        } satisfies InviteResponsePayload,
      });

      await refrescarInvitaciones();

      const gameId = payload?.gameId ?? invitation.gameId;
      if (gameId) {
        router.push(`/chess/play/${gameId}`);
      }
    } catch (error) {
      console.error("Error aceptando invitación:", error);
      toast.error(error instanceof Error ? error.message : "No se pudo aceptar la invitación");
    }
  }, [channel, invitacionesEntrantes, refrescarInvitaciones, router, usuario]);

  const rechazarInvitacion = useCallback(async (invitationId: string) => {
    if (!channel || !usuario) {
      return;
    }

    const invitation = invitacionesEntrantes.find((currentInvitation) => currentInvitation.id === invitationId);
    if (!invitation) {
      await refrescarInvitaciones();
      return;
    }

    try {
      const response = await fetch("/api/chess/invitations/decline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ invitationId }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? "No se pudo rechazar la invitación");
      }

      await channel.send({
        type: "broadcast",
        event: "game_invite_response",
        payload: {
          invitationId,
          inviterId: invitation.inviterId,
          inviteeId: usuario.id,
          inviteeName: usuario.username,
          status: "DECLINED",
          gameId: null,
        } satisfies InviteResponsePayload,
      });

      await refrescarInvitaciones();
      toast.success("Invitación rechazada");
    } catch (error) {
      console.error("Error rechazando invitación:", error);
      toast.error(error instanceof Error ? error.message : "No se pudo rechazar la invitación");
    }
  }, [channel, invitacionesEntrantes, refrescarInvitaciones, usuario]);

  useEffect(() => {
    const realtimeClient = supabase;

    if (!usuario || !realtimeClient) {
      return;
    }

    const newChannel = realtimeClient.channel("global_lobby", {
      config: {
        presence: {
          key: usuario.id,
        },
      },
    });

    newChannel
      .on("presence", { event: "sync" }, () => {
        const state = newChannel.presenceState();
        const presences = Object.values(state).flat() as unknown as Array<{
          userId: string;
          username: string;
          elo?: number;
          status?: UsuarioOnline["status"];
          online_at?: string;
        }>;

        const uniqueUsers = presences
          .filter(
            (presence): presence is {
              userId: string;
              username: string;
              elo?: number;
              status?: UsuarioOnline["status"];
              online_at?: string;
            } =>
              typeof presence?.userId === "string" && typeof presence?.username === "string"
          )
          .map((presence) => ({
            userId: presence.userId,
            username: presence.username,
            elo: typeof presence.elo === "number" ? presence.elo : 1000,
            status: presence.status ?? "online",
            lastSeen: presence.online_at ?? new Date().toISOString(),
          }))
          .filter(
            (presence, index, current) =>
              presence.userId !== usuario.id &&
              index === current.findIndex((candidate) => candidate.userId === presence.userId)
          );

        setUsuariosOnline(sortUsers(uniqueUsers));
      })
      .on("broadcast", { event: "chat_message" }, ({ payload }) => {
        setMensajes((current) => [...current, payload as MensajeChat]);
      })
      .on("broadcast", { event: "game_invite" }, ({ payload }) => {
        const data = payload as GameInvitePayload;

        if (data.targetUserId !== usuario.id) {
          return;
        }

        void refrescarInvitaciones();

        toast((toastRef) => (
          <div className="flex max-w-sm flex-col gap-3">
            <div>
              <p className="text-sm font-semibold text-zinc-50">
                {data.invitation.inviterName} te ha retado a una partida
              </p>
              <p className="mt-1 text-xs text-zinc-300">
                Acepta y entra directamente en la mesa de juego.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  void aceptarInvitacion(data.invitation.id);
                  toast.dismiss(toastRef.id);
                }}
                className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-emerald-950 transition-colors hover:bg-emerald-400"
              >
                Aceptar
              </button>
              <button
                onClick={() => {
                  void rechazarInvitacion(data.invitation.id);
                  toast.dismiss(toastRef.id);
                }}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-100 transition-colors hover:bg-white/10"
              >
                Rechazar
              </button>
            </div>
          </div>
        ));
      })
      .on("broadcast", { event: "game_invite_response" }, ({ payload }) => {
        const data = payload as InviteResponsePayload;

        if (data.inviterId !== usuario.id) {
          return;
        }

        void refrescarInvitaciones();

        if (data.status === "ACCEPTED" && data.gameId) {
          toast.success(`${data.inviteeName} ha aceptado tu invitación.`);
          router.push(`/chess/play/${data.gameId}`);
          return;
        }

        toast(`${data.inviteeName} ha rechazado tu invitación.`);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await newChannel.track({
            userId: usuario.id,
            username: usuario.username,
            elo: usuario.elo,
            status: "online",
            online_at: new Date().toISOString(),
          });
        }
      });

    setChannel(newChannel);

    return () => {
      setChannel((currentChannel) => (currentChannel === newChannel ? null : currentChannel));
      realtimeClient.removeChannel(newChannel);
    };
  }, [aceptarInvitacion, rechazarInvitacion, refrescarInvitaciones, router, usuario]);

  return (
    <ContextoRealtime.Provider
      value={{
        usuariosOnline,
        mensajes,
        enviandoInvitacionA,
        cargandoInvitaciones,
        invitacionesEntrantes,
        invitacionesSalientes,
        enviarMensaje,
        invitarJugador,
        aceptarInvitacion,
        rechazarInvitacion,
        refrescarInvitaciones,
      }}
    >
      {children}
    </ContextoRealtime.Provider>
  );
}

export function useRealtime() {
  const context = useContext(ContextoRealtime);

  if (!context) {
    throw new Error("useRealtime debe usarse dentro de ProveedorContextoRealtime");
  }

  return context;
}
