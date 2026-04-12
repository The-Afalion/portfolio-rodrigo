"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Wifi, WifiOff, AlertTriangle, Send, Swords } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';

let supabase: ReturnType<typeof createClient> | null = null;

try {
  supabase = createClient();
} catch {
  supabase = null;
}

type Presence = { user: string; online_at: string; };
type Message = { id: string; user: string; text: string; created_at: string; };
type Challenge = { from: string; to: string; gameId: string; };

function UserList({ users, currentUserEmail, onChallenge }: { users: Presence[], currentUserEmail: string, onChallenge: (user: string) => void }) {
  const otherUsers = users.filter(u => u.user !== currentUserEmail);
  if (otherUsers.length === 0) return <p className="text-[#8a765f] italic">Eres el único aquí.</p>;
  return (
    <div className="space-y-3">
      {otherUsers.map(({ user }) => (
        <div key={user} className="flex items-center justify-between bg-[#f4ead5] border border-[#d6c4a5] p-3 rounded-sm shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 text-[#3e3024]"><User size={16} className="text-[#8c4030]" /><span className="font-mono text-sm">{user}</span></div>
          <button onClick={() => onChallenge(user)} className="text-[#8c4030] hover:text-[#5c4033] transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-1"><Swords size={14} /> Desafiar</button>
        </div>
      ))}
    </div>
  );
}

function ChatBox({ messages, currentUserEmail }: { messages: Message[], currentUserEmail: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [messages]);
  return (
    <div ref={scrollRef} className="h-64 overflow-y-auto space-y-4 pr-2">
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <motion.div key={msg.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`flex flex-col ${msg.user === currentUserEmail ? 'items-end' : 'items-start'}`}>
            <div className={`p-3 rounded-sm max-w-xs shadow-[2px_4px_6px_rgba(100,70,40,0.1)] border ${msg.user === currentUserEmail ? 'bg-[#8c4030] border-[#a64020] text-[#fdfbf7]' : 'bg-[#e8dcc4] border-[#d6c4a5] text-[#3e3024]'}`}><p className="text-sm font-serif">{msg.text}</p></div>
            <p className="text-[10px] uppercase tracking-widest text-[#8a765f] mt-1 font-mono">{msg.user === currentUserEmail ? 'Tú' : msg.user.split('@')[0]}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function NexusClient({ playerEmail }: { playerEmail: string }) {
  const [onlineUsers, setOnlineUsers] = useState<Presence[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<any>();
  const router = useRouter();

  useEffect(() => {
    if (!supabase) return;
    const channel = supabase.channel('nexus-hub', { config: { presence: { key: playerEmail } } });
    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => setOnlineUsers(Object.values(channel.presenceState()).map((p: any) => p[0])))
      .on('broadcast', { event: 'chat' }, (payload: { payload: Message }) => setMessages(current => [...current, payload.payload]))
      .on('broadcast', { event: 'challenge', filter: { to: playerEmail } }, ({ payload }: { payload: Challenge }) => {
        toast((t) => (
          <div className="flex flex-col gap-2">
            <p className="text-[#3e3024] font-serif tracking-tight">Telegrama de <strong>{payload.from}</strong></p>
            <div className="flex gap-2 font-mono uppercase tracking-widest">
              <button onClick={() => {
                channel.send({ type: 'broadcast', event: 'challenge_accepted', payload });
                router.push(`/nexus/game/${payload.gameId}`);
                toast.dismiss(t.id);
              }} className="w-full bg-[#6a8c54] text-[#fdfbf7] font-bold py-1.5 px-2 rounded-sm text-[10px] shadow-sm">Firmar Duelo</button>
              <button onClick={() => toast.dismiss(t.id)} className="w-full bg-[#8c4030] text-[#fdfbf7] font-bold py-1.5 px-2 rounded-sm text-[10px] shadow-sm">Rechazar</button>
            </div>
          </div>
        ), { duration: 15000 });
      })
      .on('broadcast', { event: 'challenge_accepted', filter: { from: playerEmail } }, ({ payload }: { payload: Challenge }) => {
        router.push(`/nexus/game/${payload.gameId}`);
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          await channel.track({ user: playerEmail, online_at: new Date().toISOString() });
        } else setIsConnected(false);
      });

    return () => { if (supabase) supabase.removeChannel(channel); };
  }, [playerEmail, router]);

  const handleChallenge = (userToChallenge: string) => {
    const gameId = `game_${playerEmail.split('@')[0]}_vs_${userToChallenge.split('@')[0]}_${Date.now()}`;
    const challenge: Challenge = { from: playerEmail, to: userToChallenge, gameId };
    channelRef.current.send({ type: 'broadcast', event: 'challenge', payload: challenge });
    toast.success(`Telegrama enviado a ${userToChallenge}. Esperando firma...`);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !channelRef.current) return;
    const message: Message = { id: `msg_${Date.now()}`, user: playerEmail, text: newMessage.trim(), created_at: new Date().toISOString() };
    await channelRef.current.send({ type: 'broadcast', event: 'chat', payload: message });
    setNewMessage('');
  };

  if (!supabase) return <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4ead5] text-[#3e3024] p-4 font-serif"><AlertTriangle className="w-16 h-16 text-[#8c4030] mb-4" /><h1 className="text-3xl font-bold mb-2">Instalaciones Incompletas</h1><p className="text-[#8a765f] italic text-center max-w-md">No se ha podido conectar con las líneas de telégrafo principales (Supabase).</p></div>;

  return (
    <main className="min-h-screen bg-[#f4ead5] text-[#3e3024] flex flex-col font-serif selection:bg-[#cc6640]/30 selection:text-[#3e3024]">
      <header className="px-6 py-4 border-b-2 border-dashed border-[#d6c4a5] flex justify-between items-center sticky top-0 bg-[#f4ead5]/90 backdrop-blur-sm z-10">
        <Link href="/" className="flex items-center gap-2 text-[#8c673d] hover:text-[#3e2b22] font-bold font-mono text-[10px] uppercase tracking-[0.2em] transition-colors"><ArrowLeft size={16} /> Salir del Establecimiento</Link>
        <div className={`flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-mono font-bold ${isConnected ? 'text-[#6a8c54]' : 'text-[#8c4030]'}`}>{isConnected ? <Wifi size={14} /> : <WifiOff size={14} />} {isConnected ? 'LÍNEA ACTIVA' : 'LÍNEA CORTADA'}</div>
      </header>
      <div className="flex-grow p-6 md:p-12 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10 pointer-events-none mix-blend-multiply" />
        
        <div className="lg:col-span-1 bg-[#fcfaf4] border border-[#d6c4a5] shadow-[5px_8px_15px_rgba(100,70,40,0.15)] p-6 rounded-sm h-fit relative z-10 transform -rotate-[0.5deg]">
          <div className="absolute top-2 left-4 w-3 h-3 rounded-full bg-[#1a120e] shadow-inner" />
          <p className="text-[10px] font-mono tracking-[0.2em] text-[#8a765f] font-bold uppercase mb-1 mt-2">Visitas Activas</p>
          <h2 className="text-2xl font-bold mb-6 text-[#3e3024]">Jugadores Presentes</h2>
          <UserList users={onlineUsers} currentUserEmail={playerEmail} onChallenge={handleChallenge} />
        </div>
        
        <div className="lg:col-span-2 bg-[#fcfaf4] border border-[#d6c4a5] shadow-[5px_8px_15px_rgba(100,70,40,0.15)] p-6 rounded-sm flex flex-col relative z-10 transform rotate-[0.5deg]">
          <div className="absolute top-2 right-4 w-3 h-3 rounded-full bg-[#1a120e] shadow-inner" />
          <p className="text-[10px] font-mono tracking-[0.2em] text-[#8a765f] font-bold uppercase mb-1 mt-2">Corro Público</p>
          <h2 className="text-2xl font-bold mb-6 text-[#3e3024]">Mesa Redonda</h2>
          <div className="flex-grow bg-[#fdfbf7] border border-[#e3d5b8] p-4 shadow-inner mb-4"><ChatBox messages={messages} currentUserEmail={playerEmail} /></div>
          <form onSubmit={handleSendMessage} className="mt-2 flex gap-3 pb-2">
            <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Redacte su mensaje aquí..." className="flex-grow bg-[#f4ead5] border border-[#d6c4a5] font-serif text-[#3e3024] placeholder:text-[#b5a38a] rounded-sm px-4 py-2 focus:ring-2 focus:ring-[#8c4030] focus:border-[#8c4030] outline-none shadow-inner transition" />
            <button type="submit" className="bg-[#8c4030] hover:bg-[#a64020] text-[#fdfbf7] font-bold font-mono text-xs tracking-widest px-6 py-2 rounded-sm shadow-[2px_4px_0_#5c4033] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 uppercase"><Send size={16} /> Enviar</button>
          </form>
        </div>
      </div>
    </main>
  );
}
