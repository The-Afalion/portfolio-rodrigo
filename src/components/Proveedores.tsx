"use client";
import { ThemeProvider } from "next-themes";
import { ReactNode, useEffect, useState } from "react";
import { ProveedorContextoGlobal } from "@/context/ContextoGlobal";
import { ProveedorContextoChess } from "@/context/ContextoChess";
import { ProveedorContextoRealtime } from "@/context/ContextoRealtime";

export function Proveedores({ children }: { children: ReactNode }) {
  const [estaMontado, setEstaMontado] = useState(false);

  useEffect(() => {
    setEstaMontado(true);
  }, []);

  if (!estaMontado) {
    return null; 
  }

  return (
    <ProveedorContextoGlobal>
      <ProveedorContextoChess>
        <ProveedorContextoRealtime>
          <ThemeProvider attribute="class" defaultTheme="dark">
            {children}
          </ThemeProvider>
        </ProveedorContextoRealtime>
      </ProveedorContextoChess>
    </ProveedorContextoGlobal>
  );
}
