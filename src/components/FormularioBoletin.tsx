"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

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
      <AnimatePresence mode="wait">
        {estado !== "exito" ? (
          <motion.form
            key="formulario"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={gestionarEnvio}
            className="w-full"
          >
            <div className="flex gap-2">
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="tu-correo@ejemplo.com"
                required
                className="flex-grow px-4 py-2 rounded-md bg-background border border-border text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <motion.button
                type="submit"
                disabled={estado === "cargando"}
                className="px-6 py-2 font-mono font-bold rounded-md bg-blue-500 text-white disabled:bg-gray-500"
                whileHover={{ scale: estado === "cargando" ? 1 : 1.05 }}
                whileTap={{ scale: estado === "cargando" ? 1 : 0.95 }}
              >
                {estado === "cargando" ? "Enviando..." : "Suscribirse"}
              </motion.button>
            </div>
            {estado === "error" && (
              <p className="mt-2 text-sm font-mono text-red-500">{mensaje}</p>
            )}
          </motion.form>
        ) : (
          <motion.div
            key="exito"
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
            <p className="font-mono text-green-300">{mensaje}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
