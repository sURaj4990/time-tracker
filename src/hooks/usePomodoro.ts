import { useEffect, useRef, useState } from "react";
import { nextPhase, Phase } from "../lib/pomodoro";
import { insertEntry } from "../db/entries";

export type PomodoroDurations = {
  focus: number;
  shortBreak: number;
  longBreak: number;
}; // minutes

type Status = "idle" | "running" | "paused";
const MIN_LOG_SECONDS = 60;

export function usePomodoro(
  topicId: number,
  durations: PomodoroDurations,
  note: string,
) {
  const [, force] = useState(0);
  const rerender = () => force((n) => n + 1);

  const durRef = useRef(durations);
  durRef.current = durations;
  const topicRef = useRef(topicId);
  topicRef.current = topicId;
  const noteRef = useRef(note);
  noteRef.current = note;

  const s = useRef({
    phase: "focus" as Phase,
    status: "idle" as Status,
    endAt: 0,
    pausedRemainingMs: 0,
    completed: 0,
    focusStartedAt: null as Date | null,
  });

  const durationMs = (phase: Phase) => durRef.current[phase] * 60 * 1000;

  const remaining = () => {
    const st = s.current;
    if (st.status === "running") return Math.max(0, st.endAt - Date.now());
    if (st.status === "paused") return st.pausedRemainingMs;
    return durationMs(st.phase);
  };

  const logFocus = async (ms: number, startedAt: Date) => {
    const seconds = Math.round(ms / 1000);
    if (topicRef.current == null || seconds < MIN_LOG_SECONDS) return;
    await insertEntry({
      topicId: topicRef.current,
      durationSeconds: seconds,
      startedAt,
      source: "pomodoro",
      note: noteRef.current.trim() || undefined,
    });
  };

  const advance = () => {
    const st = s.current;
    if (st.phase === "focus") st.completed += 1;
    st.phase = nextPhase(st.phase, st.completed);
    st.status = "idle";
    st.pausedRemainingMs = 0;
    st.focusStartedAt = null;
  };

  const start = () => {
    const st = s.current;
    if (st.status === "running") return;
    const left =
      st.status === "paused" ? st.pausedRemainingMs : durationMs(st.phase);
    st.endAt = Date.now() + left;
    if (st.phase === "focus" && !st.focusStartedAt)
      st.focusStartedAt = new Date();
    st.status = "running";
    rerender();
  };

  const pause = () => {
    const st = s.current;
    if (st.status !== "running") return;
    st.pausedRemainingMs = remaining();
    st.status = "paused";
    rerender();
  };

  // Ends the session. A partial focus block is still logged.
  const stop = () => {
    const st = s.current;
    if (st.phase === "focus" && st.focusStartedAt) {
      logFocus(durationMs("focus") - remaining(), st.focusStartedAt);
    }
    st.phase = "focus";
    st.status = "idle";
    st.pausedRemainingMs = 0;
    st.completed = 0;
    st.focusStartedAt = null;
    rerender();
  };

  const skipBreak = () => {
    if (s.current.phase === "focus") return;
    advance();
    rerender();
  };

  useEffect(() => {
    const id = setInterval(() => {
      const st = s.current;
      if (st.status === "running" && remaining() <= 0) {
        const startedAt = st.focusStartedAt;
        if (st.phase === "focus" && startedAt) {
          logFocus(durationMs("focus"), startedAt);
        }
        advance();
      }
      rerender();
    }, 500);
    return () => clearInterval(id);
  }, []);

  const st = s.current;
  return {
    phase: st.phase,
    status: st.status,
    remainingMs: remaining(),
    completed: st.completed,
    start,
    pause,
    stop,
    skipBreak,
  };
}

export type PomodoroState = ReturnType<typeof usePomodoro>;
