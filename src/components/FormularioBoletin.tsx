"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";

export default function FormularioBoletin() {
  const [correo, setCorreo] = useState("");
  const [estado, setEstado] = useState<"idle" | "cargando" | "exito" | "error">("idle");
  const [mensaje, setMensaje] = useState("");

  const gestionarEnvio = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setEstado("cargando");
    setMensaje("");

    try {
      const respuesta = await fetch("/api/suscripcion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: correo }),
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        setEstado("exito");
        setMensaje("¡Gracias por suscribirte!");
        setCorreo("");
        setTimeout(() => setEstado("idle"), 5000); // Reset after 5s
      } else {
        setEstado("error");
        setMensaje(datos.error || "Algo salió mal.");
      }
    } catch (error) {
      setEstado("error");
      setMensaje("No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={gestionarEnvio} className="w-full">
        <div className="flex gap-2 relative">
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="tu-correo@ejemplo.com"
            required
            disabled={estado === 'cargando' || estado === 'exito'}
            className="flex-grow px-4 py-3 rounded-md bg-background border border-border text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all"
          />
          <motion.button
            type="submit"
            disabled={estado === "cargando" || estado === 'exito'}
            className="px-5 py-3 font-mono font-bold rounded-md bg-primary text-primary-foreground disabled:bg-muted disabled:text-muted-foreground"
            whileHover={{ scale: estado === "cargando" ? 1 : 1.05 }}
            whileTap={{ scale: estado === "cargando" ? 1 : 0.95 }}
          >
            {estado === "cargando" ? "Enviando..." : "Suscribirse"}
          </motion.button>
        </div>
      </form>
      <AnimatePresence>
        {estado === "error" && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-destructive flex items-center gap-2"
          >
            <X size={14} /> {mensaje}
          </motion.p>
        )}
        {estado === "exito" && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-green-500 flex items-center gap-2"
          >
            <Check size={14} /> {mensaje}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
