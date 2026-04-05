"use client";

import { useEffect, useState, useRef } from "react";
import { Send, UserPlus, Swords, Activity, MessageSquare, Terminal } from "lucide-react";
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

  // Polling simple
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
    { title: "Damas", path: "/games/checkers", desc: "Clásico táctico de salto.", color: "text-neon-pink", bg: "bg-neon-pink" },
    { title: "Batalla Naval", path: "/games/battleship", desc: "Destruye la armada.", color: "text-neon-cyan", bg: "bg-neon-cyan" },
    { title: "Artillería", path: "/games/artillery", desc: "Tiro parabólico 1v1.", color: "text-neon-purple", bg: "bg-neon-purple" },
    { title: "Ajedrez Clásico", path: "/chess", desc: "Estrategia profunda.", color: "text-neutral-400", bg: "bg-white" },
  ];

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 min-h-0 pb-4 animate-fade-in">
      
      {/* PANEL IZQUIERDO: COMUNIDAD */}
      <div className="lg:col-span-3 flex flex-col gap-4 min-h-0">
        
        {/* MI PERFIL TÁCTICO */}
        <div className="surface-panel p-4 rounded-[2rem] shrink-0 flex items-center gap-4 relative overflow-hidden backdrop-blur-md bg-black/40 border border-white/5 shadow-2xl">
          <div className="absolute -inset-1 bg-gradient-to-br from-neon-pink/10 to-transparent blur-xl pointer-events-none" />
          <div className="w-14 h-14 rounded-full bg-neon-pink/20 border-2 border-neon-pink flex items-center justify-center shrink-0">
            <Terminal size={24} className="text-neon-pink" />
          </div>
          <div className="min-w-0">
             <p className="font-bold text-white uppercase truncate relative z-10">{currentUser.name}</p>
             <div className="flex items-center gap-2 mt-1">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
               <p className="text-xs text-white/50 relative z-10">Conectado (Lobby Global)</p>
             </div>
          </div>
        </div>

        {/* LISTA CONTACTOS */}
        <div className="surface-panel flex-1 flex flex-col min-h-0 rounded-[2rem] p-5 backdrop-blur-md bg-black/40 border border-white/5">
          <h2 className="text-xs tracking-[0.2em] text-white/40 font-bold mb-4 flex items-center gap-2 uppercase shrink-0">
            <UserPlus className="text-white/60" size={14} /> Red Operativa
          </h2>
          
          <form onSubmit={handleSendFriendRequest} className="mb-4 shrink-0 flex gap-2">
             <input 
               type="text" 
               placeholder="Añadir ID..." 
               value={friendSearch}
               onChange={e => setFriendSearch(e.target.value)}
               className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-neon-pink/50 outline-none w-full" 
             />
             <button type="submit" className="bg-white/5 hover:bg-neon-pink text-white/70 hover:text-black px-3 rounded-xl transition-colors shrink-0">
               +
             </button>
          </form>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2 relative">
             {initialFriendships.length === 0 ? (
               <div className="absolute inset-0 flex items-center justify-center text-white/20 text-xs text-center px-4">
                 <p>Sin contactos rastreados localmente.</p>
               </div>
             ) : (
               initialFriendships.map((f: any) => {
                 const isRequester = f.requesterId === currentUser.id;
                 const otherUser = isRequester ? f.addressee : f.requester;
                 return (
                   <div key={f.id} className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-white/5 to-transparent border border-white/5 hover:border-white/20 cursor-pointer transition-colors group">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center border border-white/10 group-hover:border-neon-pink/50 transition-colors">
                         <UserPlus size={12} className="text-white/40 group-hover:text-neon-pink" />
                       </div>
                       <div className="flex flex-col">
                         <span className="text-sm font-medium text-white/80">{otherUser.id.substring(0, 8)}</span>
                         <span className="text-[9px] text-white/40 uppercase">{f.status}</span>
                       </div>
                     </div>
                     <Activity size={14} className="text-neon-cyan/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                 )
               })
             )}
          </div>
        </div>
      </div>

      {/* PANEL CENTRAL: CHAT TERMINAL */}
      <div className="lg:col-span-6 surface-panel p-5 sm:p-6 flex flex-col min-h-0 rounded-[2.5rem] border border-neon-cyan/20 backdrop-blur-xl bg-[#010103]/80 shadow-[0_0_40px_rgba(0,255,255,0.03)] relative overflow-hidden">
         <div className="absolute top-0 right-10 w-64 h-64 bg-neon-cyan/5 rounded-full blur-[100px] pointer-events-none" />
         
         <div className="shrink-0 flex items-center justify-between mb-6 pb-4 border-b border-white/5">
           <h2 className="text-sm tracking-widest text-neon-cyan font-bold flex items-center gap-2 uppercase">
             <MessageSquare size={16} /> Frecuencia Abierta
           </h2>
           <div className="flex gap-1.5">
             <div className="w-2 h-2 rounded-full bg-red-500/50" />
             <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
             <div className="w-2 h-2 rounded-full bg-neon-cyan/80 animate-pulse" />
           </div>
         </div>

         <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-4 flex flex-col relative z-10 w-full">
           {messages.length === 0 && (
             <div className="m-auto text-white/20 text-sm">Interceptando transmisiones...</div>
           )}
           {messages.map((m: any) => {
             const isMe = m.senderId === currentUser.id;
             return (
               <div key={m.id} className={`flex flex-col w-full ${isMe ? "items-end" : "items-start"}`}>
                 <span className={`text-[10px] mb-1 font-mono tracking-wider ${isMe ? "text-neon-cyan/70" : "text-white/40"}`}>
                   {isMe ? "TÚ" : m.senderName}
                 </span>
                 <div className={`px-5 py-3 text-sm leading-relaxed backdrop-blur-sm max-w-[85%] break-words
                   ${isMe 
                     ? "bg-neon-cyan/10 text-white rounded-[1.5rem] rounded-tr-md border border-neon-cyan/30 shadow-[0_4px_20px_rgba(0,255,255,0.1)]" 
                     : "bg-white/5 text-white/80 rounded-[1.5rem] rounded-tl-md border border-white/10"
                   }`}>
                   {m.content}
                 </div>
               </div>
             );
           })}
           <div ref={chatEndRef} className="h-1 shrink-0" />
         </div>

         <form onSubmit={sendChatMessage} className="shrink-0 mt-4 relative z-10">
           <div className="relative flex items-center">
             <input
               type="text"
               value={chatInput}
               onChange={e => setChatInput(e.target.value)}
               placeholder="Inyectar mensaje..."
               className="w-full bg-black/80 border border-white/10 rounded-full pl-6 pr-14 py-4 text-sm text-white focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition-all font-mono"
             />
             <button disabled={!chatInput.trim()} type="submit" className="absolute right-2 bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan hover:text-black p-2.5 rounded-full transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-neon-cyan">
                <Send size={16} className={chatInput.trim() ? "translate-x-[1px] translate-y-[-1px]" : ""} />
             </button>
           </div>
         </form>
      </div>

      {/* PANEL DERECHO: ARCADAS */}
      <div className="lg:col-span-3 surface-panel p-5 flex flex-col min-h-0 rounded-[2rem] bg-black/40 border border-white/5 backdrop-blur-md">
         <h2 className="text-xs tracking-[0.2em] text-white/40 font-bold mb-4 flex items-center gap-2 uppercase shrink-0">
           <Swords size={14} /> Seleccionar Módulo
         </h2>
         
         <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1 relative z-10 pb-2">
            {games.map((g, i) => (
              <div 
                key={g.title} 
                onClick={() => router.push(g.path)} 
                style={{ animationDelay: `${i * 100}ms` }}
                className="group cursor-pointer p-4 rounded-2xl bg-gradient-to-br from-white/5 to-black border border-white/5 hover:border-white/20 transition-all hover:scale-[1.02] flex items-center gap-4 animate-fade-in-up"
              >
                 <div className={`w-12 h-12 shrink-0 rounded-xl bg-black border border-white/10 flex items-center justify-center group-hover:border-transparent group-hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all ${g.color}`}>
                   <Activity size={20} className="group-hover:scale-110 transition-transform"/>
                 </div>
                 <div className="flex-1 min-w-0">
                   <h3 className="font-bold text-sm text-white truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/50">{g.title}</h3>
                   <p className="text-[10px] text-white/40 mt-0.5 line-clamp-2 leading-tight">{g.desc}</p>
                 </div>
              </div>
            ))}
         </div>

         <div className="shrink-0 mt-4 p-4 rounded-2xl border border-white/5 bg-white/5 text-center">
            <p className="text-[10px] text-white/50 font-mono">STATUS: CONECTADO AL MAINFRAME</p>
            <div className="w-full h-1 bg-black rounded-full mt-2 overflow-hidden">
               <div className="h-full bg-neon-cyan w-full rounded-full animate-pulse opacity-50" />
            </div>
         </div>
      </div>

    </div>
  );
}
