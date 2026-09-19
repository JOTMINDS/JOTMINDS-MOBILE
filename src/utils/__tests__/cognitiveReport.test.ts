import { buildCognitiveReport, reportTips, reportText } from '../cognitiveReport';

// nested wire shape both clients write: { kolb: { style, scores } } with raw per-dimension sums
const kolb = (style: string) => ({ kolb: { style, scores: { CE: 10, RO: 12, AC: 8, AE: 6 } } });
const stern = (style: string) => ({ sternberg: { style, scores: { analytical: 20, creative: 15, practical: 10 } } });
const dual = (style: string) => ({ dualProcess: { style, scores: { system1: 18, system2: 22 } } });

const all = [
  { assessmentType: 'learning', results: kolb('Diverging'), completedAt: '2026-05-01T00:00:00Z' },
  { assessmentType: 'thinking', results: stern('Analytical'), completedAt: '2026-06-01T00:00:00Z' },
  { assessmentType: 'decision', results: dual('Reflective'), completedAt: '2026-07-01T00:00:00Z' },
];

describe('buildCognitiveReport', () => {
  it('is complete with all three and exposes styles, descriptions and the latest date', () => {
    const r = buildCognitiveReport(all);
    expect(r.complete).toBe(true);
    expect(r.missing).toEqual([]);
    expect(r.domains.learning?.style).toBe('Diverging');
    expect(r.domains.thinking?.style).toBe('Analytical');
    expect(r.domains.decision?.style).toBe('Reflective');
    expect(r.domains.learning?.description).toMatch(/multiple perspectives/);
    expect(r.latestAt).toBe('2026-07-01T00:00:00Z');
    expect(r.mapping?.careerSuggestions.length).toBeGreaterThan(0);
  });

  it('lists what is missing and produces no career mapping when incomplete', () => {
    const r = buildCognitiveReport(all.slice(0, 2));
    expect(r.complete).toBe(false);
    expect(r.missing).toEqual(['decision']);
    expect(r.mapping).toBeNull();
    expect(r.domains.decision).toBeUndefined();
  });

  it('accepts the webapp assessment names (kolb / sternberg / dual-process) and level-specific thinking', () => {
    const r = buildCognitiveReport([
      { assessmentType: 'kolb', results: kolb('Converging') },
      { assessmentType: 'jhs-thinking', results: stern('Creative') },
      { assessmentType: 'dual-process', results: dual('Intuitive') },
    ]);
    expect(r.complete).toBe(true);
    expect(r.domains.learning?.style).toBe('Converging');
  });

  it('uses the newest attempt when a domain was taken more than once', () => {
    const r = buildCognitiveReport([
      { assessmentType: 'learning', results: kolb('Diverging'), completedAt: '2026-01-01T00:00:00Z' },
      { assessmentType: 'learning', results: kolb('Accommodating'), completedAt: '2026-08-01T00:00:00Z' },
      ...all.slice(1),
    ]);
    expect(r.domains.learning?.style).toBe('Accommodating');
  });

  it('ignores rows without usable results and handles empty input', () => {
    expect(buildCognitiveReport([]).complete).toBe(false);
    expect(buildCognitiveReport([{ assessmentType: 'learning' }]).missing).toHaveLength(3);
    expect(buildCognitiveReport(undefined).complete).toBe(false);
  });
});

describe('reportTips', () => {
  it('gives three tips tailored to each style', () => {
    const tips = reportTips({ learning: 'Diverging', thinking: 'Creative', decision: 'Intuitive' });
    expect(tips).toHaveLength(3);
    expect(tips[0].body).toMatch(/Diverging/);
    expect(tips[0].body).toMatch(/observe and reflect quietly/);
    expect(tips[1].body).toMatch(/innovative ideas/);
    expect(tips[2].body).toMatch(/double-check important decisions/);
  });
  it('falls back sensibly for other styles', () => {
    const tips = reportTips({ learning: 'Accommodating', thinking: 'Practical', decision: 'Reflective' });
    expect(tips[0].body).toMatch(/engage actively/);
    expect(tips[1].body).toMatch(/real-world/);
    expect(tips[2].body).toMatch(/quicker decisions/);
  });
});

describe('reportText', () => {
  it('is null until the profile is complete', () => {
    expect(reportText(buildCognitiveReport(all.slice(0, 1)), { name: 'Ama' })).toBeNull();
  });
  it('names the person and all three styles', () => {
    const text = reportText(buildCognitiveReport(all), { name: 'Ama Mensah' })!;
    expect(text).toContain('Ama Mensah');
    expect(text).toContain('Learning style: Diverging');
    expect(text).toContain('Decision style: Reflective');
    expect(text).toContain('jotminds.com');
  });
});
