"use client";

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { buildLoginPath } from '@/lib/auth';
import { createClient } from '@/utils/supabase/client';

export default function AdminSignOutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setLoading(true);

    const supabase = createClient();
    await supabase.auth.signOut();

    router.replace(buildLoginPath('editor', '/admin'));
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="flex w-full items-center gap-3 p-2 rounded hover:bg-muted transition-colors text-sm text-muted-foreground disabled:opacity-60"
    >
      <LogOut size={18} />
      <span>{loading ? 'Cerrando sesión...' : 'Cerrar sesión'}</span>
    </button>
  );
}
