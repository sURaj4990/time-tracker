export const WHEEL_ITEM_HEIGHT = 44;

// Converts a scroll offset into the index of the item at the centre of the wheel,
// clamped to the list. Works for any list length.
export function getWheelIndex(offsetY: number, count: number): number {
  if (count <= 0 || !Number.isFinite(offsetY)) return 0;
  const raw = Math.round(offsetY / WHEEL_ITEM_HEIGHT);
  return Math.min(count - 1, Math.max(0, raw));
}
