import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import { getSetting, setSetting } from "../db/settings";
import { Palette, palettes, ThemeMode } from "./palettes";
import React from "react";

export type { ThemeMode } from "./palettes";

const SETTING_KEY = "theme_mode";

type ThemeValue = {
  mode: ThemeMode;
  resolved: "light" | "dark";
  colors: Palette;
  setMode: (mode: ThemeMode) => Promise<void>;
  resetMode: () => void;
};

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme() === "dark" ? "dark" : "light";
  const [mode, setModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    getSetting(SETTING_KEY).then((saved) => {
      if (saved === "light" || saved === "dark" || saved === "system") {
        setModeState(saved);
      }
    });
  }, []);

  const resolved = mode === "system" ? systemScheme : mode;

  const value = useMemo<ThemeValue>(
    () => ({
      mode,
      resolved,
      colors: palettes[resolved],
      setMode: async (next) => {
        setModeState(next);
        await setSetting(SETTING_KEY, next);
      },
      resetMode: () => setModeState("system"),
    }),
    [mode, resolved],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
