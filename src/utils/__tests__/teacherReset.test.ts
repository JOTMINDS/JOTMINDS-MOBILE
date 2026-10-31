jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn(),
}));
jest.mock('../userStorage', () => ({ readScoped: jest.fn(), writeScoped: jest.fn() }));

import {
  BREATH_SECONDS, BREATH_ROUNDS, REFLECTION_PROMPTS, promptForDay, breathAt, didResetToday, resetStreak,
} from '../teacherReset';

describe('breathAt', () => {
  it('runs in, hold, out, hold for four seconds each', () => {
    expect(breathAt(0)).toMatchObject({ label: 'Breathe in', round: 1, secondsLeft: 4 });
    expect(breathAt(3)).toMatchObject({ label: 'Breathe in', secondsLeft: 1 });
    expect(breathAt(4)).toMatchObject({ label: 'Hold', phaseIndex: 1 });
    expect(breathAt(8)).toMatchObject({ label: 'Breathe out', phaseIndex: 2 });
    expect(breathAt(12)).toMatchObject({ label: 'Hold', phaseIndex: 3 });
    expect(breathAt(16)).toMatchObject({ label: 'Breathe in', round: 2 });
  });

  it('lasts three rounds and never runs past the end', () => {
    expect(BREATH_ROUNDS).toBe(3);
    expect(BREATH_SECONDS).toBe(48);
    expect(breathAt(BREATH_SECONDS - 1)).toMatchObject({ round: 3, label: 'Hold' });
    expect(breathAt(10_000).round).toBe(3);
    expect(breathAt(-5)).toMatchObject({ label: 'Breathe in', round: 1 });
  });
});

describe('promptForDay', () => {
  it('is stable within a day and changes on the next', () => {
    const a = new Date(2026, 5, 10, 8, 0);
    const b = new Date(2026, 5, 10, 21, 30);
    const c = new Date(2026, 5, 11, 8, 0);
    expect(promptForDay(a)).toBe(promptForDay(b));
    expect(promptForDay(c)).not.toBe(promptForDay(a));
    expect(REFLECTION_PROMPTS).toContain(promptForDay(a));
  });
});

describe('reset streak', () => {
  const now = new Date(2026, 5, 10, 12, 0);
  it('counts consecutive days and today', () => {
    const dates = [new Date(2026, 5, 8, 9).toISOString(), new Date(2026, 5, 9, 9).toISOString(), new Date(2026, 5, 10, 9).toISOString()];
    expect(resetStreak(dates, now)).toBe(3);
    expect(didResetToday(dates, now)).toBe(true);
  });

  it('is not done today when the last reset was yesterday, but the streak is still alive', () => {
    const dates = [new Date(2026, 5, 9, 9).toISOString()];
    expect(didResetToday(dates, now)).toBe(false);
    expect(resetStreak(dates, now)).toBe(1);
  });
});
