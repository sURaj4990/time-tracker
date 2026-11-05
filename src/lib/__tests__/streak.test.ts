import { currentStreak } from '../streak';
import { describe, expect, it } from 'vitest';

describe('currentStreak', () => {
  it('counts consecutive logged days ending today', () => {
    expect(currentStreak(['2026-11-03', '2026-11-04', '2026-11-05'], '2026-11-05')).toBe(3);
  });

  it('continues from yesterday while today is not logged yet', () => {
    expect(currentStreak(['2026-11-03', '2026-11-04'], '2026-11-05')).toBe(2);
  });

  it('stops at the first missed day', () => {
    expect(
      currentStreak(['2026-11-01', '2026-11-03', '2026-11-04', '2026-11-05'], '2026-11-05')
    ).toBe(3);
  });

  it('resets to zero when yesterday was missed', () => {
    expect(currentStreak(['2026-11-03'], '2026-11-05')).toBe(0);
  });

  it('returns zero with no entries', () => {
    expect(currentStreak([], '2026-11-05')).toBe(0);
  });
});