import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageShell, SectionPanel } from "@/components/shell/PagePrimitives";

export default function NotFound() {
  return (
    <PageShell className="flex items-center">
      <div className="mx-auto w-full max-w-3xl">
        <SectionPanel className="space-y-6 px-8 py-10 text-center md:px-12 md:py-14">
          <p className="page-eyebrow justify-center">404</p>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Página no encontrada</h1>
            <p className="mx-auto max-w-xl text-base leading-8 text-muted-foreground">
              La ruta que buscas no está disponible o ya no forma parte del portfolio público.
            </p>
          </div>
          <div className="flex justify-center">
            <Link href="/" className="action-pill">
              <ArrowLeft size={16} />
              Volver al portfolio
            </Link>
          </div>
        </SectionPanel>
      </div>
    </PageShell>
  );
}
