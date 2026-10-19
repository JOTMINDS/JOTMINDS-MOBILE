const mockStore: Record<string, string> = {};
jest.mock('../userStorage', () => ({
  readScoped: async (k: string) => (k in mockStore ? mockStore[k] : null),
  writeScoped: async (k: string, v: string) => { mockStore[k] = v; },
}));
import { dayStamp, toggleTaskDone, getCompletedToday, getAdaptationStreak } from '../adaptationTasks';

beforeEach(() => Object.keys(mockStore).forEach((k) => delete mockStore[k]));

describe('adaptation tasks', () => {
  it('dayStamp uses the local calendar day, not UTC', () => {
    expect(dayStamp(new Date(2026, 9, 5, 23, 30))).toBe('2026-10-05');
    expect(dayStamp(new Date(2026, 0, 1, 0, 10))).toBe('2026-01-01');
  });
  it('toggles a task on and off', async () => {
    expect([...(await toggleTaskDone('pm', 'a'))]).toEqual(['a']);
    expect((await getCompletedToday('pm')).has('a')).toBe(true);
    expect((await toggleTaskDone('pm', 'a')).size).toBe(0);
  });
  it('streak is 1 after completing a task today, 0 after un-completing it', async () => {
    await toggleTaskDone('pm', 'a');
    expect(await getAdaptationStreak('pm')).toBe(1);
    await toggleTaskDone('pm', 'a');
    expect(await getAdaptationStreak('pm')).toBe(0);
  });
  it('counts consecutive past days from stored dates', async () => {
    const d = (n: number) => { const x = new Date(); x.setDate(x.getDate() - n); return dayStamp(x); };
    mockStore['jotminds.adaptTasks.pm'] = JSON.stringify({ [d(0)]: ['a'], [d(1)]: ['a'], [d(3)]: ['a'] });
    expect(await getAdaptationStreak('pm')).toBe(2);
  });
});
