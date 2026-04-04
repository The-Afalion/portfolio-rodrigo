"use client";

import { useState, useEffect, useRef } from 'react';
import { useRealtime } from '@/context/ContextoRealtime';
import { useChess } from '@/context/ContextoChess';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Users, X, Send, Gamepad2 } from 'lucide-react';

export default function ChatRealtime() {
  const { usuariosOnline, mensajes, enviarMensaje, invitarJugador } = useRealtime();
  const { usuario } = useChess();
  const [isOpen, setIsOpen] = useState(false);
  const [mensajeInput, setMensajeInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final del chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const handleEnviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (mensajeInput.trim()) {
      enviarMensaje(mensajeInput);
      setMensajeInput('');
    }
  };

  if (!usuario) return null; // Solo mostrar si hay usuario logueado

  return (
    <>
      {/* Botón Flotante */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-500 transition-colors flex items-center gap-2"
      >
        <MessageSquare size={24} />
        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full absolute -top-2 -right-2 border-2 border-zinc-900">
          {usuariosOnline.length}
        </span>
      </motion.button>

      {/* Panel de Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-80 md:w-96 h-[500px] bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-zinc-800 border-b border-zinc-700 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-indigo-400" />
                <span className="font-bold text-sm">Lobby Global ({usuariosOnline.length})</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Lista de Usuarios (Horizontal) */}
            <div className="p-2 bg-zinc-950 border-b border-zinc-800 flex gap-2 overflow-x-auto scrollbar-hide">
              {usuariosOnline.map((u) => (
                <div key={u.userId} className="flex-shrink-0 flex flex-col items-center group relative cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-green-500 flex items-center justify-center text-xs font-bold uppercase">
                    {u.username.substring(0, 2)}
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-1 truncate w-12 text-center">{u.username}</span>
                  
                  {/* Menú de Invitación (Hover) */}
                  <div className="absolute top-10 left-0 w-32 bg-zinc-800 border border-zinc-700 rounded p-2 hidden group-hover:flex flex-col gap-1 z-10 shadow-xl">
                    <button 
                      onClick={() => invitarJugador(u.userId, 'chess')}
                      className="text-xs text-left px-2 py-1 hover:bg-zinc-700 rounded flex items-center gap-2"
                    >
                      <Gamepad2 size={12} /> Retar a Ajedrez
                    </button>
                  </div>
                </div>
              ))}
              {usuariosOnline.length === 0 && (
                <span className="text-xs text-zinc-500 p-2 italic">Nadie más conectado...</span>
              )}
            </div>

            {/* Mensajes */}
            <div className="flex-grow p-4 overflow-y-auto bg-zinc-900/50 space-y-3">
              {mensajes.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.senderId === usuario.id ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-zinc-500 mb-0.5 px-1">{msg.senderName}</span>
                  <div 
                    className={`px-3 py-2 rounded-lg text-sm max-w-[80%] ${
                      msg.senderId === usuario.id 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-zinc-800 text-zinc-200 rounded-tl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleEnviar} className="p-3 bg-zinc-800 border-t border-zinc-700 flex gap-2">
              <input
                type="text"
                value={mensajeInput}
                onChange={(e) => setMensajeInput(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-grow bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button 
                type="submit" 
                disabled={!mensajeInput.trim()}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
