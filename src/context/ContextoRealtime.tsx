"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useChess } from './ContextoChess';
import { RealtimeChannel } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

// --- Tipos ---
export interface UsuarioOnline {
  userId: string;
  username: string;
  status: 'online' | 'jugando' | 'ausente';
  lastSeen: string;
}

export interface MensajeChat {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
  type: 'chat' | 'system';
}

export interface InvitacionJuego {
  id: string;
  fromId: string;
  fromName: string;
  gameType: 'chess' | 'tictactoe' | 'connect4' | 'custom'; // Extensible
  payload?: any; // Datos extra (ej: configuración de partida)
  timestamp: number;
}

interface ContextoRealtimeProps {
  usuariosOnline: UsuarioOnline[];
  mensajes: MensajeChat[];
  enviarMensaje: (content: string) => void;
  invitarJugador: (targetUserId: string, gameType: InvitacionJuego['gameType'], payload?: any) => void;
  aceptarInvitacion: (invitacion: InvitacionJuego) => void;
  rechazarInvitacion: (invitacionId: string) => void;
  invitacionesPendientes: InvitacionJuego[];
}

const ContextoRealtime = createContext<ContextoRealtimeProps | undefined>(undefined);

export function ProveedorContextoRealtime({ children }: { children: ReactNode }) {
  const { usuario } = useChess(); // Usamos el usuario del contexto de ajedrez
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [usuariosOnline, setUsuariosOnline] = useState<UsuarioOnline[]>([]);
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [invitacionesPendientes, setInvitacionesPendientes] = useState<InvitacionJuego[]>([]);

  useEffect(() => {
    if (!usuario) return;

    // 1. Crear canal global de "Lobby"
    const newChannel = supabase.channel('global_lobby', {
      config: {
        presence: {
          key: usuario.id,
        },
      },
    });

    // 2. Manejar Presencia (Usuarios Online)
    newChannel
      .on('presence', { event: 'sync' }, () => {
        const state = newChannel.presenceState();
        const users = Object.values(state).flat() as any[];
        
        // Mapear a nuestro formato limpio
        const formattedUsers: UsuarioOnline[] = users.map(u => ({
          userId: u.userId,
          username: u.username,
          status: u.status || 'online',
          lastSeen: new Date().toISOString(),
        }));
        
        // Filtrar duplicados y al propio usuario
        const uniqueUsers = formattedUsers.filter((u, index, self) =>
          index === self.findIndex((t) => t.userId === u.userId) && u.userId !== usuario.id
        );

        setUsuariosOnline(uniqueUsers);
      })
      // 3. Manejar Mensajes de Chat (Broadcast)
      .on('broadcast', { event: 'chat_message' }, ({ payload }) => {
        setMensajes((prev) => [...prev, payload]);
      })
      // 4. Manejar Invitaciones de Juego (Broadcast Dirigido)
      .on('broadcast', { event: 'game_invite' }, ({ payload }) => {
        // Solo procesar si es para mí
        if (payload.targetUserId === usuario.id) {
          const nuevaInvitacion: InvitacionJuego = payload.invitacion;
          setInvitacionesPendientes((prev) => [...prev, nuevaInvitacion]);
          
          // Notificación Toast
          toast((t) => (
            <div className="flex flex-col gap-2">
              <span className="font-bold">{nuevaInvitacion.fromName} te invita a jugar {nuevaInvitacion.gameType}</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => { aceptarInvitacion(nuevaInvitacion); toast.dismiss(t.id); }}
                  className="px-3 py-1 bg-green-600 text-white rounded text-xs"
                >
                  Aceptar
                </button>
                <button 
                  onClick={() => { rechazarInvitacion(nuevaInvitacion.id); toast.dismiss(t.id); }}
                  className="px-3 py-1 bg-red-600 text-white rounded text-xs"
                >
                  Rechazar
                </button>
              </div>
            </div>
          ), { duration: 10000, position: 'top-right' });
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Registrar mi presencia
          await newChannel.track({
            userId: usuario.id,
            username: usuario.username,
            status: 'online',
            online_at: new Date().toISOString(),
          });
        }
      });

    setChannel(newChannel);

    return () => {
      supabase.removeChannel(newChannel);
    };
  }, [usuario]);

  // --- Funciones Públicas ---

  const enviarMensaje = async (content: string) => {
    if (!channel || !usuario) return;

    const mensaje: MensajeChat = {
      id: crypto.randomUUID(),
      senderId: usuario.id,
      senderName: usuario.username,
      content,
      timestamp: Date.now(),
      type: 'chat',
    };

    // Enviar a otros
    await channel.send({
      type: 'broadcast',
      event: 'chat_message',
      payload: mensaje,
    });

    // Añadir a mi lista local
    setMensajes((prev) => [...prev, mensaje]);
  };

  const invitarJugador = async (targetUserId: string, gameType: InvitacionJuego['gameType'], payload?: any) => {
    if (!channel || !usuario) return;

    const invitacion: InvitacionJuego = {
      id: crypto.randomUUID(),
      fromId: usuario.id,
      fromName: usuario.username,
      gameType,
      payload,
      timestamp: Date.now(),
    };

    await channel.send({
      type: 'broadcast',
      event: 'game_invite',
      payload: { targetUserId, invitacion },
    });

    toast.success('Invitación enviada');
  };

  const aceptarInvitacion = (invitacion: InvitacionJuego) => {
    // Aquí redirigirías a la sala de juego o iniciarías la lógica
    console.log("Aceptando invitación:", invitacion);
    
    // Limpiar invitación
    setInvitacionesPendientes((prev) => prev.filter(i => i.id !== invitacion.id));

    // Ejemplo de redirección (puedes adaptarlo)
    if (invitacion.gameType === 'chess') {
      // router.push(`/chess/multiplayer/${invitacion.id}`);
      toast.success("Iniciando partida de Ajedrez...");
    } else {
      toast.success(`Iniciando ${invitacion.gameType}...`);
    }
  };

  const rechazarInvitacion = (invitacionId: string) => {
    setInvitacionesPendientes((prev) => prev.filter(i => i.id !== invitacionId));
  };

  return (
    <ContextoRealtime.Provider value={{
      usuariosOnline,
      mensajes,
      enviarMensaje,
      invitarJugador,
      aceptarInvitacion,
      rechazarInvitacion,
      invitacionesPendientes
    }}>
      {children}
    </ContextoRealtime.Provider>
  );
}

export function useRealtime() {
  const context = useContext(ContextoRealtime);
  if (!context) throw new Error("useRealtime debe usarse dentro de ProveedorContextoRealtime");
  return context;
}
