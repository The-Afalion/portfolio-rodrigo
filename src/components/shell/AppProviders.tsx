"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { usePathname } from "next/navigation";
import { ProveedorContextoGlobal } from "@/context/ContextoGlobal";
import { ProveedorContextoChess } from "@/context/ContextoChess";
import { ProveedorContextoRealtime } from "@/context/ContextoRealtime";

function shouldUseInteractiveAuthProviders(pathname: string) {
  return pathname === "/chess" || pathname.startsWith("/chess/");
}

function ProvidersWithOptionalRealtime({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const shouldUseChessProviders = shouldUseInteractiveAuthProviders(pathname);

  if (!shouldUseChessProviders) {
    return <>{children}</>;
  }

  return (
    <ProveedorContextoChess>
      <ProveedorContextoRealtime>{children}</ProveedorContextoRealtime>
    </ProveedorContextoChess>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ProveedorContextoGlobal>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
        themes={["light", "dark", "forest", "sepia"]}
      >
        <ProvidersWithOptionalRealtime>{children}</ProvidersWithOptionalRealtime>
      </ThemeProvider>
    </ProveedorContextoGlobal>
  );
}
