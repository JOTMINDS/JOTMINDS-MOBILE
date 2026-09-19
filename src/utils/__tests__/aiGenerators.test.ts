const mockCallEdgeFn = jest.fn();
const mockStore: Record<string, string> = {};

jest.mock('../supabase', () => ({ callEdgeFn: (...a: any[]) => mockCallEdgeFn(...a) }));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: async (k: string) => mockStore[k] ?? null,
  setItem: async (k: string, v: string) => { mockStore[k] = v; },
  removeItem: async (k: string) => { delete mockStore[k]; },
}));

import {
  extractJson, hashKey, aiJson, generateExecutiveSummary, generateStudentRecommendations,
  generateClassroomOverview, generateIntervention, generateDailyDiscovery, generateParentSupportTips,
  professionalFallback, generateProfessionalInsights,
} from '../aiGenerators';

beforeEach(() => {
  mockCallEdgeFn.mockReset();
  Object.keys(mockStore).forEach((k) => delete mockStore[k]);
});

describe('extractJson', () => {
  it('parses bare, fenced and prose-wrapped JSON', () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
    expect(extractJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
    expect(extractJson('Sure! Here you go: {"a":{"b":2}} hope that helps')).toEqual({ a: { b: 2 } });
  });
  it('returns null for junk', () => {
    expect(extractJson('no json here')).toBeNull();
    expect(extractJson('{broken')).toBeNull();
    expect(extractJson(undefined)).toBeNull();
  });
});

describe('hashKey', () => {
  it('is stable and input-sensitive', () => {
    expect(hashKey({ a: 1 })).toBe(hashKey({ a: 1 }));
    expect(hashKey({ a: 1 })).not.toBe(hashKey({ a: 2 }));
  });
});

describe('aiJson', () => {
  it('asks the server for JSON with a token budget and validates the result', async () => {
    mockCallEdgeFn.mockResolvedValue({ reply: '{"ok":true}' });
    const out = await aiJson({ system: 's', user: 'u', maxTokens: 300, validate: (x) => x.ok === true });
    expect(out).toEqual({ ok: true });
    const [endpoint, init] = mockCallEdgeFn.mock.calls[0];
    expect(endpoint).toBe('/ai/chat');
    const body = JSON.parse(init.body);
    expect(body.json).toBe(true);
    expect(body.maxTokens).toBe(300);
    expect(body.messages[0]).toEqual({ role: 'system', content: 's' });
  });
  it('returns null on validation failure or transport error', async () => {
    mockCallEdgeFn.mockResolvedValueOnce({ reply: '{"ok":false}' });
    expect(await aiJson({ system: 's', user: 'u', validate: (x) => x.ok })).toBeNull();
    mockCallEdgeFn.mockRejectedValueOnce(new Error('offline'));
    expect(await aiJson({ system: 's', user: 'u', validate: () => true })).toBeNull();
  });
});

describe('generators with local fallback', () => {
  const profile = { name: 'Ama', learning: 'Diverging', thinking: 'Analytical', decision: 'Intuitive' };

  it('uses the model output and caches it', async () => {
    mockCallEdgeFn.mockResolvedValue({ reply: JSON.stringify({ narrativeSummary: 'n', keyTakeaway: 'k', personalizedMantra: 'm' }) });
    const first = await generateExecutiveSummary(profile);
    expect(first).toEqual({ ai: true, data: { narrativeSummary: 'n', keyTakeaway: 'k', personalizedMantra: 'm' } });
    const again = await generateExecutiveSummary(profile);
    expect(again.ai).toBe(true);
    expect(mockCallEdgeFn).toHaveBeenCalledTimes(1); // second read came from cache
  });

  it('falls back deterministically when the AI is unavailable, without caching the fallback', async () => {
    mockCallEdgeFn.mockRejectedValue(new Error('offline'));
    const r = await generateExecutiveSummary(profile);
    expect(r.ai).toBe(false);
    expect(r.data.narrativeSummary).toContain('Ama');
    expect(Object.keys(mockStore)).toHaveLength(0);
  });

  it('student recommendations: 6 normalised items, bad categories coerced', async () => {
    mockCallEdgeFn.mockResolvedValue({ reply: JSON.stringify({ recommendations: [
      { category: 'exam', title: 'T1', description: 'D1', tag: 'x' },
      { category: 'weird', title: 'T2', description: 'D2', tag: 'y' },
      { category: 'career', title: 'T3', description: 'D3', tag: 'z' },
    ] }) });
    const r = await generateStudentRecommendations({ learningStyle: 'a', thinkingStyle: 'b', decisionStyle: 'c' });
    expect(r.ai).toBe(true);
    expect(r.data.map((x) => x.category)).toEqual(['exam', 'learning', 'career']);
    expect(r.data.map((x) => x.id)).toEqual([1, 2, 3]);
  });

  it('student recommendations: fallback has 6 items covering learning/exam/career', async () => {
    mockCallEdgeFn.mockRejectedValue(new Error('x'));
    const r = await generateStudentRecommendations({ learningStyle: 'a', thinkingStyle: 'b', decisionStyle: 'c' });
    expect(r.ai).toBe(false);
    expect(r.data).toHaveLength(6);
    expect(new Set(r.data.map((x) => x.category))).toEqual(new Set(['learning', 'exam', 'career']));
  });

  it('classroom overview requires the two core insights', async () => {
    mockCallEdgeFn.mockResolvedValue({ reply: '{"learningInsight":"only one"}' });
    const r = await generateClassroomOverview({ className: 'JHS 1', studentCount: 30, dominantLearning: 'Diverging', dominantThinking: 'Creative' });
    expect(r.ai).toBe(false);
  });

  it('intervention priority always follows the risk level, whatever the model says', async () => {
    mockCallEdgeFn.mockResolvedValue({ reply: JSON.stringify({ priority: 'optional', focus: 'f', suggestions: ['a', 'b', 'c'] }) });
    const r = await generateIntervention({ studentName: 'Kofi', riskLevel: 'high', strengths: [], gaps: ['fractions'], dominantStyle: 'visual' });
    expect(r.ai).toBe(true);
    expect(r.data.priority).toBe('urgent');
  });

  it('professional insights keep fallback fields the model omitted', async () => {
    mockCallEdgeFn.mockResolvedValue({ reply: JSON.stringify({ strengths: ['s'], recommendations: ['r'], idealRoles: ['role'] }) });
    const r = await generateProfessionalInsights(profile);
    expect(r.ai).toBe(true);
    expect(r.data.developmentAreas).toEqual(professionalFallback(profile).developmentAreas);
    expect(r.data.leadershipInsight).toBeTruthy();
  });
});

describe('null-on-failure generators', () => {
  it('daily discovery rejects malformed multiple-choice data', async () => {
    mockCallEdgeFn.mockResolvedValue({ reply: JSON.stringify({ title: 't', fact: 'f', options: ['a', 'b'], correctAnswerIndex: 0 }) });
    expect(await generateDailyDiscovery('Neuro', '2026-09-19')).toBeNull();
  });
  it('daily discovery is cached per day', async () => {
    const good = { title: 't', fact: 'f', challengeQuestion: 'q', options: ['a', 'b', 'c', 'd'], correctAnswerIndex: 2, explanation: 'e' };
    mockCallEdgeFn.mockResolvedValue({ reply: JSON.stringify(good) });
    expect(await generateDailyDiscovery('Neuro', '2026-09-19')).toEqual(good);
    await generateDailyDiscovery('Neuro', '2026-09-19');
    expect(mockCallEdgeFn).toHaveBeenCalledTimes(1);
    await generateDailyDiscovery('Neuro', '2026-09-20');
    expect(mockCallEdgeFn).toHaveBeenCalledTimes(2);
  });
  it('parent tips are capped at 4 strings', async () => {
    mockCallEdgeFn.mockResolvedValue({ reply: JSON.stringify({ tips: ['1', '2', '3', '4', '5', 6] }) });
    expect(await generateParentSupportTips({ x: 1 })).toEqual(['1', '2', '3', '4']);
  });
  it('parent tips return null when the AI fails', async () => {
    mockCallEdgeFn.mockRejectedValue(new Error('x'));
    expect(await generateParentSupportTips({ y: 1 })).toBeNull();
  });
});

describe('lesson tools', () => {
  const { normalizeSuite, generateLessonAssessmentSuite, generateCurriculumTopics, generateReflectionFeedback, generateDifferentiatedInstruction } =
    require('../aiGenerators');

  it('normalizeSuite drops broken items and rejects an empty suite', () => {
    const suite = normalizeSuite({
      mcqs: [{ question: 'Q1', options: ['a', 'b'], correctAnswer: 'a' }, { question: 'no options', options: ['only'] }, { nope: 1 }],
      shortAnswer: [{ question: 'S1' }],
    }, 'Photosynthesis');
    expect(suite.title).toBe('Photosynthesis Assessment Suite');
    expect(suite.mcqs).toHaveLength(1);
    expect(suite.mcqs[0].id).toBe('m1');
    expect(suite.shortAnswer).toHaveLength(1);
    expect(normalizeSuite({ mcqs: [{ question: 'x', options: ['a'] }] }, 't')).toBeNull();
    expect(normalizeSuite(null, 't')).toBeNull();
  });

  it('assessment suite is cached after the first generation', async () => {
    mockCallEdgeFn.mockResolvedValue({ reply: JSON.stringify({ title: 'T', mcqs: [{ question: 'Q', options: ['a', 'b', 'c', 'd'], correctAnswer: 'a' }] }) });
    const a = await generateLessonAssessmentSuite({ subject: 'Sci', topic: 'Cells', gradeClass: 'JHS 1' });
    const b = await generateLessonAssessmentSuite({ subject: 'Sci', topic: 'Cells', gradeClass: 'JHS 1' });
    expect(a.mcqs).toHaveLength(1);
    expect(b).toEqual(a);
    expect(mockCallEdgeFn).toHaveBeenCalledTimes(1);
  });

  it('curriculum topics clamp hours and skip untitled entries', async () => {
    mockCallEdgeFn.mockResolvedValue({ reply: JSON.stringify({ topics: [{ title: ' Intro ', estimatedHours: 9 }, { title: '', estimatedHours: 1 }, { title: 'Next', estimatedHours: 0 }] }) });
    expect(await generateCurriculumTopics({ subject: 's', grade: 'g', curriculum: 'c', mainTopic: 'm' })).toEqual([
      { title: 'Intro', estimatedHours: 3 }, { title: 'Next', estimatedHours: 1 },
    ]);
  });

  it('differentiation ideas require group + strategy on every item', async () => {
    mockCallEdgeFn.mockResolvedValue({ reply: JSON.stringify({ strategies: [{ group: 'g' }] }) });
    expect(await generateDifferentiatedInstruction({ subject: 's', topic: 't', gradeClass: 'c' })).toBeNull();
  });

  it('reflection feedback needs all three parts and works for teachers', async () => {
    mockCallEdgeFn.mockResolvedValue({ reply: JSON.stringify({ encouragement: 'e', insight: 'i', actionableStep: 'a' }) });
    expect(await generateReflectionFeedback('The lesson ran long', { audience: 'teacher' })).toEqual({ encouragement: 'e', insight: 'i', actionableStep: 'a' });
    const sent = JSON.parse(mockCallEdgeFn.mock.calls[0][1].body);
    expect(sent.messages[0].content).toMatch(/instructional coach/);
    mockCallEdgeFn.mockResolvedValue({ reply: '{"encouragement":"only"}' });
    expect(await generateReflectionFeedback('x', { audience: 'student' })).toBeNull();
  });
});

describe('educational resources', () => {
  const { generateEducationalResources } = require('../aiGenerators');
  it('normalises types, drops untitled items and caps at 4', async () => {
    mockCallEdgeFn.mockResolvedValue({ reply: JSON.stringify({ resources: [
      { title: 'A', description: 'd', type: 'video', relevance: 'r' },
      { title: 'B', description: 'd', type: 'podcast' },
      { title: '', description: 'd' },
      { title: 'C', description: 'd' }, { title: 'D', description: 'd' }, { title: 'E', description: 'd' },
    ] }) });
    const r = await generateEducationalResources({ learningStyle: 'x', userType: 'parent' });
    expect(r.map((x: any) => x.title)).toEqual(['A', 'B', 'C', 'D']);
    expect(r[1].type).toBe('guide');
    expect(r[0].relevance).toBe('r');
  });
  it('returns null when nothing usable comes back', async () => {
    mockCallEdgeFn.mockResolvedValue({ reply: JSON.stringify({ resources: [{ description: 'no title' }] }) });
    expect(await generateEducationalResources({ userType: 'teacher' })).toBeNull();
  });
});
