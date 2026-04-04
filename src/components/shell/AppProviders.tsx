"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { ProveedorContextoGlobal } from "@/context/ContextoGlobal";
import { ProveedorContextoChess } from "@/context/ContextoChess";
import { ProveedorContextoRealtime } from "@/context/ContextoRealtime";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ProveedorContextoGlobal>
      <ProveedorContextoChess>
        <ProveedorContextoRealtime>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
            themes={["light", "dark", "forest", "sepia"]}
          >
            {children}
          </ThemeProvider>
        </ProveedorContextoRealtime>
      </ProveedorContextoChess>
    </ProveedorContextoGlobal>
  );
}
