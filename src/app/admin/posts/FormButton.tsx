"use client";

import { useFormStatus } from 'react-dom';

export default function FormButton({
  idleLabel,
  pendingLabel,
}: {
  idleLabel: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-2xl bg-foreground px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-85 self-start disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
