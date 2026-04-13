"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Lock, ShieldCheck } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { type AuthAudience, buildForgotPasswordPath, buildLoginPath } from "@/lib/auth";

const inputClass =
  "w-full rounded-[1.2rem] border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:border-white/20";

export function ResetPasswordCard({
  audience,
  nextPath,
}: {
  audience: AuthAudience;
  nextPath: string;
}) {
  const [supabase] = useState(() => createClient());
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function checkRecoverySession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (!session) {
        setError("El enlace de recuperación no es válido o ha caducado. Solicita uno nuevo.");
      }

      setCheckingSession(false);
    }

    void checkRecoverySession();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (updateError) {
      setError("No se pudo actualizar la contraseña. Solicita un nuevo enlace.");
      return;
    }

    setSuccess("Contraseña actualizada. En unos segundos te llevaremos de vuelta al inicio de sesión.");

    window.setTimeout(() => {
      router.replace(buildLoginPath(audience, nextPath));
      router.refresh();
    }, 1200);
  }

  return (
    <div className="w-full max-w-xl overflow-hidden rounded-[2.1rem] border border-white/10 bg-[#0b111b]/92 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.4)] backdrop-blur sm:p-8">
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] border border-white/10 bg-white/[0.04]">
          <ShieldCheck size={24} className="text-emerald-100" />
        </div>
        <div className="space-y-2">
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-slate-300">
            Nueva contraseña
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">Actualiza tu acceso</h2>
          <p className="text-sm leading-6 text-slate-300">
            Define una nueva contraseña para seguir usando tu misma cuenta en todas las áreas del sistema.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Nueva contraseña</label>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mínimo 8 caracteres"
              required
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Repite la contraseña</label>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repite la contraseña"
              required
              className={inputClass}
            />
          </div>
        </div>

        <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
          La nueva credencial se aplicará a tu cuenta actual. No necesitas crear un usuario nuevo ni repetir el proceso
          de registro.
        </div>

        <button
          type="submit"
          disabled={loading || checkingSession}
          className="flex w-full items-center justify-center gap-2 rounded-[1.2rem] bg-white px-5 py-3.5 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading || checkingSession ? <Loader2 size={18} className="animate-spin" /> : null}
          <span>{checkingSession ? "Validando enlace..." : loading ? "Guardando..." : "Guardar nueva contraseña"}</span>
          {!loading && !checkingSession ? <ArrowRight size={16} /> : null}
        </button>
      </form>

      {error ? (
        <div className="mt-5 rounded-[1.2rem] border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-5 rounded-[1.2rem] border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {success}
        </div>
      ) : null}

      <div className="mt-8 border-t border-white/10 pt-6 text-sm text-slate-400">
        <div className="flex flex-col gap-2">
          <Link href={buildForgotPasswordPath(audience, nextPath)} className="font-medium text-white transition-colors hover:text-slate-300">
            Solicitar otro enlace
          </Link>
          <Link href={buildLoginPath(audience, nextPath)} className="transition-colors hover:text-white">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
