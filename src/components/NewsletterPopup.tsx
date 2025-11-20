"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import NewsletterForm from "./NewsletterForm";

export default function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const hasClosedPopup = localStorage.getItem("newsletterPopupClosed");
    if (hasClosedPopup) return;

    const handleScroll = () => {
      if (window.scrollY > window.innerHeight * 0.4) {
        setIsOpen(true);
        window.removeEventListener("scroll", handleScroll);
      }
    };

    const timer = setTimeout(() => {
      window.addEventListener("scroll", handleScroll);
      handleScroll();
    }, 2000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleClose = () => {
    localStorage.setItem("newsletterPopupClosed", "true");
    setIsOpen(false);
    setIsClosing(false); // Reset for next session
  };

  const startClosingAnimation = () => {
    setIsClosing(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "110%" }}
          animate={{ y: 0 }}
          exit={{ y: "110%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 w-auto max-w-sm p-6 bg-card border border-border rounded-lg shadow-2xl z-50 overflow-hidden"
        >
          {!isClosing && (
            <>
              <button onClick={startClosingAnimation} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground z-20">
                <X size={20} />
              </button>
              <h3 className="text-lg font-bold mb-2">Únete a la Comunidad</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Recibe actualizaciones sobre nuevos proyectos y artículos.
              </p>
              <NewsletterForm />
            </>
          )}
          
          {isClosing && (
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
                onAnimationComplete={handleClose}
              />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
