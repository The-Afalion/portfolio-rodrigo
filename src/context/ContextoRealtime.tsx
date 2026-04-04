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

type RealtimeStatus = "connecting" | "connected" | "disconnected";

interface ContextoRealtimeProps {
  usuariosOnline: UsuarioOnline[];
  mensajes: MensajeChat[];
  enviandoInvitacionA: string | null;
  cargandoInvitaciones: boolean;
  invitacionesEntrantes: InvitacionLobby[];
  invitacionesSalientes: InvitacionLobby[];
  estadoRealtime: RealtimeStatus;
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

function sortMessages(messages: MensajeChat[]) {
  return [...messages].sort((left, right) => left.timestamp - right.timestamp);
}

export function ProveedorContextoRealtime({ children }: { children: ReactNode }) {
  const { usuario } = useChess();
  const router = useRouter();
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [estadoRealtime, setEstadoRealtime] = useState<RealtimeStatus>("disconnected");
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

  const mergeMessages = useCallback((incomingMessages: MensajeChat[]) => {
    if (incomingMessages.length === 0) {
      return;
    }

    setMensajes((currentMessages) => {
      const nextMessages = [...currentMessages];
      const knownIds = new Set(currentMessages.map((message) => message.id));

      incomingMessages.forEach((message) => {
        if (!knownIds.has(message.id)) {
          nextMessages.push(message);
          knownIds.add(message.id);
        }
      });

      return sortMessages(nextMessages).slice(-80);
    });
  }, []);

  const cargarMensajes = useCallback(async () => {
    if (!usuario) {
      if (isMountedRef.current) {
        setMensajes([]);
      }
      return;
    }

    try {
      const response = await fetch("/api/chess/lobby-messages", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("No se pudo cargar el chat global");
      }

      const payload = await response.json();

      if (!isMountedRef.current) {
        return;
      }

      const loadedMessages = Array.isArray(payload.messages) ? (payload.messages as MensajeChat[]) : [];
      setMensajes(sortMessages(loadedMessages).slice(-80));
    } catch (error) {
      console.error("Error cargando mensajes del lobby:", error);
    }
  }, [usuario]);

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
      setEstadoRealtime("disconnected");
      return;
    }

    void refrescarInvitaciones();
    void cargarMensajes();

    const refreshInvitationsInterval = window.setInterval(() => {
      void refrescarInvitaciones();
    }, 20000);

    const refreshMessagesInterval = window.setInterval(() => {
      void cargarMensajes();
    }, 8000);

    return () => {
      window.clearInterval(refreshInvitationsInterval);
      window.clearInterval(refreshMessagesInterval);
    };
  }, [cargarMensajes, refrescarInvitaciones, usuario]);

  const emitirEventoRealtime = useCallback(
    async (event: string, payload: unknown) => {
      if (!channel || estadoRealtime !== "connected") {
        return;
      }

      const sendStatus = await channel.send({
        type: "broadcast",
        event,
        payload,
      });

      if (sendStatus !== "ok") {
        console.warn(`Realtime no ha confirmado el evento ${event}.`, sendStatus);
      }
    },
    [channel, estadoRealtime]
  );

  const enviarMensaje = useCallback(
    async (content: string) => {
      if (!usuario) {
        return;
      }

      const trimmedContent = content.trim();
      if (!trimmedContent) {
        return;
      }

      const response = await fetch("/api/chess/lobby-messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ content: trimmedContent }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.message) {
        const errorMessage =
          typeof payload?.error === "string" ? payload.error : "No se ha podido enviar el mensaje.";
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      const message = payload.message as MensajeChat;
      mergeMessages([message]);
      await emitirEventoRealtime("chat_message", message);
    },
    [emitirEventoRealtime, mergeMessages, usuario]
  );

  const invitarJugador = useCallback(
    async (targetUserId: string) => {
      if (!usuario || targetUserId === usuario.id) {
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

        await emitirEventoRealtime("game_invite", {
          targetUserId,
          invitation,
        } satisfies GameInvitePayload);

        toast.success("Invitación enviada");
      } catch (error) {
        console.error("Error enviando invitación de ajedrez:", error);
        toast.error(error instanceof Error ? error.message : "No se pudo enviar la invitación");
      } finally {
        if (isMountedRef.current) {
          setEnviandoInvitacionA(null);
        }
      }
    },
    [emitirEventoRealtime, refrescarInvitaciones, usuario, usuariosOnline]
  );

  const aceptarInvitacion = useCallback(
    async (invitationId: string) => {
      if (!usuario) {
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

        await emitirEventoRealtime("game_invite_response", {
          invitationId,
          inviterId: invitation.inviterId,
          inviteeId: usuario.id,
          inviteeName: usuario.username,
          status: "ACCEPTED",
          gameId: payload?.gameId ?? invitation.gameId,
        } satisfies InviteResponsePayload);

        await refrescarInvitaciones();

        const gameId = payload?.gameId ?? invitation.gameId;
        if (gameId) {
          router.push(`/chess/play/${gameId}`);
        }
      } catch (error) {
        console.error("Error aceptando invitación:", error);
        toast.error(error instanceof Error ? error.message : "No se pudo aceptar la invitación");
      }
    },
    [emitirEventoRealtime, invitacionesEntrantes, refrescarInvitaciones, router, usuario]
  );

  const rechazarInvitacion = useCallback(
    async (invitationId: string) => {
      if (!usuario) {
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

        await emitirEventoRealtime("game_invite_response", {
          invitationId,
          inviterId: invitation.inviterId,
          inviteeId: usuario.id,
          inviteeName: usuario.username,
          status: "DECLINED",
          gameId: null,
        } satisfies InviteResponsePayload);

        await refrescarInvitaciones();
        toast.success("Invitación rechazada");
      } catch (error) {
        console.error("Error rechazando invitación:", error);
        toast.error(error instanceof Error ? error.message : "No se pudo rechazar la invitación");
      }
    },
    [emitirEventoRealtime, invitacionesEntrantes, refrescarInvitaciones, usuario]
  );

  useEffect(() => {
    const realtimeClient = supabase;

    if (!usuario || !realtimeClient) {
      return;
    }

    setEstadoRealtime("connecting");

    const newChannel = realtimeClient.channel("global_lobby", {
      config: {
        broadcast: {
          ack: true,
          self: false,
        },
        presence: {
          key: usuario.id,
        },
      },
    });

    newChannel
      .on("presence", { event: "sync" }, () => {
        const state = newChannel.presenceState();
        const presences = Object.values(state).flat() as Array<{
          userId?: string;
          username?: string;
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
            } => typeof presence.userId === "string" && typeof presence.username === "string"
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
        mergeMessages([payload as MensajeChat]);
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
          setEstadoRealtime("connected");
          await newChannel.track({
            userId: usuario.id,
            username: usuario.username,
            elo: usuario.elo,
            status: "online",
            online_at: new Date().toISOString(),
          });
          await Promise.all([refrescarInvitaciones(), cargarMensajes()]);
          return;
        }

        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          setEstadoRealtime("disconnected");
        }
      });

    setChannel(newChannel);

    return () => {
      setChannel((currentChannel) => (currentChannel === newChannel ? null : currentChannel));
      setEstadoRealtime("disconnected");
      realtimeClient.removeChannel(newChannel);
    };
  }, [aceptarInvitacion, cargarMensajes, mergeMessages, rechazarInvitacion, refrescarInvitaciones, router, usuario]);

  return (
    <ContextoRealtime.Provider
      value={{
        usuariosOnline,
        mensajes,
        enviandoInvitacionA,
        cargandoInvitaciones,
        invitacionesEntrantes,
        invitacionesSalientes,
        estadoRealtime,
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
