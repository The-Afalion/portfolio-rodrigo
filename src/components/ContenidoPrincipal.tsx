import React from "react";
import AppShell from "@/components/shell/AppShell";

export default function ContenidoPrincipal({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
