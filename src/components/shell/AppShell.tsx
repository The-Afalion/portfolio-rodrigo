"use client";

import React from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import {
  shouldEnableHomeEffects,
  shouldShowChat,
  shouldShowFooter,
  shouldShowHeader,
  shouldShowNewsletter,
  shouldUsePlainShell,
} from "@/config/site";
import SiteHeader from "@/components/shell/SiteHeader";
import SiteFooter from "@/components/shell/SiteFooter";

const ChatRealtime = dynamic(() => import("@/components/ChatRealtime"), { ssr: false });
const VentanaBoletin = dynamic(() => import("@/components/VentanaBoletin"), { ssr: false });
const GestorDeEventosGlobales = dynamic(() => import("@/components/GestorDeEventosGlobales"), { ssr: false });
const GestorDeEventosRandy = dynamic(() => import("@/components/GestorDeEventosRandy"), { ssr: false });
const HomeEffectsOverlay = dynamic(() => import("@/components/shell/HomeEffectsOverlay"), { ssr: false });

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const enableHomeEffects = shouldEnableHomeEffects(pathname);
  const showHeader = shouldShowHeader(pathname);
  const showFooter = shouldShowFooter(pathname);
  const showNewsletter = shouldShowNewsletter(pathname);
  const showChat = shouldShowChat(pathname);
  const plainShell = shouldUsePlainShell(pathname);
  const shellClassName = pathname === "/" ? "" : "board-theme";

  return (
    <div className={shellClassName}>
      {enableHomeEffects ? <GestorDeEventosGlobales /> : null}
      {enableHomeEffects ? <GestorDeEventosRandy /> : null}
      {showHeader ? <SiteHeader /> : null}

      <main className={plainShell ? undefined : "min-h-screen"}>{children}</main>

      {showNewsletter ? <VentanaBoletin /> : null}
      {showFooter ? <SiteFooter /> : null}
      {showChat ? <ChatRealtime /> : null}
      {enableHomeEffects ? <HomeEffectsOverlay /> : null}
    </div>
  );
}
