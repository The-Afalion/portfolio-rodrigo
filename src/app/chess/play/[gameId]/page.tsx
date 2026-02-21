"use client";

import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

const Chat = ({ gameId, supabase, user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("gameId", gameId)
        .order("createdAt", { ascending: true });
      setMessages(data || []);
    };

    fetchMessages();

    const channel = supabase
      .channel(`chat:${gameId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `gameId=eq.${gameId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, supabase]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    await supabase.from("messages").insert({
      gameId,
      content: newMessage,
      senderId: user.id,
    });

    setNewMessage("");
  };

  return (
    <div className="w-full max-w-md mt-4">
      <div className="border rounded-lg p-4 h-64 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat ${msg.senderId === user.id ? "chat-end" : "chat-start"}`}>
            <div className="chat-bubble">{msg.content}</div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="flex mt-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="input input-bordered flex-grow"
          placeholder="Type a message..."
        />
        <button type="submit" className="btn btn-primary ml-2">
          Send
        </button>
      </form>
    </div>
  );
};

export default function GamePage({ params }: { params: { gameId: string } }) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState("start");
  const [user, setUser] = useState(null);
  const [playerColor, setPlayerColor] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  useEffect(() => {
    if (!user) return;

    const fetchGame = async () => {
      const { data, error } = await supabase
        .from("ChessGame")
        .select("*")
        .eq("id", params.gameId)
        .single();

      if (error || !data) {
        router.push("/chess");
        return;
      }

      const newGame = new Chess(data.fen || undefined);
      setGame(newGame);
      setFen(newGame.fen());

      if (user.id === data.whitePlayerId) {
        setPlayerColor("w");
      } else if (user.id === data.blackPlayerId) {
        setPlayerColor("b");
      }
    };

    fetchGame();

    const channel = supabase
      .channel(`game:${params.gameId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "ChessGame",
          filter: `id=eq.${params.gameId}`,
        },
        (payload) => {
          const newFen = payload.new.fen;
          const newGame = new Chess(newFen);
          setGame(newGame);
          setFen(newFen);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [params.gameId, supabase, router, user]);

  async function onDrop(sourceSquare, targetSquare) {
    if (game.turn() !== playerColor) return false;

    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (move === null) return false;

    const newFen = game.fen();
    setFen(newFen);

    await supabase
      .from("ChessGame")
      .update({ fen: newFen, moves: game.pgn() })
      .eq("id", params.gameId);

    return true;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <h1 className="text-4xl font-bold mb-4">Game {params.gameId}</h1>
      <Chessboard
        position={fen}
        onPieceDrop={onDrop}
        boardOrientation={playerColor === "b" ? "black" : "white"}
      />
      {user && <Chat gameId={params.gameId} supabase={supabase} user={user} />}
    </div>
  );
}
