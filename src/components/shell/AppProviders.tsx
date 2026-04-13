"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { usePathname } from "next/navigation";
import { ProveedorContextoGlobal } from "@/context/ContextoGlobal";
import { ProveedorContextoChess } from "@/context/ContextoChess";
import { ProveedorContextoRealtime } from "@/context/ContextoRealtime";

function shouldUseGlobalContext(pathname: string) {
  return pathname === "/" || pathname.startsWith("/easter-eggs");
}

function shouldUseChessSessionProvider(pathname: string) {
  return (
    pathname === "/chess" ||
    pathname === "/chess/invitations" ||
    pathname.startsWith("/chess/play/") ||
    pathname === "/nexus" ||
    pathname.startsWith("/nexus/")
  );
}

function shouldUseRealtimeProvider(pathname: string) {
  return pathname === "/chess" || pathname === "/chess/invitations" || pathname === "/nexus" || pathname.startsWith("/nexus/");
}

function ProvidersWithOptionalInteractiveContexts({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const shouldUseChessProvider = shouldUseChessSessionProvider(pathname);
  const shouldUseRealtime = shouldUseRealtimeProvider(pathname);

  if (!shouldUseChessProvider) {
    return <>{children}</>;
  }

  if (!shouldUseRealtime) {
    return <ProveedorContextoChess>{children}</ProveedorContextoChess>;
  }

  return (
    <ProveedorContextoChess>
      <ProveedorContextoRealtime>{children}</ProveedorContextoRealtime>
    </ProveedorContextoChess>
  );
}

function ProvidersWithOptionalGlobalContext({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (!shouldUseGlobalContext(pathname)) {
    return <>{children}</>;
  }

  return <ProveedorContextoGlobal>{children}</ProveedorContextoGlobal>;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ProvidersWithOptionalGlobalContext>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
        themes={["light", "dark", "forest", "sepia"]}
      >
        <ProvidersWithOptionalInteractiveContexts>{children}</ProvidersWithOptionalInteractiveContexts>
      </ThemeProvider>
    </ProvidersWithOptionalGlobalContext>
  );
}
