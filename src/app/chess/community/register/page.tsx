import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-4">
      <div className="surface-panel w-full max-w-2xl p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Registro retirado
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
          Ya no hace falta registrarse aparte para el comunitario
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          El bando de blancas o negras se asigna automáticamente a tu cuenta global de ajedrez.
        </p>
        <Link
          href="/chess/community"
          className="mt-8 inline-flex rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background"
        >
          Ir al ajedrez comunal
        </Link>
      </div>
    </div>
  );
}
