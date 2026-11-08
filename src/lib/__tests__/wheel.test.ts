import { describe, expect, it } from "vitest";
import { getWheelIndex, WHEEL_ITEM_HEIGHT } from "../wheel";

describe("getWheelIndex", () => {
  it("chooses the nearest item", () => {
    expect(getWheelIndex(WHEEL_ITEM_HEIGHT * 1.6, 5)).toBe(2);
  });

  it("clamps offsets to the first and last item", () => {
    expect(getWheelIndex(-10, 5)).toBe(0);
    expect(getWheelIndex(WHEEL_ITEM_HEIGHT * 10, 5)).toBe(4);
  });

  it("returns zero when there are no items or the offset is invalid", () => {
    expect(getWheelIndex(0, 0)).toBe(0);
    expect(getWheelIndex(Number.NaN, 5)).toBe(0);
  });
});
