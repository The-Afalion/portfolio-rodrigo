"use client";

import { Toaster } from "react-hot-toast";

export default function GlobalToaster() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        className: "font-mono",
        style: {
          background: "hsl(var(--card))",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "1.1rem",
          boxShadow: "0 18px 48px rgba(15, 23, 42, 0.14)",
        },
      }}
    />
  );
}
