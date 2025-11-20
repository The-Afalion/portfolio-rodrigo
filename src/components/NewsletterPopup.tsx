"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import NewsletterForm from "./NewsletterForm";

export default function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasClosedPopup = localStorage.getItem("newsletterPopupClosed");
    if (hasClosedPopup) return;

    const handleScroll = () => {
      // CORRECCIÓN: El pop-up aparecerá mucho antes, al hacer scroll un 40% de la página.
      if (window.scrollY > window.innerHeight * 0.4) {
        setIsOpen(true);
        window.removeEventListener("scroll", handleScroll);
      }
    };

    // Añadimos un pequeño retraso para no mostrarlo al instante si el usuario ya ha hecho scroll.
    const timer = setTimeout(() => {
      window.addEventListener("scroll", handleScroll);
      // Comprobar también al cargar, por si el usuario ya está abajo en la página
      handleScroll();
    }, 2000); // Esperar 2 segundos antes de empezar a comprobar

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("newsletterPopupClosed", "true");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 right-4 w-full max-w-sm p-6 bg-card border border-border rounded-lg shadow-2xl z-50"
        >
          <button onClick={handleClose} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
          <h3 className="text-lg font-bold mb-2">Únete a la Comunidad</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Recibe actualizaciones sobre nuevos proyectos y artículos directamente en tu bandeja de entrada.
          </p>
          <NewsletterForm />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
