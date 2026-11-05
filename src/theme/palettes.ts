export type ThemeMode = "light" | "dark" | "system";

export const palettes = {
  light: {
    background: "#FFFFFF",
    surface: "#F7F7F9",
    surfaceMuted: "#EEEEF2",
    text: "#111111",
    textMuted: "#666666",
    textSubtle: "#888888",
    border: "#DDDDDD",
    primary: "#4F46E5",
    onPrimary: "#FFFFFF",
    danger: "#EF4444",
    overlay: "rgba(0,0,0,0.45)",
    placeholder: "#AAAAAA",
    empty: "#E5E7EB",
    heat: ["#E5E7EB", "#C7D2FE", "#818CF8", "#4F46E5", "#312E81"],
  },
  dark: {
    background: "#0F0F13",
    surface: "#1C1C23",
    surfaceMuted: "#2A2A33",
    text: "#F5F5F7",
    textMuted: "#A1A1AA",
    textSubtle: "#8A8A93",
    border: "#34343E",
    primary: "#818CF8",
    onPrimary: "#0F0F13",
    danger: "#F87171",
    overlay: "rgba(0,0,0,0.6)",
    placeholder: "#6B6B75",
    empty: "#2A2A33",
    heat: ["#2A2A33", "#3730A3", "#4F46E5", "#818CF8", "#C7D2FE"],
  },
};

export type Palette = typeof palettes.light;
