import { describe, it, expect } from "vitest";
import { getWheelIndex, WHEEL_ITEM_HEIGHT } from "../wheel";

describe("getWheelIndex", () => {
  it("returns the item at the scroll position", () => {
    expect(getWheelIndex(0, 10)).toBe(0);
    expect(getWheelIndex(WHEEL_ITEM_HEIGHT * 3, 10)).toBe(3);
  });

  it("rounds to the nearest item when between two", () => {
    expect(getWheelIndex(WHEEL_ITEM_HEIGHT * 2.4, 10)).toBe(2);
    expect(getWheelIndex(WHEEL_ITEM_HEIGHT * 2.6, 10)).toBe(3);
  });

  it("clamps below zero and past the last item", () => {
    expect(getWheelIndex(-50, 10)).toBe(0);
    expect(getWheelIndex(WHEEL_ITEM_HEIGHT * 99, 10)).toBe(9);
  });

  it("returns zero for an empty list", () => {
    expect(getWheelIndex(100, 0)).toBe(0);
  });

  it("returns zero for a non-finite offset", () => {
    expect(getWheelIndex(Number.NaN, 5)).toBe(0);
    expect(getWheelIndex(Number.POSITIVE_INFINITY, 5)).toBe(0);
  });
});
