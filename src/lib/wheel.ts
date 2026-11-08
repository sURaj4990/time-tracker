export const WHEEL_ITEM_HEIGHT = 44;

export function getWheelIndex(offsetY: number, itemCount: number): number {
  if (itemCount <= 0 || !Number.isFinite(offsetY)) return 0;
  return Math.min(
    itemCount - 1,
    Math.max(0, Math.round(offsetY / WHEEL_ITEM_HEIGHT)),
  );
}
