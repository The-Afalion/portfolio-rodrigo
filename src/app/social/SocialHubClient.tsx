"use client";

import { useEffect, useState, useRef } from "react";
import { Send, UserPlus, Swords, Activity, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SocialHubClient({ currentUser, initialMessages, initialFriendships }: any) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages.reverse());
  const [chatInput, setChatInput] = useState("");
  const [friendSearch, setFriendSearch] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Polling simple para simular Realtime para propósitos de la UI (cada 3 segundos)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/chess/lobby-messages");
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages.reverse());
        }
      } catch (e) {}
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const sendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const optimisticMsg = { id: Date.now(), content: chatInput, senderName: currentUser.name, senderId: currentUser.id };
    setMessages((prev: any) => [...prev, optimisticMsg]);
    setChatInput("");
    
    await fetch("/api/chess/lobby-messages", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ content: optimisticMsg.content })
    });
  };

  const handleSendFriendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Petición enviada a: ${friendSearch} (Simulado en Beta)`);
    setFriendSearch("");
  };

  const games = [
    { title: "Ajedrez Clásico", path: "/chess", desc: "El juego rey de estrategia.", color: "text-white" },
    { title: "Damas de Neón", path: "/games/checkers", desc: "Juego de mesa clásico de saltos.", color: "text-neon-pink" },
    { title: "Hundir la Flota", path: "/games/battleship", desc: "Destruye la armada enemiga.", color: "text-neon-cyan" },
    { title: "Artillería", path: "/games/artillery", desc: "Calcula el tiro parabólico.", color: "text-neon-purple" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* CHAT GLOBAL */}
      <div className="surface-panel bento-card p-6 flex flex-col h-[500px] lg:col-span-2">
        <h2 className="text-xl tracking-tight text-white font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="text-neon-cyan" size={20} /> Canal Global
        </h2>
        <div className="flex-1 overflow-y-auto mb-4 pr-2 space-y-3 custom-scrollbar">
          {messages.map((m: any) => (
            <div key={m.id} className={`flex flex-col ${m.senderId === currentUser.id ? "items-end" : "items-start"}`}>
              <span className="text-[10px] text-white/40 mb-1">{m.senderName}</span>
              <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${m.senderId === currentUser.id ? "bg-neon-cyan/20 text-white border border-neon-cyan/30" : "bg-white/5 text-white/80 border border-white/10"}`}>
                {m.content}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={sendChatMessage} className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder="Introduce tu mensaje..."
            className="flex-1 bg-black/40 border border-white/10 rounded-full px-5 py-3 text-sm text-white focus:outline-none focus:border-neon-cyan/50 transition-colors"
          />
          <button type="submit" className="bg-white/10 p-3 rounded-full hover:bg-neon-cyan hover:text-black transition-all">
             <Send size={18} />
          </button>
        </form>
      </div>

      {/* AMIGOS & CONTACTOS */}
      <div className="surface-panel bento-card p-6 flex flex-col h-[500px]">
        <h2 className="text-xl tracking-tight text-white font-semibold mb-4 flex items-center gap-2">
          <UserPlus className="text-neon-pink" size={20} /> Red de Contactos
        </h2>
        <form onSubmit={handleSendFriendRequest} className="mb-4 flex gap-2">
           <input 
             type="text" 
             placeholder="Username..." 
             value={friendSearch}
             onChange={e => setFriendSearch(e.target.value)}
             className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-neon-pink/50 outline-none" 
           />
           <button type="submit" className="bg-neon-pink/20 text-neon-pink px-3 border border-neon-pink/30 hover:bg-neon-pink hover:text-black rounded-lg transition-colors text-sm">
             Añadir
           </button>
        </form>
        <div className="flex-1 overflow-y-auto space-y-2">
           {initialFriendships.length === 0 ? (
             <div className="text-center text-white/30 text-sm mt-10">No tienes vínculos guardados.</div>
           ) : (
             initialFriendships.map((f: any) => {
               const isRequester = f.requesterId === currentUser.id;
               const otherUser = isRequester ? f.addressee : f.requester;
               return (
                 <div key={f.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                     <span className="text-sm text-white/80">{otherUser.id.substring(0, 8)}</span>
                   </div>
                   <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-white/60">{f.status}</span>
                 </div>
               )
             })
           )}
        </div>
      </div>

      {/* GAMES LAUNCHER */}
      <div className="surface-panel bento-card p-6 flex flex-col lg:col-span-3">
        <h2 className="text-xl tracking-tight text-white font-semibold mb-6 flex items-center gap-2">
          <Activity className="text-neon-purple" size={20} /> Arcadas Multijugador (Hot-Seat Beta)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {games.map(g => (
            <div key={g.title} onClick={() => router.push(g.path)} className="group cursor-pointer p-5 rounded-[1.5rem] bg-black/20 border border-white/5 hover:border-white/20 transition-all hover:-translate-y-1">
               <div className={`mb-3 ${g.color}`}>
                 <Swords size={28} className="group-hover:scale-110 transition-transform"/>
               </div>
               <h3 className="font-semibold text-white mb-2">{g.title}</h3>
               <p className="text-xs text-white/50">{g.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
