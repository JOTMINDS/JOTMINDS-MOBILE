const mockCall = jest.fn();
const store: Record<string, string> = {};

jest.mock('../supabase', () => ({ callEdgeFn: (...a: any[]) => mockCall(...a) }));
jest.mock('../userStorage', () => ({
  readScoped: async (k: string) => store[k] ?? null,
  writeScoped: async (k: string, v: string) => { store[k] = v; },
}));

import { loadTeacherStudents, slimStudent, savedAgo } from '../teacherStudents';

const heavyStudent = {
  id: 's1', name: 'Ama', email: 'a@x.com', className: 'JHS 2', studentCode: 'JM-AAAA-BBBB',
  avatarUrl: 'data:image/jpeg;base64,' + 'A'.repeat(100_000), parentPin: '4821',
  assessments: [{ id: 'r1', type: 'kolb', completedAt: '2026-10-01', responses: new Array(500).fill({ value: 3, responseTime: 900 }), score: { kolb: { style: 'Diverging' } } }],
};

beforeEach(() => { jest.clearAllMocks(); Object.keys(store).forEach((k) => delete store[k]); });

describe('slimStudent', () => {
  it('drops answer histories and private profile fields but keeps what the screens read', () => {
    const s = slimStudent(heavyStudent);
    expect(JSON.stringify(s)).not.toContain('responseTime');
    expect(s).not.toHaveProperty('avatarUrl');
    expect(s).not.toHaveProperty('parentPin');
    expect(s).toMatchObject({ id: 's1', name: 'Ama', className: 'JHS 2', studentCode: 'JM-AAAA-BBBB' });
    expect(s.assessments[0]).toEqual({ id: 'r1', type: 'kolb', completedAt: '2026-10-01', score: { kolb: { style: 'Diverging' } } });
  });

  it('tolerates missing fields', () => {
    expect(slimStudent({ id: 'x' }).assessments).toEqual([]);
  });
});

describe('loadTeacherStudents', () => {
  it('returns the live roster (slimmed) and saves a copy', async () => {
    mockCall.mockResolvedValue({ students: [heavyStudent] });
    const r = await loadTeacherStudents();
    expect(r.stale).toBe(false);
    expect(r.students).toHaveLength(1);
    expect(JSON.stringify(r.students)).not.toContain('responseTime');
    expect(Object.keys(store)).toContain('jotminds.teacherStudents');
    expect(mockCall.mock.calls[0][2]).toBeGreaterThan(20_000); // longer than the default timeout
  });

  it('falls back to the saved copy, marked stale, when the request fails', async () => {
    mockCall.mockResolvedValueOnce({ students: [heavyStudent] });
    await loadTeacherStudents();
    mockCall.mockRejectedValueOnce(new Error('Network problem: can\'t reach JotMinds. Check your connection and try again.'));
    const r = await loadTeacherStudents();
    expect(r.stale).toBe(true);
    expect(r.students[0].name).toBe('Ama');
    expect(r.error).toMatch(/Network problem/);
    expect(r.savedAt).toBeTruthy();
  });

  it('still throws when it fails and there is nothing saved', async () => {
    mockCall.mockRejectedValue(new Error('Network problem'));
    await expect(loadTeacherStudents()).rejects.toThrow('Network problem');
  });

  it('treats an empty live roster as a real result, not a failure', async () => {
    mockCall.mockResolvedValue({ students: [] });
    expect(await loadTeacherStudents()).toEqual({ students: [], stale: false });
  });
});

describe('savedAgo', () => {
  const now = new Date('2026-10-31T12:00:00Z');
  it('formats minutes, hours and days', () => {
    expect(savedAgo('2026-10-31T11:59:40Z', now)).toBe('just now');
    expect(savedAgo('2026-10-31T11:15:00Z', now)).toBe('45 min ago');
    expect(savedAgo('2026-10-31T07:00:00Z', now)).toBe('5h ago');
    expect(savedAgo('2026-10-28T12:00:00Z', now)).toBe('3d ago');
    expect(savedAgo(undefined, now)).toBe('earlier');
  });
});
