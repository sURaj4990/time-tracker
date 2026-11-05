import { toLocalDate } from "./date";

// Counts consecutive logged days ending today.
// If today isn't logged yet, the streak continues from yesterday.
// A missed day (no entry on a day before today) ends the streak, so it resets to 0.
export function currentStreak(dates: string[], today: string): number {
  const set = new Set(dates);
  const [y, m, d] = today.split("-").map(Number);
  const cursor = new Date(y, m - 1, d);

  if (!set.has(toLocalDate(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (set.has(toLocalDate(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
