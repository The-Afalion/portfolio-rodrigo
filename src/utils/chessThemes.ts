import { useEffect, useState } from "react";

export interface ChessBoardTheme {
  id: string;
  name: string;
  dark: string;
  light: string;
  previewDark: string;
  previewLight: string;
}

export const BOARD_THEMES: ChessBoardTheme[] = [
  {
    id: "clasico",
    name: "Clásico (Pizarra)",
    dark: "#475569",
    light: "#d6d3d1",
    previewDark: "bg-slate-600",
    previewLight: "bg-stone-300"
  },
  {
    id: "bosque",
    name: "Bosque (Torneo)",
    dark: "#5e6b4f",
    light: "#ede3c8",
    previewDark: "bg-[#5e6b4f]",
    previewLight: "bg-[#ede3c8]"
  },
  {
    id: "madera",
    name: "Madera (Nogal)",
    dark: "#b58863",
    light: "#f0d9b5",
    previewDark: "bg-[#b58863]",
    previewLight: "bg-[#f0d9b5]"
  },
  {
    id: "terracota",
    name: "Terracota (Arcilla)",
    dark: "#b05a46",
    light: "#f3e6d5",
    previewDark: "bg-[#b05a46]",
    previewLight: "bg-[#f3e6d5]"
  },
  {
    id: "neon",
    name: "Neon (Signal)",
    dark: "#063d3d",
    light: "#e0fcfc",
    previewDark: "bg-[#063d3d]",
    previewLight: "bg-[#e0fcfc]"
  }
];

export const BOT_BOARD_THEMES: Record<string, { dark: string; light: string }> = {
  novato: { dark: "#8c7355", light: "#d1c2b0" },     // Rusty orange-brown
  agresivo: { dark: "#782a21", light: "#e3c4b5" },   // Viper deep red
  defensivo: { dark: "#394e68", light: "#cfd8dc" },   // Fortress steel blue
  troll: { dark: "#6a1b9a", light: "#e8d0f5" },       // Joker purple
  maestro: { dark: "#0d2a4a", light: "#b2ebf2" }      // Cyber deep blue
};

export function getBotBoardTheme(botId: string): { dark: string; light: string } {
  return BOT_BOARD_THEMES[botId] ?? BOARD_THEMES[0];
}

export function useUserBoardTheme() {
  const [theme, setTheme] = useState<{ dark: string; light: string }>(BOARD_THEMES[0]);

  useEffect(() => {
    const saved = localStorage.getItem("chess-board-theme");
    const active = BOARD_THEMES.find((t) => t.id === saved) ?? BOARD_THEMES[0];
    setTheme({ dark: active.dark, light: active.light });

    // Handle updates in real time if storage changes (e.g. from the profile menu)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "chess-board-theme") {
        const nextTheme = BOARD_THEMES.find((t) => t.id === e.newValue) ?? BOARD_THEMES[0];
        setTheme({ dark: nextTheme.dark, light: nextTheme.light });
      }
    };
    
    // Also listen to a custom event for same-window updates
    const handleCustomChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const nextTheme = BOARD_THEMES.find((t) => t.id === detail) ?? BOARD_THEMES[0];
      setTheme({ dark: nextTheme.dark, light: nextTheme.light });
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("chess-board-theme-change", handleCustomChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("chess-board-theme-change", handleCustomChange);
    };
  }, []);

  return theme;
}

export function applyUserBoardTheme(themeId: string) {
  localStorage.setItem("chess-board-theme", themeId);
  window.dispatchEvent(new CustomEvent("chess-board-theme-change", { detail: themeId }));
}
