"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Clock3, Loader2, Mail, Search, Send, Sparkles, Swords, UserPlus, Users } from "lucide-react";
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

type ChessFriendsPanelProps = {
  compact?: boolean;
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

function cardClasses(compact: boolean) {
  return compact ? "border border-white/10 bg-white/[0.03]" : "border border-border/70 bg-background/70";
}

function mutedCardClasses(compact: boolean) {
  return compact
    ? "border border-white/10 bg-white/[0.02] text-slate-400"
    : "border border-dashed border-border/70 bg-background/45 text-muted-foreground";
}

export default function ChessFriendsPanel({ compact = false }: ChessFriendsPanelProps) {
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
    <section className={compact ? "h-full" : "mb-16"}>
      <div className={compact ? "mb-6 border-b border-white/10 pb-6" : "mb-8"}>
        <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${compact ? "text-slate-400" : "text-muted-foreground"}`}>
          Zona social
        </p>
        <h3 className={`mt-3 font-semibold tracking-tight ${compact ? "text-2xl text-white md:text-3xl" : "text-3xl md:text-4xl"}`}>
          Amigos, mensajes privados y retos por modo
        </h3>
        <p className={`mt-3 max-w-3xl text-sm leading-7 ${compact ? "text-slate-300" : "text-muted-foreground"}`}>
          Busca jugadores frecuentes, mantén conversaciones privadas y lanza partidas rápidas o por correspondencia sin
          salir del panel.
        </p>
      </div>

      <div className={`grid gap-6 ${compact ? "2xl:grid-cols-[0.92fr_1.08fr]" : "xl:grid-cols-[0.95fr_1.05fr]"}`}>
        <div className="space-y-6">
          <div className="surface-panel overflow-hidden">
            <div className={`px-6 py-5 ${compact ? "border-b border-white/10" : "border-b border-border/60"}`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${compact ? "border border-white/10 bg-white/[0.04]" : "border border-border/70 bg-background"}`}>
                  <UserPlus size={18} className={compact ? "text-amber-100" : "text-primary"} />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${compact ? "text-white" : "text-foreground"}`}>Añadir amigos</p>
                  <p className={`text-sm ${compact ? "text-slate-300" : "text-muted-foreground"}`}>
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
                  className={`flex-1 rounded-2xl px-4 py-3 text-sm outline-none transition-colors ${
                    compact
                      ? "border border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500 focus:border-amber-200/40"
                      : "border border-border/70 bg-background/75 text-foreground focus:border-primary/60"
                  }`}
                />
                <button
                  onClick={() => void runSearch()}
                  disabled={searching}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60 ${
                    compact ? "bg-amber-300 text-slate-950" : "bg-foreground text-background"
                  }`}
                >
                  {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                  Buscar
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {searchResults.length === 0 ? (
                  <div className={`rounded-3xl px-4 py-6 text-center text-sm ${mutedCardClasses(compact)}`}>
                    Haz una búsqueda para enviar solicitudes.
                  </div>
                ) : (
                  searchResults.map((result) => (
                    <div key={result.id} className={`rounded-3xl p-4 ${cardClasses(compact)}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className={`font-medium ${compact ? "text-white" : "text-foreground"}`}>{result.displayName}</p>
                          <p className={`mt-1 text-sm ${compact ? "text-slate-300" : "text-muted-foreground"}`}>
                            {result.email} · ELO {result.elo}
                          </p>
                        </div>
                        <button
                          onClick={() => void sendFriendRequest(result.id)}
                          disabled={result.friendshipStatus === "ACCEPTED" || result.friendshipStatus === "PENDING"}
                          className={`rounded-full px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${
                            compact ? "bg-amber-300 text-slate-950" : "bg-foreground text-background"
                          }`}
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
            <div className={`px-6 py-5 ${compact ? "border-b border-white/10" : "border-b border-border/60"}`}>
              <p className={`text-sm font-semibold ${compact ? "text-white" : "text-foreground"}`}>Solicitudes pendientes</p>
              <p className={`mt-1 text-sm ${compact ? "text-slate-300" : "text-muted-foreground"}`}>
                Responde a las peticiones entrantes o revisa las que ya has mandado.
              </p>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <p className={`mb-3 text-xs font-semibold uppercase tracking-[0.2em] ${compact ? "text-slate-400" : "text-muted-foreground"}`}>
                  Recibidas
                </p>
                <div className="space-y-3">
                  {incomingRequests.length === 0 ? (
                    <div className={`rounded-3xl px-4 py-5 text-sm ${mutedCardClasses(compact)}`}>
                      No tienes solicitudes nuevas.
                    </div>
                  ) : (
                    incomingRequests.map((request) => (
                      <div key={request.id} className={`rounded-3xl p-4 ${cardClasses(compact)}`}>
                        <p className={`font-medium ${compact ? "text-white" : "text-foreground"}`}>{request.name}</p>
                        <p className={`mt-1 text-sm ${compact ? "text-slate-300" : "text-muted-foreground"}`}>
                          ELO {request.elo} · {formatRelativeDate(request.createdAt)}
                        </p>
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => void resolveRequest(request.id, "accept")}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 ${
                              compact ? "bg-amber-300 text-slate-950" : "bg-foreground text-background"
                            }`}
                          >
                            Aceptar
                          </button>
                          <button
                            onClick={() => void resolveRequest(request.id, "decline")}
                            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                              compact
                                ? "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                                : "border-border/80 bg-background/80 text-foreground hover:bg-secondary/60"
                            }`}
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
                <p className={`mb-3 text-xs font-semibold uppercase tracking-[0.2em] ${compact ? "text-slate-400" : "text-muted-foreground"}`}>
                  Enviadas
                </p>
                <div className="space-y-3">
                  {outgoingRequests.length === 0 ? (
                    <div className={`rounded-3xl px-4 py-5 text-sm ${mutedCardClasses(compact)}`}>
                      No hay solicitudes salientes pendientes.
                    </div>
                  ) : (
                    outgoingRequests.map((request) => (
                      <div key={request.id} className={`rounded-3xl p-4 ${cardClasses(compact)}`}>
                        <p className={`font-medium ${compact ? "text-white" : "text-foreground"}`}>{request.name}</p>
                        <p className={`mt-1 text-sm ${compact ? "text-slate-300" : "text-muted-foreground"}`}>
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
          <div className={`grid gap-0 lg:grid-cols-[0.42fr_0.58fr] ${compact ? "min-h-[720px]" : "min-h-[760px]"}`}>
            <div className={compact ? "border-b border-white/10 lg:border-b-0 lg:border-r lg:border-white/10" : "border-b border-border/60 lg:border-b-0 lg:border-r"}>
              <div className={`px-6 py-5 ${compact ? "border-b border-white/10" : "border-b border-border/60"}`}>
                <div className="flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${compact ? "border border-white/10 bg-white/[0.04]" : "border border-border/70 bg-background"}`}>
                    <Users size={18} className={compact ? "text-amber-100" : "text-primary"} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${compact ? "text-white" : "text-foreground"}`}>Amigos</p>
                    <p className={`text-sm ${compact ? "text-slate-300" : "text-muted-foreground"}`}>
                      Selecciona una conversación y reta desde aquí.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-4">
                {loadingPanel ? (
                  <div className={`flex items-center gap-2 rounded-3xl px-4 py-4 text-sm ${cardClasses(compact)} ${compact ? "text-slate-400" : "text-muted-foreground"}`}>
                    <Loader2 size={16} className="animate-spin" />
                    Cargando red social...
                  </div>
                ) : friends.length === 0 ? (
                  <div className={`rounded-3xl px-4 py-8 text-center text-sm ${mutedCardClasses(compact)}`}>
                    Todavía no tienes amigos añadidos en Chess Club.
                  </div>
                ) : (
                  friends.map((friend) => (
                    <button
                      key={friend.id}
                      onClick={() => setSelectedFriendshipId(friend.id)}
                      className={`w-full rounded-3xl border p-4 text-left transition-colors ${
                        selectedFriendshipId === friend.id
                          ? compact
                            ? "border-amber-300/30 bg-amber-300/10"
                            : "border-primary/40 bg-primary/10"
                          : compact
                            ? "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                            : "border-border/70 bg-background/70 hover:bg-background/90"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className={`font-medium ${compact ? "text-white" : "text-foreground"}`}>{friend.friendName}</p>
                          <p className={`mt-1 text-sm ${compact ? "text-slate-300" : "text-muted-foreground"}`}>ELO {friend.friendElo}</p>
                        </div>
                        <span className={`text-xs ${compact ? "text-slate-500" : "text-muted-foreground"}`}>
                          {formatRelativeDate(friend.lastMessageAt)}
                        </span>
                      </div>
                      <p className={`mt-3 line-clamp-2 text-sm ${compact ? "text-slate-400" : "text-muted-foreground"}`}>
                        {friend.lastMessagePreview ?? "Sin mensajes todavía. Puedes abrir la conversación y empezar."}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="flex min-h-[560px] flex-col">
              <div className={`px-6 py-5 ${compact ? "border-b border-white/10" : "border-b border-border/60"}`}>
                {selectedFriend ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className={`text-sm font-semibold ${compact ? "text-white" : "text-foreground"}`}>{selectedFriend.friendName}</p>
                        <p className={`mt-1 text-sm ${compact ? "text-slate-300" : "text-muted-foreground"}`}>
                          ELO {selectedFriend.friendElo} · amistad activa
                        </p>
                      </div>
                      <div className={`rounded-full border px-3 py-1 text-xs ${compact ? "border-white/10 bg-white/[0.04] text-slate-300" : "border-border/70 bg-background/80 text-muted-foreground"}`}>
                        Modos listos
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
                        className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition-opacity hover:opacity-90 ${
                          compact ? "bg-amber-300 text-slate-950" : "bg-foreground text-background"
                        }`}
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
                        className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${
                          compact
                            ? "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                            : "border-border/80 bg-background/80 text-foreground hover:bg-secondary/60"
                        }`}
                      >
                        <Sparkles size={16} />
                        Correspondencia 3 días
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className={`text-sm font-semibold ${compact ? "text-white" : "text-foreground"}`}>Mensajería privada</p>
                    <p className={`mt-1 text-sm ${compact ? "text-slate-300" : "text-muted-foreground"}`}>
                      Selecciona un amigo para abrir la conversación y enviar retos.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-5">
                {!selectedFriend ? (
                  <div className={`rounded-3xl px-4 py-8 text-center text-sm ${mutedCardClasses(compact)}`}>
                    Elige un amigo a la izquierda para abrir el chat privado.
                  </div>
                ) : loadingMessages ? (
                  <div className={`flex items-center gap-2 rounded-3xl px-4 py-4 text-sm ${cardClasses(compact)} ${compact ? "text-slate-400" : "text-muted-foreground"}`}>
                    <Loader2 size={16} className="animate-spin" />
                    Cargando conversación...
                  </div>
                ) : messages.length === 0 ? (
                  <div className={`rounded-3xl px-4 py-8 text-center text-sm ${mutedCardClasses(compact)}`}>
                    Todavía no habéis hablado. Puedes mandar el primer mensaje o lanzar un reto directo.
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex flex-col ${message.senderId === usuario.id ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[82%] rounded-3xl px-4 py-3 text-sm ${
                          message.senderId === usuario.id
                            ? compact
                              ? "rounded-br-md bg-amber-300 text-slate-950"
                              : "rounded-br-md bg-foreground text-background"
                            : compact
                              ? "rounded-bl-md bg-white/[0.05] text-white"
                              : "rounded-bl-md bg-background/80 text-foreground"
                        }`}
                      >
                        {message.content}
                      </div>
                      <span className={`mt-1 px-1 text-[11px] ${compact ? "text-slate-500" : "text-muted-foreground"}`}>
                        {formatRelativeDate(message.createdAt)}
                      </span>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className={`p-4 ${compact ? "border-t border-white/10" : "border-t border-border/60"}`}>
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
                    className={`flex-1 rounded-2xl px-4 py-3 text-sm outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                      compact
                        ? "border border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500 focus:border-amber-200/40"
                        : "border border-border/70 bg-background/75 text-foreground focus:border-primary/60"
                    }`}
                  />
                  <button
                    onClick={() => void sendDirectMessage()}
                    disabled={!selectedFriend || !messageDraft.trim() || sendingMessage}
                    className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${
                      compact ? "bg-amber-300 text-slate-950" : "bg-foreground text-background"
                    }`}
                  >
                    {sendingMessage ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    Enviar
                  </button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className={`rounded-3xl p-4 ${cardClasses(compact)}`}>
                    <div className={`flex items-center gap-2 text-sm font-medium ${compact ? "text-white" : "text-foreground"}`}>
                      <Swords size={16} />
                      Listo para retar
                    </div>
                    <p className={`mt-2 text-sm leading-7 ${compact ? "text-slate-300" : "text-muted-foreground"}`}>
                      Invita en el momento adecuado sin salir del chat y mantén cada conversación vinculada al rival.
                    </p>
                  </div>
                  <div className={`rounded-3xl p-4 ${cardClasses(compact)}`}>
                    <div className={`flex items-center gap-2 text-sm font-medium ${compact ? "text-white" : "text-foreground"}`}>
                      <Mail size={16} />
                      Canal privado
                    </div>
                    <p className={`mt-2 text-sm leading-7 ${compact ? "text-slate-300" : "text-muted-foreground"}`}>
                      Los mensajes quedan persistidos para que puedas retomar la conversación entre sesiones.
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
