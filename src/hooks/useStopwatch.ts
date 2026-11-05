import { useEffect, useRef, useState } from "react";
import { insertEntry } from "../db/entries";

export const MIN_LOG_SECONDS = 60;

type Status = "idle" | "running" | "paused";

export function useStopwatch(topicId: number) {
  const [, force] = useState(0);
  const s = useRef({
    status: "idle" as Status,
    accumulatedMs: 0,
    runStartedAt: 0,
    sessionStartedAt: null as Date | null,
  });
  const topicRef = useRef(topicId);
  topicRef.current = topicId;

  const elapsedMs = () => {
    const st = s.current;
    return (
      st.accumulatedMs +
      (st.status === "running" ? Date.now() - st.runStartedAt : 0)
    );
  };

  const start = () => {
    const st = s.current;
    if (st.status === "running") return;
    if (!st.sessionStartedAt) st.sessionStartedAt = new Date();
    st.runStartedAt = Date.now();
    st.status = "running";
    force((n) => n + 1);
  };

  const pause = () => {
    const st = s.current;
    if (st.status !== "running") return;
    st.accumulatedMs = elapsedMs();
    st.status = "paused";
    force((n) => n + 1);
  };

  // Ends the session. Saves it only if it lasted at least a minute.
  const stop = async (
    note?: string,
  ): Promise<{ seconds: number; saved: boolean }> => {
    const st = s.current;
    const seconds = Math.round(elapsedMs() / 1000);
    const startedAt = st.sessionStartedAt;
    st.status = "idle";
    st.accumulatedMs = 0;
    st.runStartedAt = 0;
    st.sessionStartedAt = null;
    force((n) => n + 1);

    if (startedAt && seconds >= MIN_LOG_SECONDS) {
      await insertEntry({
        topicId: topicRef.current,
        durationSeconds: seconds,
        startedAt,
        source: "timer",
        note: note?.trim() || undefined,
      });
      return { seconds, saved: true };
    }
    return { seconds, saved: false };
  };

  // Redraws the clock twice a second while running.
  useEffect(() => {
    const id = setInterval(() => {
      if (s.current.status === "running") force((n) => n + 1);
    }, 500);
    return () => clearInterval(id);
  }, []);

  const st = s.current;
  return {
    status: st.status,
    isActive: st.status !== "idle",
    elapsedMs: elapsedMs(),
    start,
    pause,
    stop,
  };
}

export type StopwatchState = ReturnType<typeof useStopwatch>;
