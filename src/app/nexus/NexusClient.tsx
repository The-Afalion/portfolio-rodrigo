"use client";

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Wifi, WifiOff, AlertTriangle, Send, Swords } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let supabase: any;
if (supabaseUrl && supabaseAnonKey) supabase = createClient(supabaseUrl, supabaseAnonKey);

type Presence = { user: string; online_at: string; };
type Message = { id: string; user: string; text: string; created_at: string; };
type Challenge = { from: string; to: string; gameId: string; };

function UserList({ users, currentUserEmail, onChallenge }: { users: Presence[], currentUserEmail: string, onChallenge: (user: string) => void }) {
  const otherUsers = users.filter(u => u.user !== currentUserEmail);
  if (otherUsers.length === 0) return <p className="text-muted-foreground italic">Eres el único aquí.</p>;
  return (
    <div className="space-y-3">
      {otherUsers.map(({ user }) => (
        <div key={user} className="flex items-center justify-between bg-secondary/50 p-3 rounded-lg">
          <div className="flex items-center gap-3"><User size={16} /><span className="font-mono">{user}</span></div>
          <button onClick={() => onChallenge(user)} className="text-blue-400 hover:text-white transition-colors text-xs font-bold flex items-center gap-1"><Swords size={14} /> Desafiar</button>
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
            <div className={`p-3 rounded-lg max-w-xs ${msg.user === currentUserEmail ? 'bg-blue-600 text-white' : 'bg-neutral-700'}`}><p className="text-sm">{msg.text}</p></div>
            <p className="text-xs text-neutral-500 mt-1 font-mono">{msg.user === currentUserEmail ? 'Tú' : msg.user.split('@')[0]}</p>
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
      .on('presence', { event: 'sync' }, () => setOnlineUsers(Object.values(channel.presenceState<Presence>()).map(p => p[0])))
      .on('broadcast', { event: 'chat' }, (payload: { payload: Message }) => setMessages(current => [...current, payload.payload]))
      .on('broadcast', { event: 'challenge', filter: { to: playerEmail } }, ({ payload }: { payload: Challenge }) => {
        toast((t) => (
          <div className="flex flex-col gap-2">
            <p>Has recibido un desafío de <strong>{payload.from}</strong></p>
            <div className="flex gap-2">
              <button onClick={() => {
                channel.send({ type: 'broadcast', event: 'challenge_accepted', payload });
                router.push(`/nexus/game/${payload.gameId}`);
                toast.dismiss(t.id);
              }} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded-lg text-sm">Aceptar</button>
              <button onClick={() => toast.dismiss(t.id)} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded-lg text-sm">Rechazar</button>
            </div>
          </div>
        ), { duration: 15000 });
      })
      .on('broadcast', { event: 'challenge_accepted', filter: { from: playerEmail } }, ({ payload }: { payload: Challenge }) => {
        router.push(`/nexus/game/${payload.gameId}`);
      })
      .subscribe(async (status) => {
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
    toast.success(`Has desafiado a ${userToChallenge}. Esperando respuesta...`);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !channelRef.current) return;
    const message: Message = { id: `msg_${Date.now()}`, user: playerEmail, text: newMessage.trim(), created_at: new Date().toISOString() };
    await channelRef.current.send({ type: 'broadcast', event: 'chat', payload: message });
    setNewMessage('');
  };

  if (!supabase) return <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4"><AlertTriangle className="w-16 h-16 text-red-500 mb-4" /><h1 className="text-2xl font-bold mb-2">Configuración Incompleta</h1><p className="text-neutral-400 text-center max-w-md">Las variables de entorno de Supabase no están configuradas.</p></div>;

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <header className="p-4 border-b border-neutral-800 flex justify-between items-center sticky top-0 bg-black/50 backdrop-blur-sm z-10">
        <Link href="/" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors font-mono text-sm"><ArrowLeft size={16} /> Salir del Nexus</Link>
        <div className={`flex items-center gap-2 text-xs font-mono ${isConnected ? 'text-green-400' : 'text-red-400'}`}>{isConnected ? <Wifi size={14} /> : <WifiOff size={14} />} {isConnected ? 'CONECTADO' : 'DESCONECTADO'}</div>
      </header>
      <div className="flex-grow p-6 md:p-12 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-neutral-900/50 border border-neutral-800 p-6 rounded-xl h-fit">
          <h2 className="text-xl font-bold mb-6">Usuarios en Línea ({onlineUsers.length})</h2>
          <UserList users={onlineUsers} currentUserEmail={playerEmail} onChallenge={handleChallenge} />
        </div>
        <div className="lg:col-span-2 bg-neutral-900/50 border border-neutral-800 p-6 rounded-xl flex flex-col">
          <h2 className="text-xl font-bold mb-6">Chat Global</h2>
          <div className="flex-grow"><ChatBox messages={messages} currentUserEmail={playerEmail} /></div>
          <form onSubmit={handleSendMessage} className="mt-6 flex gap-2">
            <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Escribe un mensaje..." className="flex-grow bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition" />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"><Send size={16} /></button>
          </form>
        </div>
      </div>
    </main>
  );
}
