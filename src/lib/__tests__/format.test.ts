import { fmtClock, fmtDuration, topicLabel } from "../format";
import { describe, expect, it } from "vitest";

describe("fmtClock", () => {
  it("shows minutes and seconds", () => {
    expect(fmtClock(25 * 60 * 1000)).toBe("25:00");
  });

  it("rounds partial seconds up so the clock never shows 00:00 early", () => {
    expect(fmtClock(1500)).toBe("00:02");
  });
});

describe("fmtDuration", () => {
  it("shows minutes under an hour", () => {
    expect(fmtDuration(45 * 60)).toBe("45m");
  });

  it("shows hours and minutes", () => {
    expect(fmtDuration(3600 + 5 * 60)).toBe("1h 5m");
  });
});

describe("topicLabel", () => {
  it("joins a subtopic with its domain", () => {
    expect(
      topicLabel({ name: "Machine Learning", parentName: "Learning" }),
    ).toBe("Learning › Machine Learning");
  });

  it("returns just the name for a domain", () => {
    expect(topicLabel({ name: "Work", parentName: null })).toBe("Work");
  });
});
