"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Mail, ShieldCheck } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { type AuthAudience, buildAuthCallbackUrl, buildLoginPath, buildResetPasswordPath } from "@/lib/auth";

const inputClass =
  "w-full rounded-[1.2rem] border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:border-white/20";

export function ForgotPasswordCard({
  audience,
  nextPath,
}: {
  audience: AuthAudience;
  nextPath: string;
}) {
  const [supabase] = useState(() => createClient());
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const redirectTo = buildAuthCallbackUrl(buildResetPasswordPath(audience, nextPath));

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    setLoading(false);

    if (resetError) {
      setError("No se pudo enviar el correo de recuperación. Revisa el email e inténtalo otra vez.");
      return;
    }

    setSuccess("Te hemos enviado un enlace seguro para definir una nueva contraseña.");
  }

  return (
    <div className="w-full max-w-xl overflow-hidden rounded-[2.1rem] border border-white/10 bg-[#0b111b]/92 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.4)] backdrop-blur sm:p-8">
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] border border-white/10 bg-white/[0.04]">
          <ShieldCheck size={24} className="text-sky-100" />
        </div>
        <div className="space-y-2">
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-slate-300">
            Recuperación
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">Restablecer acceso</h2>
          <p className="text-sm leading-6 text-slate-300">
            Introduce tu correo y te enviaremos un enlace seguro para elegir una nueva contraseña.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Correo electrónico</label>
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@email.com"
              required
              className={inputClass}
            />
          </div>
        </div>

        <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
          El enlace te llevará a una pantalla protegida donde podrás definir tu nueva contraseña sin perder el contexto
          de la cuenta.
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-[1.2rem] bg-white px-5 py-3.5 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : null}
          <span>{loading ? "Enviando..." : "Enviar enlace"}</span>
          {!loading ? <ArrowRight size={16} /> : null}
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
        <Link href={buildLoginPath(audience, nextPath)} className="font-medium text-white transition-colors hover:text-slate-300">
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
}
