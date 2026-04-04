export type ChessModeKey = "chess_rapid_10m" | "chess_correspondence_3d";

export type ChessModeConfig = {
  key: ChessModeKey;
  label: string;
  description: string;
  timeControlType: "REALTIME" | "CORRESPONDENCE";
  initialTimeMs: number | null;
  incrementMs: number;
  correspondenceTurnMs: number | null;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const CHESS_MODE_CONFIGS: Record<ChessModeKey, ChessModeConfig> = {
  chess_rapid_10m: {
    key: "chess_rapid_10m",
    label: "Ajedrez 10 min",
    description: "10 minutos por jugador, sin incremento.",
    timeControlType: "REALTIME",
    initialTimeMs: 10 * 60 * 1000,
    incrementMs: 0,
    correspondenceTurnMs: null,
  },
  chess_correspondence_3d: {
    key: "chess_correspondence_3d",
    label: "Correspondencia 3 días",
    description: "Cada jugada debe realizarse dentro de 3 días.",
    timeControlType: "CORRESPONDENCE",
    initialTimeMs: null,
    incrementMs: 0,
    correspondenceTurnMs: 3 * DAY_IN_MS,
  },
};

export const DEFAULT_CHESS_MODE_KEY: ChessModeKey = "chess_rapid_10m";

export function getChessModeConfig(modeKey?: string | null) {
  if (!modeKey) {
    return CHESS_MODE_CONFIGS[DEFAULT_CHESS_MODE_KEY];
  }

  return CHESS_MODE_CONFIGS[modeKey as ChessModeKey] ?? CHESS_MODE_CONFIGS[DEFAULT_CHESS_MODE_KEY];
}

export function formatDurationMs(durationMs: number) {
  if (durationMs <= 0) {
    return "00:00";
  }

  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatRemainingDays(durationMs: number) {
  const totalMinutes = Math.max(0, Math.ceil(durationMs / 60000));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}
