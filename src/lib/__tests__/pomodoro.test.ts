import { nextPhase } from "../pomodoro";
import { describe, expect, it } from "vitest";

describe("nextPhase", () => {
  it("takes a short break after the first focus block", () => {
    expect(nextPhase("focus", 1)).toBe("shortBreak");
  });

  it("takes a long break after every fourth focus block", () => {
    expect(nextPhase("focus", 4)).toBe("longBreak");
  });

  it("returns to focus after any break", () => {
    expect(nextPhase("shortBreak", 1)).toBe("focus");
    expect(nextPhase("longBreak", 4)).toBe("focus");
  });
});
