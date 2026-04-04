"use client";

import React from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  shouldEnableHomeEffects,
  shouldShowChat,
  shouldShowFooter,
  shouldShowHeader,
  shouldShowNewsletter,
  shouldUsePlainShell,
} from "@/config/site";
import { useContextoGlobal } from "@/context/ContextoGlobal";
import SiteHeader from "@/components/shell/SiteHeader";
import SiteFooter from "@/components/shell/SiteFooter";

const ChatRealtime = dynamic(() => import("@/components/ChatRealtime"), { ssr: false });
const VentanaBoletin = dynamic(() => import("@/components/VentanaBoletin"), { ssr: false });
const GestorDeEventosGlobales = dynamic(() => import("@/components/GestorDeEventosGlobales"), { ssr: false });
const GestorDeEventosRandy = dynamic(() => import("@/components/GestorDeEventosRandy"), { ssr: false });
const EfectoMatrix = dynamic(() => import("@/components/EfectoMatrix"), { ssr: false });
const OjoVigilante = dynamic(() => import("@/components/OjoVigilante"), { ssr: false });
const Minijuego1984 = dynamic(() => import("@/components/Minijuego1984"), { ssr: false });

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { efectoMatrixVisible, estado1984 } = useContextoGlobal();
  const shouldAvoidTranslateMotion = pathname.startsWith("/chess");

  const enableHomeEffects = shouldEnableHomeEffects(pathname);
  const showHeader = shouldShowHeader(pathname);
  const showFooter = shouldShowFooter(pathname);
  const showNewsletter = shouldShowNewsletter(pathname);
  const showChat = shouldShowChat(pathname);
  const plainShell = shouldUsePlainShell(pathname);

  return (
    <>
      {enableHomeEffects && <GestorDeEventosGlobales />}
      {enableHomeEffects && <GestorDeEventosRandy />}
      {showHeader && <SiteHeader />}

      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={shouldAvoidTranslateMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={shouldAvoidTranslateMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={shouldAvoidTranslateMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
          transition={{ duration: 0.28 }}
          className={plainShell ? undefined : "min-h-screen"}
        >
          {children}
        </motion.main>
      </AnimatePresence>

      {showNewsletter && <VentanaBoletin />}
      {showFooter && <SiteFooter />}
      {showChat && <ChatRealtime />}

      {enableHomeEffects && (
        <AnimatePresence>
          {efectoMatrixVisible && <EfectoMatrix />}
          {estado1984 !== "inactivo" && estado1984 !== "minijuego" && <OjoVigilante />}
          {estado1984 === "minijuego" && <Minijuego1984 />}
        </AnimatePresence>
      )}
    </>
  );
}
