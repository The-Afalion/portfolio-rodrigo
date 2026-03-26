"use client";

import { useState } from 'react';
import { inviteAdmin } from './actions';

export default function InviteAdminForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    const result = await inviteAdmin(email);

    if (result.error) {
      setStatus('error');
      setMessage(result.error);
    } else {
      setStatus('success');
      setMessage(`Se ha enviado una invitación a ${email}`);
      setEmail('');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
      <h2 className="text-xl font-serif font-bold text-slate-800 mb-2">Invitar Nuevo Administrador</h2>
      <p className="text-sm text-slate-500 mb-6">Como superadministrador, puedes invitar a otros miembros al equipo del blog enviándoles un enlace a su correo.</p>

      <form onSubmit={handleInvite} className="flex gap-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nuevo.admin@ejemplo.com"
          className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {status === 'loading' ? 'Enviando...' : 'Invitar Editor'}
        </button>
      </form>

      {status === 'error' && (
        <p className="mt-4 text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{message}</p>
      )}
      {status === 'success' && (
        <p className="mt-4 text-sm font-medium text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100">{message}</p>
      )}
    </div>
  );
}
