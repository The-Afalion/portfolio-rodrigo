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

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("gameId", gameId)
        .order("createdAt", { ascending: true });
      setMessages((data as Array<{ id: string; senderId: string; content: string }>) ?? []);
    };

    void fetchMessages();

    const channel = supabase
      .channel(`chat:${gameId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `gameId=eq.${gameId}` },
        (payload: { new: { id: string; senderId: string; content: string } }) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [gameId, supabase]);

  const handleSendMessage = async (event: FormEvent) => {
    event.preventDefault();

    if (newMessage.trim() === "") {
      return;
    }

    await supabase.from("messages").insert({ gameId, content: newMessage, senderId: userId });
    setNewMessage("");
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
          placeholder="Type a message..."
        />
        <button type="submit" className="btn btn-primary ml-2">
          Send
        </button>
      </form>
    </div>
  );
}
