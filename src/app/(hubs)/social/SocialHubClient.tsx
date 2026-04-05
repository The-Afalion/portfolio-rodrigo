"use client";

import { useEffect, useState, useRef } from "react";
import { Send, UserPlus, FileText, Briefcase, Mail, PenTool, Coffee } from "lucide-react";
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
    alert(`Carta enviada por telégrafo a: ${friendSearch}`);
    setFriendSearch("");
  };

  const games = [
    { title: "Damas", path: "/games/checkers", desc: "Clásico táctico de salto en madera.", color: "text-[#8c5230]", bg: "bg-[#e8dcc4] border-[#d4bd9a]" },
    { title: "Batalla Naval", path: "/games/battleship", desc: "Papel, cuadrícula y pluma.", color: "text-[#3c5a6b]", bg: "bg-[#cce3eb] border-[#9fbcce]" },
    { title: "Artillería", path: "/games/artillery", desc: "Cálculos en papiro.", color: "text-[#5e6642]", bg: "bg-[#d8e0c3] border-[#b0b893]" },
    { title: "Ajedrez Clásico", path: "/chess", desc: "Tallado a mano en marfil y nogal.", color: "text-[#4a3f35]", bg: "bg-[#e3d7c5] border-[#c4ae91]" },
  ];

  return (
    <div className="flex-1 min-h-0 bg-[#f4ead5] p-4 lg:p-8 relative overflow-hidden" style={{ backgroundImage: "radial-gradient(#d6c29e 1px, transparent 0)", backgroundSize: "30px 30px" }}>
      {/* Sombra suave interna del corcho */}
      <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(100,70,40,0.1)] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 h-full relative z-10">
        
        {/* PANEL IZQUIERDO: Tarjetas perforadas (Amigos y Perfil) */}
        <div className="lg:col-span-3 flex flex-col gap-8 min-h-0">
          
          {/* PROFILE CARD (Tarjeta de Identificación Old-School) */}
          <div className="bg-[#fcfaf4] rounded-sm p-5 shrink-0 flex items-center gap-4 border border-[#e3d5b8] shadow-[2px_4px_10px_rgba(120,90,60,0.1)] relative transform -rotate-1">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#cc6640] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)] border border-[#a64020] z-20"/> {/* Pincho rojo */}
            <div className="w-14 h-14 rounded-full bg-[#f0e6d2] border border-[#d6c4a5] flex items-center justify-center shrink-0 shadow-inner">
              <Briefcase size={22} className="text-[#6e5842]" />
            </div>
            <div className="min-w-0 mt-3">
               <p className="font-serif font-bold text-[#453628] truncate text-lg">{currentUser.name}</p>
               <div className="flex items-center gap-1.5 mt-0.5">
                 <div className="w-2 h-2 rounded-full bg-[#6a8c54]" />
                 <p className="text-[11px] font-mono text-[#8a765f] uppercase tracking-widest">En la Oficina</p>
               </div>
            </div>
          </div>

          {/* FRIENDS LIST (Libreta de Direcciones) */}
          <div className="bg-[#fcfaf4] flex-1 flex flex-col min-h-0 rounded-sm p-6 border border-[#e3d5b8] shadow-[2px_4px_10px_rgba(120,90,60,0.1)] relative transform rotate-1">
            <div className="absolute top-2 right-4 w-4 h-4 rounded-full bg-[#668c99] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)] border border-[#4d6c7a] z-20"/> {/* Pincho azul */}
            
            <h2 className="text-[13px] font-serif tracking-widest text-[#8a765f] font-bold mb-5 flex items-center gap-2 border-b border-[#e3d5b8] pb-2">
              <FileText size={16} className="text-[#b5a38a]" /> Directorio Postal
            </h2>
            
            <form onSubmit={handleSendFriendRequest} className="mb-5 shrink-0">
               <div className="flex gap-2 bg-[#f4ead5] p-1.5 rounded-sm border border-[#d6c4a5]">
                 <input 
                   type="text" 
                   placeholder="Escriba un ID..." 
                   value={friendSearch}
                   onChange={e => setFriendSearch(e.target.value)}
                   className="flex-1 bg-transparent px-2 py-1 text-sm font-mono text-[#453628] outline-none placeholder-[#a6967c]" 
                 />
                 <button type="submit" className="bg-[#6e5842] hover:bg-[#453628] text-[#f4ead5] px-4 rounded-sm transition-colors font-serif italic text-sm shadow-sm">
                   Añadir
                 </button>
               </div>
            </form>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
               {initialFriendships.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full text-[#a6967c] text-sm font-serif italic text-center p-4 border-2 border-dashed border-[#e3d5b8]">
                   <Mail size={32} className="mb-2 opacity-50"/>
                   <p>El directorio está vacío.<br/>Mande algún telegrama.</p>
                 </div>
               ) : (
                 initialFriendships.map((f: any) => {
                   const isRequester = f.requesterId === currentUser.id;
                   const otherUser = isRequester ? f.addressee : f.requester;
                   return (
                     <div key={f.id} className="flex items-center justify-between p-3 bg-[#fff] border border-[#e3d5b8] shadow-sm transform hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer group">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-[#f4ead5] flex items-center justify-center border border-[#d6c4a5]">
                           <UserPlus size={14} className="text-[#8a765f]" />
                         </div>
                         <div className="flex flex-col">
                           <span className="font-serif font-bold text-[#453628] group-hover:text-[#cc6640] transition-colors">{otherUser.id.substring(0, 8)}</span>
                           <span className="text-[10px] uppercase font-mono text-[#a6967c]">{f.status}</span>
                         </div>
                       </div>
                     </div>
                   )
                 })
               )}
            </div>
          </div>
        </div>

        {/* PANEL CENTRAL: CHAT (Papel de Máquina de Escribir) */}
        <div className="lg:col-span-6 bg-[#fdfbf7] p-8 flex flex-col min-h-0 rounded-sm border border-[#e8ddc5] shadow-[5px_8px_15px_rgba(100,70,40,0.15)] relative transform -rotate-[0.5deg]">
           {/* Marcas de grapas virtuales */}
           <div className="absolute top-4 left-6 w-8 h-1.5 bg-[#b3adb3] rounded-full shadow-[inset_0_-1px_2px_rgba(0,0,0,0.4)] opacity-80" />
           
           <div className="shrink-0 flex items-center justify-between mb-6 pb-2 border-b-2 border-dashed border-[#d6c4a5]">
             <h2 className="text-xl font-serif text-[#3e3024] font-bold flex items-center gap-3">
               <Coffee size={20} className="text-[#8a765f]" /> Sala de Tertulia
             </h2>
             <span className="font-mono text-[10px] text-[#b5a38a] uppercase tracking-widest bg-[#f4ead5] px-3 py-1 rounded-sm border border-[#d6c4a5]">Transmitiendo</span>
           </div>

           <div className="flex-1 overflow-y-auto pr-4 space-y-6 flex flex-col relative z-10 w-full mb-6 font-serif">
             {messages.map((m: any) => {
               const isMe = m.senderId === currentUser.id;
               return (
                 <div key={m.id} className={`flex flex-col w-full ${isMe ? "items-end" : "items-start"}`}>
                   <span className={`text-[11px] mb-1.5 font-bold uppercase tracking-widest ${isMe ? "text-[#cc6640]" : "text-[#8a765f]"}`}>
                     {isMe ? "Tú" : m.senderName}
                   </span>
                   <div className={`px-5 py-4 text-base leading-relaxed max-w-[85%] break-words shadow-sm relative
                     ${isMe 
                       ? "bg-[#f5ebd3] text-[#3e3024] border border-[#d6c4a5]" 
                       : "bg-white text-[#453628] border border-[#e8ddc5]"
                     }`}>
                     {/* Efecto de cinta adhesiva si no es mio */}
                     {!isMe && <div className="absolute -top-3 left-4 w-12 h-6 bg-[#ffffff40] backdrop-blur-sm border border-[#00000010] transform rotate-[-4deg]" />}
                     {m.content}
                   </div>
                 </div>
               );
             })}
             <div ref={chatEndRef} className="h-1 shrink-0" />
           </div>

           <form onSubmit={sendChatMessage} className="shrink-0 relative z-10 bg-[#f4ead5] p-3 rounded-sm border border-[#d6c4a5]">
             <div className="relative flex items-center gap-3">
               <PenTool size={20} className="text-[#8a765f] shrink-0 ml-2" />
               <input
                 type="text"
                 value={chatInput}
                 onChange={e => setChatInput(e.target.value)}
                 placeholder="Escriba su mensaje en tinta..."
                 className="w-full bg-transparent py-2 text-lg font-serif italic text-[#3e3024] outline-none placeholder-[#a6967c]"
               />
               <button disabled={!chatInput.trim()} type="submit" className="bg-[#cc6640] text-[#fdfbf7] hover:bg-[#a64020] px-5 py-2.5 rounded-sm transition-colors disabled:opacity-50 disabled:hover:bg-[#cc6640] font-bold font-serif uppercase tracking-widest text-xs shadow-sm">
                  Enviar
               </button>
             </div>
           </form>
        </div>

        {/* PANEL DERECHO: ARCADAS (Cajas de Juegos de Madera) */}
        <div className="lg:col-span-3 flex flex-col min-h-0 relative">
           
           <div className="bg-[#fcfaf4] flex-1 p-6 flex flex-col min-h-0 rounded-sm border border-[#e3d5b8] shadow-[2px_4px_10px_rgba(120,90,60,0.1)] transform rotate-[1.5deg]">
             <div className="absolute top-2 left-6 w-4 h-4 rounded-full bg-[#ccaa40] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)] border border-[#a68220] z-20"/> {/* Pincho amarillo */}
             
             <h2 className="text-[13px] font-serif tracking-widest text-[#8a765f] font-bold mb-5 flex items-center gap-2 border-b border-[#e3d5b8] pb-2 mt-4">
                Estante de Juegos
             </h2>
             
             <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
                {games.map((g) => (
                  <div 
                    key={g.title} 
                    onClick={() => router.push(g.path)} 
                    className={`group cursor-pointer p-4 border shadow-sm transition-all flex items-center gap-4 relative overflow-hidden bg-white hover:bg-[#fcfaf4] ${g.bg.split(' ')[1]}`}
                  >
                     {/* Textura de la caja (ribbon) */}
                     <div className={`absolute top-0 left-0 w-2 h-full ${g.bg.split(' ')[0]}`} />

                     <div className={`w-14 h-14 shrink-0 rounded-sm flex items-center justify-center ml-2 border border-white/50 shadow-inner ${g.bg.split(' ')[0]}`}>
                       <span className={`font-serif text-2xl font-bold ${g.color}`}>{g.title.charAt(0)}</span>
                     </div>
                     <div className="flex-1 min-w-0 pr-2">
                       <h3 className="font-serif font-bold text-[#453628] leading-tight group-hover:text-[#cc6640] transition-colors">{g.title}</h3>
                       <p className="text-[11px] font-mono text-[#a6967c] mt-1 line-clamp-2 leading-relaxed">{g.desc}</p>
                     </div>
                  </div>
                ))}
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
