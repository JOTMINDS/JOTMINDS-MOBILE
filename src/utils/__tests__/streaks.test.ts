import { consecutiveDayStreak } from '../streaks';

const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).toISOString();
const now = new Date(2026, 9, 19, 15);

describe('consecutiveDayStreak', () => {
  it('is 0 with no entries', () => expect(consecutiveDayStreak([], now)).toBe(0));
  it('counts back from today', () => {
    expect(consecutiveDayStreak([at(2026, 10, 19), at(2026, 10, 18), at(2026, 10, 17)], now)).toBe(3);
  });
  it('stays alive through yesterday when today is empty', () => {
    expect(consecutiveDayStreak([at(2026, 10, 18), at(2026, 10, 17)], now)).toBe(2);
  });
  it('resets after a missed day', () => {
    expect(consecutiveDayStreak([at(2026, 10, 17), at(2026, 10, 16)], now)).toBe(0);
  });
  it('counts multiple entries on one day once, and stops at a gap', () => {
    expect(consecutiveDayStreak([at(2026, 10, 19, 8), at(2026, 10, 19, 20), at(2026, 10, 17)], now)).toBe(1);
  });
  it('survives a daylight-saving boundary', () => {
    const n = new Date(2026, 10, 3, 12); // after US fall-back (Nov 1)
    const dates = [at(2026, 11, 3), at(2026, 11, 2), at(2026, 11, 1), at(2026, 10, 31)];
    expect(consecutiveDayStreak(dates, n)).toBe(4);
  });
});
