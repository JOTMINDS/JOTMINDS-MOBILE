const mockStore: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: async (k: string) => mockStore[k] ?? null,
  setItem: async (k: string, v: string) => { mockStore[k] = v; },
  removeItem: async (k: string) => { delete mockStore[k]; },
}));

import { loadEntries, saveAttempt, progress, isSubmittable, buildReportText } from '../professionalCognitiveStore';

const full = (n = 4) => ({
  learning: new Array(6).fill(n), thinking: new Array(6).fill(n), decisionMaking: new Array(6).fill(n), motivation: new Array(4).fill(n),
});

beforeEach(() => Object.keys(mockStore).forEach((k) => delete mockStore[k]));

describe('progress / isSubmittable', () => {
  it('counts answers out of 22 (optional section included)', () => {
    expect(progress({ learning: [], thinking: [], decisionMaking: [] })).toEqual({ answered: 0, total: 22 });
    expect(progress(full())).toEqual({ answered: 22, total: 22 });
  });
  it('requires the three core sections but not the optional one', () => {
    expect(isSubmittable({ ...full(), motivation: [] })).toBe(true);
    expect(isSubmittable({ ...full(), thinking: [4, 4, 4] })).toBe(false);
    expect(isSubmittable({ learning: [], thinking: [], decisionMaking: [] })).toBe(false);
  });
});

describe('attempt history', () => {
  it('scores, stores newest first and isolates users', async () => {
    const a = await saveAttempt('u1', full(4), new Date('2026-09-01T10:00:00Z'));
    const b = await saveAttempt('u1', full(2), new Date('2026-09-10T10:00:00Z'));
    await saveAttempt('u2', full(5));
    const list = await loadEntries('u1');
    expect(list.map((e) => e.id)).toEqual([b.id, a.id]);
    expect(list[0].profile.learning.style).toBeTruthy();
    expect(await loadEntries('u2')).toHaveLength(1);
    expect(await loadEntries('nobody')).toEqual([]);
  });
  it('keeps at most 20 attempts', async () => {
    for (let i = 0; i < 23; i++) await saveAttempt('u1', full(3), new Date(2026, 0, 1, 0, 0, i));
    expect(await loadEntries('u1')).toHaveLength(20);
  });
  it('survives corrupt storage', async () => {
    mockStore['jotminds.profCognitive.u1'] = '{oops';
    expect(await loadEntries('u1')).toEqual([]);
  });
});

describe('buildReportText', () => {
  it('names the person, position and organisation and includes every dimension', async () => {
    const e = await saveAttempt('u1', full(4), new Date('2026-09-19T10:00:00Z'));
    const text = buildReportText(e, { name: 'Ama Mensah', position: 'Analyst', organization: 'Acme' });
    expect(text).toContain('Ama Mensah · Analyst · Acme');
    expect(text).toMatch(/Learning: .+\(\d+\)/);
    expect(text).toMatch(/Decision-making: /);
    expect(text).toMatch(/Motivation: /);
    expect(text).toContain('jotminds.com');
  });
  it('omits motivation when that section was skipped', async () => {
    const e = await saveAttempt('u1', { ...full(4), motivation: [] });
    expect(buildReportText(e, {})).not.toMatch(/Motivation:/);
  });
});
