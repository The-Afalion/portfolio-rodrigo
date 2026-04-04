"use client";
import { ReactNode } from "react";
import { AppProviders } from "@/components/shell/AppProviders";

export function Providers({ children }: { children: ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}
