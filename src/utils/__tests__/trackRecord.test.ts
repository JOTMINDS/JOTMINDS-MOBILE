import { buildTrackRecord } from '../trackRecord';

const row = (o: any) => ({ id: o.at, source: 'server' as const, label: 'Learning', headline: '', ...o });

describe('buildTrackRecord', () => {
  it('orders newest first', () => {
    const r = buildTrackRecord([row({ at: '2026-01-01' }), row({ at: '2026-03-01', label: 'B' }), row({ at: '2026-02-01', label: 'C' })]);
    expect(r.map((x) => x.at)).toEqual(['2026-03-01', '2026-02-01', '2026-01-01']);
  });
  it('flags a changed primary style versus the previous attempt of the same assessment', () => {
    const r = buildTrackRecord([
      row({ at: '2026-01-01', headline: 'Diverging' }),
      row({ at: '2026-04-01', headline: 'Converging' }),
    ]);
    expect(r[0].isRetake).toBe(true);
    expect(r[0].changes).toEqual([{ dimension: 'Primary style', from: 'Diverging', to: 'Converging' }]);
    expect(r[1].isRetake).toBe(false);
    expect(r[1].changes).toEqual([]);
  });
  it('reports a retake with no change', () => {
    const r = buildTrackRecord([row({ at: '2026-01-01', headline: 'X' }), row({ at: '2026-02-01', headline: 'X' })]);
    expect(r[0].isRetake).toBe(true);
    expect(r[0].changes).toEqual([]);
  });
  it('compares professional attempts per dimension', () => {
    const p = (at: string, styles: any) => ({ id: at, source: 'professional' as const, at, label: 'Prof', headline: 'h', styles });
    const r = buildTrackRecord([
      p('2026-01-01', { Learning: 'A', Thinking: 'B', 'Decision-making': 'C' }),
      p('2026-05-01', { Learning: 'A', Thinking: 'Z', 'Decision-making': 'C' }),
    ]);
    expect(r[0].changes).toEqual([{ dimension: 'Thinking', from: 'B', to: 'Z' }]);
  });
  it('does not compare different assessments with each other', () => {
    const r = buildTrackRecord([row({ at: '2026-01-01', label: 'Learning', headline: 'A' }), row({ at: '2026-02-01', label: 'Thinking', headline: 'B' })]);
    expect(r.every((x) => !x.isRetake)).toBe(true);
  });
  it('tolerates missing dates and empty input', () => {
    expect(buildTrackRecord([])).toEqual([]);
    expect(buildTrackRecord([row({ at: '' })])).toHaveLength(1);
  });
});
