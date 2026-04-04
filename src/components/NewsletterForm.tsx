"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

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
        setMessage("¡Gracias por suscribirte!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Algo salió mal.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("No se pudo conectar.");
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {status !== "success" ? (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="w-full"
          >
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
            {status === "error" && (
              <p className="mt-2 text-sm font-mono text-red-500">{message}</p>
            )}
          </motion.form>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-4 bg-green-500/10 rounded-md"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 15 }}
              className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2"
            >
              <Check size={24} />
            </motion.div>
            <p className="font-mono text-green-300">{message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
