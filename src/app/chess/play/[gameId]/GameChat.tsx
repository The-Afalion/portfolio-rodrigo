"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

export default function GameChat({
  gameId,
  supabase,
  userId,
}: {
  gameId: string;
  supabase: SupabaseClient;
  userId: string;
}) {
  const [messages, setMessages] = useState<Array<{ id: string; senderId: string; content: string }>>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await fetch(`/api/chess/games/${gameId}/messages`, {
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const payload = await response.json().catch(() => null);
      setMessages((payload?.messages as Array<{ id: string; senderId: string; content: string }> | undefined) ?? []);
    };

    void fetchMessages();

    const fallbackInterval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void fetchMessages();
      }
    }, 12000);

    const channel = supabase
      .channel(`chat:${gameId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Message", filter: `gameId=eq.${gameId}` },
        (payload: { new: { id: string; senderId: string; content: string } }) => {
          setMessages((prev) => {
            if (prev.some((message) => message.id === payload.new.id)) {
              return prev;
            }

            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      window.clearInterval(fallbackInterval);
      void supabase.removeChannel(channel);
    };
  }, [gameId, supabase]);

  const handleSendMessage = async (event: FormEvent) => {
    event.preventDefault();

    if (newMessage.trim() === "") {
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch(`/api/chess/games/${gameId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ content: newMessage }),
      });

      const payload = await response.json().catch(() => null);

      if (response.ok && payload?.message) {
        setMessages((prev) => {
          if (prev.some((message) => message.id === payload.message.id)) {
            return prev;
          }

          return [...prev, payload.message];
        });
        setNewMessage("");
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mt-4 w-full max-w-md">
      <div className="h-64 overflow-y-auto rounded-lg border p-4">
        {messages.map((message) => (
          <div key={message.id} className={`chat ${message.senderId === userId ? "chat-end" : "chat-start"}`}>
            <div className="chat-bubble">{message.content}</div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="mt-2 flex">
        <input
          type="text"
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
          className="input input-bordered flex-grow"
          placeholder="Escribe un mensaje..."
        />
        <button type="submit" disabled={isSending || !newMessage.trim()} className="btn btn-primary ml-2">
          {isSending ? "..." : "Enviar"}
        </button>
      </form>
    </div>
  );
}
