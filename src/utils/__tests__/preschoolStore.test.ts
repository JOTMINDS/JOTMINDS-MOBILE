jest.mock('@react-native-async-storage/async-storage', () => ({ getItem: jest.fn(), setItem: jest.fn() }));
import { createLocalStore, buildEvidenceEvent, PRESCHOOL_EVENTS_KEY, KeyValueStorage } from '../preschoolStore';
import { MASTER_PRESCHOOL_INDICATORS } from '../../data/preschoolIndicators';

const memory = (): KeyValueStorage & { data: Record<string, string> } => {
  const data: Record<string, string> = {};
  return { data, getItem: async (k) => data[k] ?? null, setItem: async (k, v) => { data[k] = v; } };
};
const ind = MASTER_PRESCHOOL_INDICATORS[0];
const mk = (over: any = {}) => buildEvidenceEvent({
  child: { id: 'c1', name: 'Kofi', classId: 'k1' }, indicator: ind, rating: 3, method: 'OBS',
  observer: { id: 't1', name: 'Ms Ama' }, ...over,
});

describe('preschoolStore', () => {
  it('starts empty (no seeded demo data)', async () => {
    expect(await createLocalStore(memory()).list()).toEqual([]);
  });
  it('saves newest first and upserts by id', async () => {
    const s = createLocalStore(memory());
    const a = mk(); const b = mk();
    await s.save(a); await s.save(b);
    expect((await s.list()).map((e) => e.id)).toEqual([b.id, a.id]);
    await s.save({ ...a, rating: 1 });
    const all = await s.list();
    expect(all).toHaveLength(2);
    expect(all.find((e) => e.id === a.id)!.rating).toBe(1);
  });
  it('removes events', async () => {
    const s = createLocalStore(memory());
    const a = mk(); await s.save(a); await s.remove(a.id);
    expect(await s.list()).toEqual([]);
  });
  it('recovers from corrupt storage', async () => {
    const m = memory(); m.data[PRESCHOOL_EVENTS_KEY] = '{not json';
    expect(await createLocalStore(m).list()).toEqual([]);
  });
});

describe('buildEvidenceEvent', () => {
  it('fills identity, indicator and date fields', () => {
    const e = mk({ now: new Date('2026-10-02T10:00:00Z'), notes: '  counted to six  ', language: 'Twi' });
    expect(e).toMatchObject({
      childId: 'c1', indicatorId: ind.id, domainCode: ind.domainCode, date: '2026-10-02',
      observerRole: 'teacher', notes: 'counted to six', languageOfEvidence: 'Twi', classId: 'k1',
    });
  });
  it('omits empty optional fields', () => {
    const e = mk({ notes: '   ', child: { id: 'c2', name: 'Ama' } });
    expect('notes' in e).toBe(false);
    expect('classId' in e).toBe(false);
  });
});
