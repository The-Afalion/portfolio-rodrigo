"use client";
import { ThemeProvider } from "next-themes";
import { ReactNode, useEffect, useState } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Evita errores de hidratación asegurándose de que el componente
  // solo se renderice en el cliente donde el tema puede ser determinado.
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Muestra un null o un loader muy básico para evitar el "flash" de contenido sin estilo
    return null; 
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      {children}
    </ThemeProvider>
  );
}
