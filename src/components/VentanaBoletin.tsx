"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import FormularioBoletin from "./FormularioBoletin";

export default function VentanaBoletin() {
  const [estaAbierta, setEstaAbierta] = useState(false);
  const [estaCerrando, setEstaCerrando] = useState(false);

  useEffect(() => {
    const haCerradoVentana = localStorage.getItem("ventanaBoletinCerrada");
    if (haCerradoVentana) return;

    const gestionarScroll = () => {
      if (window.scrollY > window.innerHeight * 0.4) {
        setEstaAbierta(true);
        window.removeEventListener("scroll", gestionarScroll);
      }
    };

    const temporizador = setTimeout(() => {
      window.addEventListener("scroll", gestionarScroll);
      gestionarScroll(); // Comprobar una vez por si ya se ha hecho scroll
    }, 2000);

    return () => {
      clearTimeout(temporizador);
      window.removeEventListener("scroll", gestionarScroll);
    };
  }, []);

  const gestionarCierre = () => {
    localStorage.setItem("ventanaBoletinCerrada", "true");
    setEstaAbierta(false);
    setEstaCerrando(false);
  };

  const iniciarAnimacionCierre = () => {
    setEstaCerrando(true);
  };

  return (
    <AnimatePresence>
      {estaAbierta && (
        <motion.div
          initial={{ y: "110%" }}
          animate={{ y: 0 }}
          exit={{ y: "110%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 w-auto max-w-sm p-6 bg-card border border-border rounded-lg shadow-2xl z-50 overflow-hidden"
        >
          {!estaCerrando && (
            <>
              <button onClick={iniciarAnimacionCierre} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground z-20">
                <X size={20} />
              </button>
              <h3 className="text-lg font-bold mb-2">Únete a la Comunidad</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Recibe actualizaciones sobre nuevos proyectos y artículos.
              </p>
              <FormularioBoletin />
            </>
          )}
          
          {estaCerrando && (
            <motion.div
              className="absolute inset-0 bg-black flex items-center justify-center"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="w-full h-px bg-white"
                initial={{ scaleY: 100 }}
                animate={{ scaleY: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                onAnimationComplete={gestionarCierre}
              />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
