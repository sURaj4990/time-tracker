import { describe, expect, it } from "vitest";
import { toLocalDate, parseLocalDate, shiftDate, lastNDays } from "../date";

describe("date helpers", () => {
  it("formats a local date as YYYY-MM-DD", () => {
    expect(toLocalDate(new Date(2026, 10, 5))).toBe("2026-11-05");
  });

  it("parses a date string back to the same local day", () => {
    expect(parseLocalDate("2026-11-05").getDate()).toBe(5);
  });

  it("moves across month boundaries", () => {
    expect(shiftDate("2026-11-30", 1)).toBe("2026-12-01");
  });

  it("moves backwards across month boundaries", () => {
    expect(shiftDate("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("returns n days ending on the given date, oldest first", () => {
    expect(lastNDays(3, new Date(2026, 10, 5))).toEqual([
      "2026-11-03",
      "2026-11-04",
      "2026-11-05",
    ]);
  });
});
