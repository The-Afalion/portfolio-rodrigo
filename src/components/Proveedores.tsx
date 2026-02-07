"use client";
import { ThemeProvider } from "next-themes";
import { ReactNode, useEffect, useState } from "react";
import { ProveedorContextoApp } from "@/context/ContextoApp";
import { ProveedorContextoEasterEggs } from "@/context/ContextoEasterEggs";
import { ProveedorContextoGlobal } from "@/context/ContextoGlobal";

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
      <ProveedorContextoApp>
        <ProveedorContextoEasterEggs>
          <ThemeProvider attribute="class" defaultTheme="dark">
            {children}
          </ThemeProvider>
        </ProveedorContextoEasterEggs>
      </ProveedorContextoApp>
    </ProveedorContextoGlobal>
  );
}
