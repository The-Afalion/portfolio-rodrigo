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
    alert(`Petición enviada a: ${friendSearch}`);
    setFriendSearch("");
  };

  const games = [
    { title: "Damas", path: "/games/checkers", desc: "Clásico táctico de salto.", color: "text-rose-500", bg: "bg-rose-50" },
    { title: "Batalla Naval", path: "/games/battleship", desc: "Destruye la armada.", color: "text-blue-500", bg: "bg-blue-50" },
    { title: "Artillería", path: "/games/artillery", desc: "Tiro parabólico 1v1.", color: "text-emerald-500", bg: "bg-emerald-50" },
    { title: "Ajedrez Clásico", path: "/chess", desc: "Estrategia profunda.", color: "text-slate-600", bg: "bg-slate-100" },
  ];

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 pb-6 px-6 pt-6">
      
      {/* LEFT PANEL: PROFILE & FRIENDS */}
      <div className="lg:col-span-3 flex flex-col gap-6 min-h-0">
        
        {/* PROFILE CARD */}
        <div className="bg-white rounded-2xl p-5 shrink-0 flex items-center gap-4 border border-gray-100 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
            <Terminal size={20} className="text-indigo-500" />
          </div>
          <div className="min-w-0">
             <p className="font-bold text-slate-800 truncate">{currentUser.name}</p>
             <div className="flex items-center gap-1.5 mt-0.5">
               <div className="w-2 h-2 rounded-full bg-emerald-400" />
               <p className="text-xs text-slate-500 font-medium tracking-wide">Lobby Global</p>
             </div>
          </div>
        </div>

        {/* FRIENDS LIST */}
        <div className="bg-white flex-1 flex flex-col min-h-0 rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="text-[11px] tracking-widest text-slate-400 font-bold mb-4 flex items-center gap-2 uppercase shrink-0">
            <UserPlus size={14} className="text-slate-300" /> Red Operativa
          </h2>
          
          <form onSubmit={handleSendFriendRequest} className="mb-5 shrink-0 flex gap-2">
             <input 
               type="text" 
               placeholder="Añadir ID..." 
               value={friendSearch}
               onChange={e => setFriendSearch(e.target.value)}
               className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:bg-white transition-all" 
             />
             <button type="submit" className="bg-slate-100 hover:bg-indigo-500 hover:text-white text-slate-600 px-3 rounded-xl transition-colors font-medium">
               +
             </button>
          </form>

          <div className="flex-1 overflow-y-auto pr-1 space-y-2">
             {initialFriendships.length === 0 ? (
               <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                 <p>Sin contactos locales.</p>
               </div>
             ) : (
               initialFriendships.map((f: any) => {
                 const isRequester = f.requesterId === currentUser.id;
                 const otherUser = isRequester ? f.addressee : f.requester;
                 return (
                   <div key={f.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-transparent hover:border-slate-200 cursor-pointer transition-all group">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                         <UserPlus size={12} className="text-slate-400" />
                       </div>
                       <div className="flex flex-col">
                         <span className="text-sm font-semibold text-slate-700">{otherUser.id.substring(0, 8)}</span>
                         <span className="text-[10px] text-slate-400 uppercase font-medium">{f.status}</span>
                       </div>
                     </div>
                   </div>
                 )
               })
             )}
          </div>
        </div>
      </div>

      {/* CENTER PANEL: CHAT */}
      <div className="lg:col-span-6 bg-white p-6 flex flex-col min-h-0 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
         <div className="shrink-0 flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
           <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
             <MessageSquare size={16} className="text-indigo-500" /> Canal Global
           </h2>
         </div>

         <div className="flex-1 overflow-y-auto pr-2 space-y-4 flex flex-col relative z-10 w-full mb-4">
           {messages.map((m: any) => {
             const isMe = m.senderId === currentUser.id;
             return (
               <div key={m.id} className={`flex flex-col w-full ${isMe ? "items-end" : "items-start"}`}>
                 <span className={`text-[10px] mb-1 font-semibold tracking-wide ${isMe ? "text-indigo-400" : "text-slate-400"}`}>
                   {isMe ? "TÚ" : m.senderName}
                 </span>
                 <div className={`px-4 py-2.5 text-sm leading-relaxed max-w-[85%] break-words
                   ${isMe 
                     ? "bg-indigo-500 text-white rounded-2xl rounded-tr-sm shadow-sm" 
                     : "bg-slate-100 text-slate-700 rounded-2xl rounded-tl-sm border border-slate-200/60"
                   }`}>
                   {m.content}
                 </div>
               </div>
             );
           })}
           <div ref={chatEndRef} className="h-1 shrink-0" />
         </div>

         <form onSubmit={sendChatMessage} className="shrink-0 relative z-10">
           <div className="relative flex items-center">
             <input
               type="text"
               value={chatInput}
               onChange={e => setChatInput(e.target.value)}
               placeholder="Escribir mensaje..."
               className="w-full bg-slate-50 border border-slate-200 rounded-full pl-6 pr-14 py-3.5 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-sm"
             />
             <button disabled={!chatInput.trim()} type="submit" className="absolute right-2 bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white p-2 rounded-full transition-colors disabled:opacity-40 disabled:hover:bg-indigo-50 disabled:hover:text-indigo-500 shadow-sm">
                <Send size={16} className={chatInput.trim() ? "translate-x-[1px] translate-y-[-1px]" : ""} />
             </button>
           </div>
         </form>
      </div>

      {/* RIGHT PANEL: GAMES HUB SELECTOR */}
      <div className="lg:col-span-3 bg-white p-5 flex flex-col min-h-0 rounded-2xl border border-gray-100 shadow-sm">
         <h2 className="text-[11px] tracking-widest text-slate-400 font-bold mb-4 flex items-center gap-2 uppercase shrink-0">
           <Swords size={14} className="text-slate-300" /> Games Hub
         </h2>
         
         <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
            {games.map((g) => (
              <div 
                key={g.title} 
                onClick={() => router.push(g.path)} 
                className="group cursor-pointer p-4 rounded-xl bg-slate-50 hover:bg-white border border-transparent hover:border-indigo-100 hover:shadow-md transition-all flex items-center gap-4"
              >
                 <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${g.bg} ${g.color}`}>
                   <Activity size={20} />
                 </div>
                 <div className="flex-1 min-w-0">
                   <h3 className="font-bold text-sm text-slate-800 truncate">{g.title}</h3>
                   <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-tight">{g.desc}</p>
                 </div>
              </div>
            ))}
         </div>
      </div>

    </div>
  );
}
