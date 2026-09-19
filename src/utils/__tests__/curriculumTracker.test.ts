jest.mock('@react-native-async-storage/async-storage', () => ({ getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() }));
import { progressPercent, nextStatus, newTracker, TrackerTopic } from '../curriculumTracker';

const t = (status: TrackerTopic['status'], h: number): TrackerTopic => ({ id: 'x', title: 'x', status, estimatedHours: h });

describe('curriculum tracker', () => {
  it('cycles status outstanding → in progress → done → outstanding', () => {
    expect(nextStatus('outstanding')).toBe('in_progress');
    expect(nextStatus('in_progress')).toBe('done');
    expect(nextStatus('done')).toBe('outstanding');
  });
  it('weights progress by hours; in-progress counts half', () => {
    expect(progressPercent([])).toBe(0);
    expect(progressPercent([t('done', 2), t('outstanding', 2)])).toBe(50);
    expect(progressPercent([t('done', 1), t('in_progress', 2), t('outstanding', 1)])).toBe(50);
    expect(progressPercent([t('done', 3), t('done', 1)])).toBe(100);
  });
  it('builds a tracker with sequential topic ids, all outstanding', () => {
    const tr = newTracker({ subject: 'Sci', grade: 'JHS 1', curriculum: 'NaCCA', mainTopic: 'Cells' }, [
      { title: 'A', estimatedHours: 1 }, { title: 'B', estimatedHours: 2 },
    ], new Date('2026-09-19T10:00:00Z'));
    expect(tr.topics.map((x) => [x.id, x.status])).toEqual([['t1', 'outstanding'], ['t2', 'outstanding']]);
    expect(tr.createdAt).toBe('2026-09-19T10:00:00.000Z');
  });
});
