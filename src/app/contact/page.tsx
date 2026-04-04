"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Mail, MessageSquareText, Send, UserRound } from "lucide-react";
import { saveMessage } from "./actions";
import { PageHero, PageShell, SectionPanel, SectionInset } from "@/components/shell/PagePrimitives";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      <Send size={16} />
      {pending ? "Enviando..." : "Enviar mensaje"}
    </button>
  );
}

export default function ContactPage() {
  const initialState: { message: string | null; errors: Record<string, string[]> } = { message: null, errors: {} };
  const [state, dispatch] = useFormState(saveMessage, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message) {
      if (state.message.startsWith("Error")) {
        toast.error(state.message);
      } else {
        toast.success(state.message);
        formRef.current?.reset();
      }
    }
  }, [state]);

  return (
    <PageShell>
      <PageHero
        eyebrow="Contacto"
        title="Una entrada clara, sobria y útil para abrir conversación."
        description="Si tienes una idea, una colaboración o un proyecto con ambición técnica, este espacio está pensado para que escribir sea rápido y agradable."
        aside={
          <SectionPanel className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Respuesta</p>
            <p className="text-sm leading-7 text-muted-foreground">
              Prefiero mensajes concretos con contexto, objetivo y plazo. Así la conversación arranca mejor desde el primer correo.
            </p>
          </SectionPanel>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <SectionPanel>
          <form ref={formRef} action={dispatch} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="name" className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Nombre
                </label>
                <div className="flex items-center gap-3 rounded-[1.25rem] border border-border/80 bg-background/70 px-4 py-3">
                  <UserRound size={16} className="text-muted-foreground" />
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    placeholder="Tu nombre"
                  />
                </div>
                {state.errors?.name ? <p className="text-sm text-red-500">{state.errors.name.join(", ")}</p> : null}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Email
                </label>
                <div className="flex items-center gap-3 rounded-[1.25rem] border border-border/80 bg-background/70 px-4 py-3">
                  <Mail size={16} className="text-muted-foreground" />
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    placeholder="nombre@empresa.com"
                  />
                </div>
                {state.errors?.email ? <p className="text-sm text-red-500">{state.errors.email.join(", ")}</p> : null}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Mensaje
              </label>
              <div className="rounded-[1.5rem] border border-border/80 bg-background/70 px-4 py-4">
                <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageSquareText size={16} />
                  <span>Cuéntame qué necesitas y qué contexto ya existe.</span>
                </div>
                <textarea
                  name="message"
                  id="message"
                  rows={8}
                  required
                  className="w-full resize-none bg-transparent text-sm leading-7 text-foreground outline-none placeholder:text-muted-foreground"
                  placeholder="Objetivo, alcance, timing y cualquier referencia útil."
                />
              </div>
              {state.errors?.message ? <p className="text-sm text-red-500">{state.errors.message.join(", ")}</p> : null}
            </div>

            <SubmitButton />
          </form>
        </SectionPanel>

        <div className="space-y-4">
          <SectionInset>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Ideal para</p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">Arquitectura frontend, producto interactivo, IA aplicada y experiencias técnicas bien resueltas.</p>
          </SectionInset>
          <SectionInset>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Estilo</p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">Misma dirección visual del resto del sitio: menos artificio, más legibilidad y jerarquía.</p>
          </SectionInset>
        </div>
      </div>
    </PageShell>
  );
}
