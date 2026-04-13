import { ReactNode } from "react";
import { AppProviders } from "@/components/shell/AppProviders";

export function Proveedores({ children }: { children: ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}
