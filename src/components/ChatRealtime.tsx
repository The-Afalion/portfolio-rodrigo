"use client";

import { useState, useEffect, useRef } from "react";
import { useRealtime } from "@/context/ContextoRealtime";
import { useChess } from "@/context/ContextoChess";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Users, X, Send, Gamepad2, Radio } from "lucide-react";

function getConnectionLabel(status: "connecting" | "connected" | "disconnected") {
  if (status === "connected") {
    return "Conectado";
  }

  if (status === "connecting") {
    return "Reconectando";
  }

  return "Sincronizando";
}

export default function ChatRealtime() {
  const {
    usuariosOnline,
    mensajes,
    enviarMensaje,
    invitarJugador,
    invitacionesEntrantes,
    invitacionesSalientes,
    estadoRealtime,
  } = useRealtime();
  const { usuario } = useChess();
  const [isOpen, setIsOpen] = useState(false);
  const [mensajeInput, setMensajeInput] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mensajeInput.trim()) {
      return;
    }

    setSending(true);

    try {
      await enviarMensaje(mensajeInput);
      setMensajeInput("");
    } finally {
      setSending(false);
    }
  };

  if (!usuario) {
    return null;
  }

  const notificationCount = invitacionesEntrantes.length + usuariosOnline.length;

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen((current) => !current)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-indigo-600 p-4 text-white shadow-lg transition-colors hover:bg-indigo-500"
      >
        <MessageSquare size={24} />
        <span className="absolute -right-2 -top-2 rounded-full border-2 border-zinc-900 bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
          {notificationCount}
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            className="fixed bottom-24 right-6 z-50 flex h-[560px] w-[min(94vw,420px)] flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-4">
              <div className="flex items-center gap-3">
                <Users size={18} className="text-indigo-400" />
                <div>
                  <p className="text-sm font-bold text-white">Lobby Global</p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-400">
                    <Radio size={11} className={estadoRealtime === "connected" ? "text-emerald-400" : "text-amber-300"} />
                    <span>{getConnectionLabel(estadoRealtime)}</span>
                    <span>·</span>
                    <span>{usuariosOnline.length} online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-zinc-400 transition-colors hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="border-b border-zinc-800 bg-zinc-950/95 px-3 py-3">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {usuariosOnline.map((player) => {
                  const alreadyInvited = invitacionesSalientes.some(
                    (invitation) => invitation.inviteeId === player.userId
                  );

                  return (
                    <div
                      key={player.userId}
                      className="min-w-[148px] rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-xs font-bold uppercase text-white">
                          {player.username.slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{player.username}</p>
                          <p className="text-[11px] text-zinc-400">ELO {player.elo}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => void invitarJugador(player.userId)}
                        disabled={alreadyInvited}
                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
                      >
                        <Gamepad2 size={12} />
                        {alreadyInvited ? "Reto pendiente" : "Retar"}
                      </button>
                    </div>
                  );
                })}

                {usuariosOnline.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 px-4 py-3 text-xs italic text-zinc-500">
                    Nadie más conectado todavía.
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-zinc-950/70 p-4">
              {mensajes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 px-4 py-6 text-center text-sm text-zinc-500">
                  El chat global aún está en silencio. Rompe el hielo.
                </div>
              ) : (
                mensajes.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.senderId === usuario.id ? "items-end" : "items-start"}`}
                  >
                    <span className="mb-0.5 px-1 text-[10px] text-zinc-500">{msg.senderName}</span>
                    <div
                      className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm ${
                        msg.senderId === usuario.id
                          ? "rounded-tr-md bg-indigo-600 text-white"
                          : "rounded-tl-md bg-zinc-800 text-zinc-200"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleEnviar} className="flex gap-2 border-t border-zinc-800 bg-zinc-900 p-3">
              <input
                type="text"
                value={mensajeInput}
                onChange={(e) => setMensajeInput(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-grow rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white transition-colors focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!mensajeInput.trim() || sending}
                className="rounded-xl bg-indigo-600 p-2 text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
