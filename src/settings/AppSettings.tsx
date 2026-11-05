import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AppState } from "react-native";
import { getSetting, setSetting } from "../db/settings";
import { ensureReminderPermission, syncReminders } from "../lib/reminders";
import React from "react";

export type WeekStart = "mon" | "sun";
export type Reminder = { enabled: boolean; hour: number; minute: number };
export type PomodoroMinutes = {
  focus: number;
  shortBreak: number;
  longBreak: number;
};

const DEFAULT_REMINDER: Reminder = { enabled: false, hour: 20, minute: 0 };
const DEFAULT_POMODORO: PomodoroMinutes = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
};

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await getSetting(key);
  if (!raw) return fallback;
  try {
    return { ...fallback, ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}

type AppSettingsValue = {
  weekStart: WeekStart;
  setWeekStart: (v: WeekStart) => Promise<void>;
  goals: Record<number, number>; // domain id -> minutes per day, 0 = no goal
  setGoal: (domainId: number, minutes: number) => Promise<void>;
  reminder: Reminder;
  setReminder: (r: Reminder) => Promise<boolean>; // false if notifications are blocked
  pomodoro: PomodoroMinutes;
  setPomodoro: (p: PomodoroMinutes) => Promise<void>;
  reload: () => Promise<void>;
};

const AppSettingsContext = createContext<AppSettingsValue | null>(null);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [weekStart, setWeekStartState] = useState<WeekStart>("mon");
  const [goals, setGoalsState] = useState<Record<number, number>>({});
  const [reminder, setReminderState] = useState<Reminder>(DEFAULT_REMINDER);
  const [pomodoro, setPomodoroState] =
    useState<PomodoroMinutes>(DEFAULT_POMODORO);

  const reload = useCallback(async () => {
    const [w, g, r, p] = await Promise.all([
      getSetting("week_start"),
      readJson<Record<number, number>>("daily_goals", {}),
      readJson<Reminder>("reminder", DEFAULT_REMINDER),
      readJson<PomodoroMinutes>("pomodoro", DEFAULT_POMODORO),
    ]);
    setWeekStartState(w === "sun" ? "sun" : "mon");
    setGoalsState(g);
    setReminderState(r);
    setPomodoroState(p);
    setLoaded(true);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // Rebuilds reminders after changes settle (debounced), and again when the app is backgrounded
  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => {
      syncReminders(reminder).catch(() => {});
    }, 600);
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background") syncReminders(reminder).catch(() => {});
    });
    return () => {
      clearTimeout(t);
      sub.remove();
    };
  }, [loaded, reminder]);

  const setWeekStart = async (v: WeekStart) => {
    setWeekStartState(v);
    await setSetting("week_start", v);
  };

  const setGoal = async (domainId: number, minutes: number) => {
    const next = { ...goals, [domainId]: minutes };
    setGoalsState(next);
    await setSetting("daily_goals", JSON.stringify(next));
  };

  const setReminder = async (r: Reminder): Promise<boolean> => {
    const previous = reminder;
    // Update immediately so the switch responds on the first tap
    setReminderState(r);
    if (r.enabled && !(await ensureReminderPermission())) {
      setReminderState(previous);
      return false;
    }
    await setSetting("reminder", JSON.stringify(r));
    return true;
  };

  const setPomodoro = async (p: PomodoroMinutes) => {
    setPomodoroState(p);
    await setSetting("pomodoro", JSON.stringify(p));
  };

  const value = useMemo<AppSettingsValue>(
    () => ({
      weekStart,
      setWeekStart,
      goals,
      setGoal,
      reminder,
      setReminder,
      pomodoro,
      setPomodoro,
      reload,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [weekStart, goals, reminder, pomodoro, reload],
  );

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings(): AppSettingsValue {
  const ctx = useContext(AppSettingsContext);
  if (!ctx)
    throw new Error("useAppSettings must be used inside AppSettingsProvider");
  return ctx;
}
