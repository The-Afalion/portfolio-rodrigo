"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Clock3, Loader2, Mail, MessageSquare, Search, Send, Sparkles, Swords, UserPlus, Users } from "lucide-react";
import toast from "react-hot-toast";
import { useChess } from "@/context/ContextoChess";
import { useRealtime } from "@/context/ContextoRealtime";

type FriendSummary = {
  id: string;
  friendId: string;
  friendName: string;
  friendElo: number;
  createdAt: string;
  acceptedAt: string | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
};

type FriendRequestSummary = {
  id: string;
  userId: string;
  name: string;
  elo: number;
  createdAt: string;
};

type SearchResult = {
  id: string;
  email: string;
  displayName: string;
  elo: number;
  friendshipStatus: string | null;
};

type FriendMessage = {
  id: string;
  friendshipId: string;
  senderId: string;
  content: string;
  createdAt: string;
};

function formatRelativeDate(value?: string | null) {
  if (!value) {
    return "Sin actividad aún";
  }

  const date = new Date(value);
  const diffMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));

  if (diffMinutes < 1) {
    return "ahora";
  }

  if (diffMinutes < 60) {
    return `hace ${diffMinutes} min`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `hace ${diffHours} h`;
  }

  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
}

export default function ChessFriendsPanel() {
  const { usuario } = useChess();
  const { invitarJugador } = useRealtime();
  const [friends, setFriends] = useState<FriendSummary[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequestSummary[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequestSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loadingPanel, setLoadingPanel] = useState(true);
  const [selectedFriendshipId, setSelectedFriendshipId] = useState<string | null>(null);
  const [messages, setMessages] = useState<FriendMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageDraft, setMessageDraft] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedFriend = useMemo(
    () => friends.find((friend) => friend.id === selectedFriendshipId) ?? null,
    [friends, selectedFriendshipId]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadFriends = useCallback(async () => {
    if (!usuario) {
      return;
    }

    try {
      const response = await fetch("/api/chess/friends", {
        cache: "no-store",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("No se pudieron cargar los amigos.");
      }

      const payload = await response.json();
      const nextFriends = (payload.friends ?? []) as FriendSummary[];

      setFriends(nextFriends);
      setIncomingRequests((payload.incomingRequests ?? []) as FriendRequestSummary[]);
      setOutgoingRequests((payload.outgoingRequests ?? []) as FriendRequestSummary[]);

      setSelectedFriendshipId((current) => {
        if (current && nextFriends.some((friend) => friend.id === current)) {
          return current;
        }

        return nextFriends[0]?.id ?? null;
      });
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "No se pudo cargar la zona social.");
    } finally {
      setLoadingPanel(false);
    }
  }, [usuario]);

  const loadMessages = useCallback(async (friendshipId: string) => {
    setLoadingMessages(true);

    try {
      const response = await fetch(`/api/chess/friends/messages?friendshipId=${friendshipId}`, {
        cache: "no-store",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("No se pudieron cargar los mensajes.");
      }

      const payload = await response.json();
      setMessages((payload.messages ?? []) as FriendMessage[]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (!usuario) {
      return;
    }

    void loadFriends();
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadFriends();
      }
    }, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadFriends, usuario]);

  useEffect(() => {
    if (!selectedFriendshipId) {
      setMessages([]);
      return;
    }

    void loadMessages(selectedFriendshipId);
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadMessages(selectedFriendshipId);
      }
    }, 8000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadMessages, selectedFriendshipId]);

  async function runSearch() {
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery.length < 2) {
      toast.error("Escribe al menos 2 caracteres para buscar.");
      return;
    }

    setSearching(true);

    try {
      const response = await fetch(`/api/chess/friends/search?q=${encodeURIComponent(trimmedQuery)}`, {
        cache: "no-store",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("No se pudo completar la búsqueda.");
      }

      const payload = await response.json();
      setSearchResults((payload.results ?? []) as SearchResult[]);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Búsqueda no disponible.");
    } finally {
      setSearching(false);
    }
  }

  async function sendFriendRequest(targetUserId: string) {
    try {
      const response = await fetch("/api/chess/friends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ targetUserId }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? "No se pudo enviar la solicitud.");
      }

      toast.success("Solicitud enviada.");
      await loadFriends();
      await runSearch();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "No se pudo enviar la solicitud.");
    }
  }

  async function resolveRequest(friendshipId: string, action: "accept" | "decline") {
    try {
      const response = await fetch(`/api/chess/friends/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ friendshipId }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? "No se pudo actualizar la solicitud.");
      }

      toast.success(action === "accept" ? "Amistad aceptada." : "Solicitud rechazada.");
      await loadFriends();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "No se pudo procesar la solicitud.");
    }
  }

  async function sendDirectMessage() {
    if (!selectedFriend || !messageDraft.trim()) {
      return;
    }

    setSendingMessage(true);

    try {
      const response = await fetch("/api/chess/friends/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          friendshipId: selectedFriend.id,
          content: messageDraft,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? "No se pudo enviar el mensaje.");
      }

      setMessageDraft("");
      await Promise.all([loadFriends(), loadMessages(selectedFriend.id)]);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "No se pudo enviar el mensaje.");
    } finally {
      setSendingMessage(false);
    }
  }

  if (!usuario) {
    return null;
  }

  return (
    <section className="mb-16">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Zona social
        </p>
        <h3 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          Amigos, mensajes privados y retos por modo
        </h3>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
          Esta capa ya está preparada para crecer hacia más minijuegos con `modeKey`, pero desde hoy puedes
          gestionar amistades, hablar por privado y lanzar desafíos de ajedrez con ritmo rápido o por correspondencia.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <div className="surface-panel overflow-hidden">
            <div className="border-b border-border/60 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background">
                  <UserPlus size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Añadir amigos</p>
                  <p className="text-sm text-muted-foreground">
                    Busca por nombre visible o correo para conectar dentro del club.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void runSearch();
                    }
                  }}
                  placeholder="Busca por correo o alias..."
                  className="flex-1 rounded-2xl border border-border/70 bg-background/75 px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary/60"
                />
                <button
                  onClick={() => void runSearch()}
                  disabled={searching}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-4 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                  Buscar
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {searchResults.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-border/70 bg-background/45 px-4 py-6 text-center text-sm text-muted-foreground">
                    Haz una búsqueda para enviar solicitudes.
                  </div>
                ) : (
                  searchResults.map((result) => (
                    <div key={result.id} className="rounded-3xl border border-border/70 bg-background/70 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">{result.displayName}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {result.email} · ELO {result.elo}
                          </p>
                        </div>
                        <button
                          onClick={() => void sendFriendRequest(result.id)}
                          disabled={result.friendshipStatus === "ACCEPTED" || result.friendshipStatus === "PENDING"}
                          className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {result.friendshipStatus === "ACCEPTED"
                            ? "Ya sois amigos"
                            : result.friendshipStatus === "PENDING"
                              ? "Solicitud pendiente"
                              : result.friendshipStatus === "DECLINED"
                                ? "Reintentar"
                                : "Añadir"}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="surface-panel overflow-hidden">
            <div className="border-b border-border/60 px-6 py-5">
              <p className="text-sm font-semibold text-foreground">Solicitudes pendientes</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Responde a las peticiones entrantes o revisa las que ya has mandado.
              </p>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Recibidas
                </p>
                <div className="space-y-3">
                  {incomingRequests.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-border/70 bg-background/45 px-4 py-5 text-sm text-muted-foreground">
                      No tienes solicitudes nuevas.
                    </div>
                  ) : (
                    incomingRequests.map((request) => (
                      <div key={request.id} className="rounded-3xl border border-border/70 bg-background/70 p-4">
                        <p className="font-medium text-foreground">{request.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          ELO {request.elo} · {formatRelativeDate(request.createdAt)}
                        </p>
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => void resolveRequest(request.id, "accept")}
                            className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
                          >
                            Aceptar
                          </button>
                          <button
                            onClick={() => void resolveRequest(request.id, "decline")}
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

              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Enviadas
                </p>
                <div className="space-y-3">
                  {outgoingRequests.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-border/70 bg-background/45 px-4 py-5 text-sm text-muted-foreground">
                      No hay solicitudes salientes pendientes.
                    </div>
                  ) : (
                    outgoingRequests.map((request) => (
                      <div key={request.id} className="rounded-3xl border border-border/70 bg-background/70 p-4">
                        <p className="font-medium text-foreground">{request.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          ELO {request.elo} · enviada {formatRelativeDate(request.createdAt)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="surface-panel overflow-hidden">
          <div className="grid min-h-[760px] gap-0 lg:grid-cols-[0.42fr_0.58fr]">
            <div className="border-b border-border/60 lg:border-b-0 lg:border-r">
              <div className="border-b border-border/60 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background">
                    <Users size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Amigos</p>
                    <p className="text-sm text-muted-foreground">
                      Selecciona una conversación y reta desde aquí.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-4">
                {loadingPanel ? (
                  <div className="flex items-center gap-2 rounded-3xl border border-border/70 bg-background/70 px-4 py-4 text-sm text-muted-foreground">
                    <Loader2 size={16} className="animate-spin" />
                    Cargando red social...
                  </div>
                ) : friends.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-border/70 bg-background/45 px-4 py-8 text-center text-sm text-muted-foreground">
                    Todavía no tienes amigos añadidos en Chess Club.
                  </div>
                ) : (
                  friends.map((friend) => (
                    <motion.button
                      key={friend.id}
                      onClick={() => setSelectedFriendshipId(friend.id)}
                      whileHover={{ y: -2 }}
                      className={`w-full rounded-3xl border p-4 text-left transition-colors ${
                        selectedFriendshipId === friend.id
                          ? "border-primary/40 bg-primary/10"
                          : "border-border/70 bg-background/70 hover:bg-background/90"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">{friend.friendName}</p>
                          <p className="mt-1 text-sm text-muted-foreground">ELO {friend.friendElo}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{formatRelativeDate(friend.lastMessageAt)}</span>
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                        {friend.lastMessagePreview ?? "Sin mensajes todavía. Puedes abrir la conversación y empezar."}
                      </p>
                    </motion.button>
                  ))
                )}
              </div>
            </div>

            <div className="flex min-h-[560px] flex-col">
              <div className="border-b border-border/60 px-6 py-5">
                {selectedFriend ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{selectedFriend.friendName}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          ELO {selectedFriend.friendElo} · amistad activa
                        </p>
                      </div>
                      <div className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs text-muted-foreground">
                        Preparado para más `modeKey`
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        onClick={() =>
                          void invitarJugador(selectedFriend.friendId, {
                            friendshipId: selectedFriend.id,
                            modeKey: "chess_rapid_10m",
                          })
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-4 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
                      >
                        <Clock3 size={16} />
                        Reto 10 min
                      </button>
                      <button
                        onClick={() =>
                          void invitarJugador(selectedFriend.friendId, {
                            friendshipId: selectedFriend.id,
                            modeKey: "chess_correspondence_3d",
                          })
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border/80 bg-background/80 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary/60"
                      >
                        <Sparkles size={16} />
                        Correspondencia 3 días
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-foreground">Mensajería privada</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Selecciona un amigo para abrir la conversación y enviar retos.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-5">
                {!selectedFriend ? (
                  <div className="rounded-3xl border border-dashed border-border/70 bg-background/45 px-4 py-8 text-center text-sm text-muted-foreground">
                    Elige un amigo a la izquierda para abrir el chat privado.
                  </div>
                ) : loadingMessages ? (
                  <div className="flex items-center gap-2 rounded-3xl border border-border/70 bg-background/70 px-4 py-4 text-sm text-muted-foreground">
                    <Loader2 size={16} className="animate-spin" />
                    Cargando conversación...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-border/70 bg-background/45 px-4 py-8 text-center text-sm text-muted-foreground">
                    Todavía no habéis hablado. Puedes mandar el primer mensaje o lanzar un reto directo.
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex flex-col ${
                        message.senderId === usuario.id ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-[82%] rounded-3xl px-4 py-3 text-sm ${
                          message.senderId === usuario.id
                            ? "rounded-br-md bg-foreground text-background"
                            : "rounded-bl-md bg-background/80 text-foreground"
                        }`}
                      >
                        {message.content}
                      </div>
                      <span className="mt-1 px-1 text-[11px] text-muted-foreground">
                        {formatRelativeDate(message.createdAt)}
                      </span>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-border/60 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageDraft}
                    onChange={(event) => setMessageDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void sendDirectMessage();
                      }
                    }}
                    disabled={!selectedFriend}
                    placeholder={selectedFriend ? "Escribe a tu amigo..." : "Selecciona una conversación"}
                    className="flex-1 rounded-2xl border border-border/70 bg-background/75 px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary/60 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <button
                    onClick={() => void sendDirectMessage()}
                    disabled={!selectedFriend || !messageDraft.trim() || sendingMessage}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-4 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sendingMessage ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    Enviar
                  </button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Swords size={16} />
                      Listo para retar
                    </div>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      Desde aquí ya puedes lanzar desafíos de ajedrez y la estructura está preparada para más modos.
                    </p>
                  </div>
                  <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Mail size={16} />
                      Canal privado
                    </div>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      Los mensajes quedan persistidos para que puedas seguir la conversación entre sesiones.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
