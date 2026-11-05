export type Phase = "focus" | "shortBreak" | "longBreak";

export const DURATIONS_MS: Record<Phase, number> = {
  focus: 25 * 60 * 1000,
  shortBreak: 5 * 60 * 1000,
  longBreak: 15 * 60 * 1000,
};

export const FOCUS_BLOCKS_PER_LONG_BREAK = 4;

// Call with the phase that just ended and the number of focus blocks completed so far.
export function nextPhase(ended: Phase, completedFocus: number): Phase {
  if (ended === "focus") {
    return completedFocus % FOCUS_BLOCKS_PER_LONG_BREAK === 0
      ? "longBreak"
      : "shortBreak";
  }
  return "focus";
}
