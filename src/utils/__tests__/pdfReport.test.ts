const mockPrint = jest.fn();
const mockShare = jest.fn();
const mockAvailable = jest.fn();
jest.mock('expo-print', () => ({ printToFileAsync: (...a: any[]) => mockPrint(...a) }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: () => mockAvailable(), shareAsync: (...a: any[]) => mockShare(...a) }));
jest.mock('../supabase', () => ({ callEdgeFn: jest.fn() }));
jest.mock('@react-native-async-storage/async-storage', () => ({ getItem: async () => null, setItem: async () => {}, removeItem: async () => {} }));

import { esc, buildCognitiveReportHtml, buildProfessionalReportHtml, exportPdf } from '../pdfReport';
import { buildCognitiveReport } from '../cognitiveReport';
import { calculateProfessionalCognitiveProfile } from '../professionalCognitiveScoring';

const kolb = { kolb: { style: 'Diverging', scores: { CE: 10, RO: 12 } } };
const stern = { sternberg: { style: 'Analytical', scores: { analytical: 20 } } };
const dual = { dualProcess: { style: 'Reflective', scores: { system2: 22 } } };
const complete = buildCognitiveReport([
  { assessmentType: 'learning', results: kolb, completedAt: '2026-05-01T00:00:00Z' },
  { assessmentType: 'thinking', results: stern, completedAt: '2026-06-01T00:00:00Z' },
  { assessmentType: 'decision', results: dual, completedAt: '2026-07-01T00:00:00Z' },
]);

beforeEach(() => { mockPrint.mockReset(); mockShare.mockReset(); mockAvailable.mockReset(); });

describe('esc', () => {
  it('escapes HTML metacharacters and tolerates null', () => {
    expect(esc('<script>alert("x")</script> & \'y\'')).toBe('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;y&#39;');
    expect(esc(null)).toBe('');
    expect(esc(undefined)).toBe('');
  });
});

describe('buildCognitiveReportHtml', () => {
  it('contains the three styles, descriptions, dimension bars, tips and career fit', () => {
    const html = buildCognitiveReportHtml({ report: complete, who: { name: 'Ama Mensah', position: 'Analyst' } });
    ['Diverging', 'Analytical', 'Reflective', 'Ama Mensah', 'Analyst', 'Dimension scores', 'Putting your profile to work', 'Career &amp; programme fit', 'CAREERS TO EXPLORE']
      .forEach((s) => expect(html).toContain(s));
    expect(html).toContain('Optimise your study or work environment');
    expect(html).toMatch(/width:\d+%/);
    expect(html).toContain('Concrete Experience');
    expect(html).not.toMatch(/class="name">CE</);
    expect(html).toContain('break-after: avoid');
  });
  it('never lets untrusted text become markup (names and AI text)', () => {
    const html = buildCognitiveReportHtml({
      report: complete,
      who: { name: '<img src=x onerror=alert(1)>' },
      summary: { ai: true, data: { narrativeSummary: '<script>steal()</script>', keyTakeaway: '"><b>', personalizedMantra: '</i>' } },
      combined: { ai: true, data: { strengths: ['<b>s</b>'], growthAreas: [], recommendations: [] } },
    });
    expect(html).not.toContain('<img src=x');
    expect(html).not.toContain('<script>steal');
    expect(html).not.toContain('<b>s</b>');
    expect(html).toContain('&lt;script&gt;steal()&lt;/script&gt;');
  });
  it('labels AI content as AI and fallback content as standard', () => {
    const data = { narrativeSummary: 'n', keyTakeaway: 'k', personalizedMantra: 'm' };
    expect(buildCognitiveReportHtml({ report: complete, who: {}, summary: { ai: true, data } })).toContain('AI-generated');
    const fb = buildCognitiveReportHtml({ report: complete, who: {}, summary: { ai: false, data } });
    expect(fb).toContain('Standard summary.');
    expect(fb).not.toContain('AI-generated');
  });
  it('omits the AI sections when there is no AI content and handles an incomplete report', () => {
    const html = buildCognitiveReportHtml({ report: complete, who: {} });
    expect(html).not.toContain('Combined insights');
    const partial = buildCognitiveReport([{ assessmentType: 'learning', results: kolb }]);
    const h2 = buildCognitiveReportHtml({ report: partial, who: {} });
    expect(h2).toContain('Diverging');
    expect(h2).not.toContain('Putting your profile to work');
  });
  it('carries the not-a-clinical-assessment disclaimer', () => {
    expect(buildCognitiveReportHtml({ report: complete, who: {} })).toContain('not a clinical assessment');
  });
});

describe('buildProfessionalReportHtml', () => {
  const entry = {
    id: 'pc_1', at: '2026-09-19T10:00:00Z', responses: { learning: [], thinking: [], decisionMaking: [] },
    profile: calculateProfessionalCognitiveProfile({ learning: [4, 4, 4, 4, 4, 4], thinking: [4, 4, 4, 4, 4, 4], decisionMaking: [4, 4, 4, 4, 4, 4], motivation: [4, 4, 4, 4] }),
  };
  it('includes person, position, organisation, every dimension and the overall profile', () => {
    const html = buildProfessionalReportHtml({ entry, who: { name: 'Kofi', position: 'Manager', organization: 'Acme' } });
    ['Kofi', 'Manager', 'Acme', 'LEARNING', 'THINKING', 'DECISION-MAKING', 'MOTIVATION', entry.profile.overallProfile].forEach((s) => expect(html).toContain(s));
  });
  it('escapes and labels professional insights', () => {
    const html = buildProfessionalReportHtml({
      entry, who: {}, insights: { ai: true, data: { strengths: ['<i>x</i>'], developmentAreas: [], recommendations: [], idealRoles: ['Lead'], leadershipInsight: '<u>y</u>' } },
    });
    expect(html).not.toContain('<i>x</i>');
    expect(html).toContain('Ideal roles');
    expect(html).toContain('AI-generated');
  });
});

describe('exportPdf', () => {
  it('renders the HTML to a file and opens the share sheet with a PDF type', async () => {
    mockAvailable.mockResolvedValue(true);
    mockPrint.mockResolvedValue({ uri: 'file:///cache/report.pdf' });
    mockShare.mockResolvedValue(undefined);
    expect(await exportPdf('<html/>', 'My report')).toEqual({ ok: true });
    expect(mockPrint).toHaveBeenCalledWith({ html: '<html/>' });
    expect(mockShare).toHaveBeenCalledWith('file:///cache/report.pdf', expect.objectContaining({ mimeType: 'application/pdf', dialogTitle: 'My report' }));
  });
  it('reports (not throws) when sharing is unavailable or printing fails', async () => {
    mockAvailable.mockResolvedValue(false);
    expect(await exportPdf('<html/>', 't')).toMatchObject({ ok: false });
    expect(mockPrint).not.toHaveBeenCalled();
    mockAvailable.mockResolvedValue(true);
    mockPrint.mockRejectedValue(new Error('print failed'));
    expect(await exportPdf('<html/>', 't')).toEqual({ ok: false, error: 'print failed' });
  });
});
