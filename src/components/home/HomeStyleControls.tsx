"use client";

import { useEffect, useState } from "react";

export const HOME_THEMES = [
  { id: "ink", name: "Ink", description: "sobrio", swatch: "#f1c27d" },
  { id: "paper", name: "Paper", description: "claro", swatch: "#2f4f46" },
  { id: "board", name: "Tablón", description: "blog", swatch: "#8c4030" },
  { id: "signal", name: "Signal", description: "vivo", swatch: "#79d8e8" },
] as const;

export type HomeThemeId = (typeof HOME_THEMES)[number]["id"];

const storageKey = "home-theme";

function isHomeThemeId(value: string | null): value is HomeThemeId {
  return HOME_THEMES.some((theme) => theme.id === value);
}

function applyHomeTheme(theme: HomeThemeId) {
  document.documentElement.dataset.homeTheme = theme;
  window.localStorage.setItem(storageKey, theme);
  window.dispatchEvent(new CustomEvent("home-theme-change", { detail: theme }));
}

export function useHomeTheme() {
  const [activeTheme, setActiveTheme] = useState<HomeThemeId>("ink");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(storageKey);
    const initialTheme = isHomeThemeId(savedTheme) ? savedTheme : "ink";

    setActiveTheme(initialTheme);
    applyHomeTheme(initialTheme);

    const handleThemeChange = (event: Event) => {
      const theme = (event as CustomEvent<HomeThemeId>).detail;
      if (isHomeThemeId(theme)) {
        setActiveTheme(theme);
      }
    };

    window.addEventListener("home-theme-change", handleThemeChange);

    return () => {
      window.removeEventListener("home-theme-change", handleThemeChange);
    };
  }, []);

  const changeTheme = (theme: HomeThemeId) => {
    setActiveTheme(theme);
    applyHomeTheme(theme);
  };

  return { activeTheme, changeTheme };
}

export default function HomeStyleControls() {
  const { activeTheme, changeTheme } = useHomeTheme();

  return (
    <div className="home-menu-style-grid" role="radiogroup" aria-label="Cambiar estilo visual">
      {HOME_THEMES.map((theme) => {
        const isActive = activeTheme === theme.id;

        return (
          <button
            key={theme.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            className={`home-menu-style-button ${isActive ? "is-active" : ""}`}
            onClick={() => changeTheme(theme.id)}
          >
            <span className="home-menu-style-swatch" style={{ backgroundColor: theme.swatch }} />
            <span>
              <span>{theme.name}</span>
              <small>{theme.description}</small>
            </span>
          </button>
        );
      })}
    </div>
  );
}
