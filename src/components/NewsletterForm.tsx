"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("¡Gracias por suscribirte! Revisa tu correo de bienvenida.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Algo salió mal. Inténtalo de nuevo.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("No se pudo conectar con el servidor.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu-correo@ejemplo.com"
          required
          className="flex-grow px-4 py-2 rounded-md bg-background border border-border text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <motion.button
          type="submit"
          disabled={status === "loading"}
          className="px-6 py-2 font-mono font-bold rounded-md bg-blue-500 text-white disabled:bg-gray-500"
          whileHover={{ scale: status === "loading" ? 1 : 1.05 }}
          whileTap={{ scale: status === "loading" ? 1 : 0.95 }}
        >
          {status === "loading" ? "Enviando..." : "Suscribirse"}
        </motion.button>
      </div>
      {message && (
        <p className={`mt-2 text-sm font-mono ${status === "success" ? "text-green-500" : "text-red-500"}`}>
          {message}
        </p>
      )}
    </form>
  );
}
