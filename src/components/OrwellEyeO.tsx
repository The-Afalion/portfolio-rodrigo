"use client";

import { useContextoGlobalOpcional } from "@/context/ContextoGlobal";

type OrwellEyeOProps = {
  className?: string;
};

export default function OrwellEyeO({ className = "" }: OrwellEyeOProps) {
  const contextoGlobal = useContextoGlobalOpcional();
  const logoCambiado1984 = contextoGlobal?.logoCambiado1984 ?? false;

  return (
    <span className={`orwell-eye-o ${logoCambiado1984 ? "is-active" : ""} ${className}`} aria-label="o">
      <span className="orwell-eye-letter">o</span>
      <span className="orwell-eye-shape" aria-hidden="true">
        <span className="orwell-eye-pupil" />
      </span>
    </span>
  );
}
