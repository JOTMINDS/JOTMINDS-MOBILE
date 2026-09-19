import AsyncStorage from '@react-native-async-storage/async-storage';
import { callEdgeFn } from './supabase';

/**
 * AI-generated reports and insights, ported from the webapp's aiService.ts.
 *
 * The webapp calls OpenAI through a Cloudflare Pages proxy that only exists on
 * the web. Mobile goes through the shared edge function's `POST /ai/chat`
 * (server-side key), asking for JSON output. Prompts and result shapes match
 * the webapp so a profile reads the same on both.
 *
 * Every generator is total: it never throws. Those with an on-device fallback
 * (as in the webapp) return `{ data, ai }` where `ai` says whether the text was
 * model-written or the deterministic fallback; the others return null on
 * failure so the UI can simply hide the card.
 */

const AI_TIMEOUT = 40000;
const CACHE_PREFIX = 'jotminds.ai.v1.';
const CACHE_TTL_MS = 14 * 24 * 60 * 60 * 1000;

export interface AIResult<T> { data: T; ai: boolean }

// ── helpers ──────────────────────────────────────────────────────────────────

/** Pulls the first JSON object out of a model reply (tolerates prose/```json fences). */
export function extractJson(text: unknown): any | null {
  if (typeof text !== 'string') return null;
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

/** Small stable hash so long inputs make short, safe cache keys. */
export function hashKey(input: unknown): string {
  const s = typeof input === 'string' ? input : JSON.stringify(input);
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { at, v } = JSON.parse(raw) as { at: number; v: T };
    return Date.now() - at < CACHE_TTL_MS ? v : null;
  } catch {
    return null;
  }
}

export async function setCached<T>(key: string, v: T): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ at: Date.now(), v }));
  } catch {
    // best effort
  }
}

export async function clearCached(key: string): Promise<void> {
  try { await AsyncStorage.removeItem(CACHE_PREFIX + key); } catch { /* ignore */ }
}

/**
 * One structured generation. `maxTokens`/`json` are honoured by the updated
 * server route; an older deployment ignores them and the prose-tolerant
 * `extractJson` still recovers the object.
 */
export async function aiJson<T>(opts: {
  system: string;
  user: string;
  maxTokens?: number;
  validate: (x: any) => boolean;
}): Promise<T | null> {
  try {
    const res = await callEdgeFn('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [
          { role: 'system', content: opts.system },
          { role: 'user', content: `${opts.user}\n\nRespond with ONLY the JSON object, no other text.` },
        ],
        maxTokens: opts.maxTokens ?? 800,
        json: true,
      }),
    }, AI_TIMEOUT);
    const parsed = extractJson(res?.reply);
    return parsed && opts.validate(parsed) ? (parsed as T) : null;
  } catch {
    return null;
  }
}

/** cache → model → fallback, storing only model output. */
async function withFallback<T>(
  cacheKey: string,
  fallback: T,
  generate: () => Promise<T | null>,
  opts: { force?: boolean } = {},
): Promise<AIResult<T>> {
  if (!opts.force) {
    const cached = await getCached<T>(cacheKey);
    if (cached) return { data: cached, ai: true };
  }
  const fresh = await generate();
  if (fresh) {
    await setCached(cacheKey, fresh);
    return { data: fresh, ai: true };
  }
  return { data: fallback, ai: false };
}

const nonEmptyArray = (a: any) => Array.isArray(a) && a.length > 0;
const strings = (a: any): string[] => (Array.isArray(a) ? a.filter((x) => typeof x === 'string') : []);

// ── Executive summary ────────────────────────────────────────────────────────

export interface ExecutiveSummary { narrativeSummary: string; keyTakeaway: string; personalizedMantra: string }

export function executiveSummaryFallback(p: any): ExecutiveSummary {
  const name = p?.name || 'This person';
  const role = p?.position || p?.organization || 'learner and professional';
  const learning = p?.learning || 'Adaptive';
  const thinking = p?.thinking || 'Strategic';
  const decision = p?.decision || 'Balanced';
  return {
    narrativeSummary: `${name} shows a distinctive cognitive profile that combines ${learning} learning preferences with strong ${thinking} problem-solving. Approaching complex situations with a ${decision} mindset, they turn ideas into practical results as a ${role}.`,
    keyTakeaway: `Does their best work when given room to apply ${String(thinking).toLowerCase()} problem-solving in line with ${String(learning).toLowerCase()} learning.`,
    personalizedMantra: 'Turn insight into action through curious, purposeful practice.',
  };
}

export function generateExecutiveSummary(
  profile: { name?: string; position?: string; learning?: string; thinking?: string; decision?: string; [k: string]: any },
  opts?: { force?: boolean },
): Promise<AIResult<ExecutiveSummary>> {
  return withFallback(`exec_${hashKey(profile)}`, executiveSummaryFallback(profile), () => aiJson<ExecutiveSummary>({
    system: 'You are a master cognitive psychologist synthesising assessment results into professional narrative summaries. Vary your vocabulary so each summary feels unique.',
    user: `Generate a rich executive summary for this cognitive profile:\nProfile Data: ${JSON.stringify(profile)}\n\nJSON format:\n{\n  "narrativeSummary": "An inspiring 3-sentence summary of who they are cognitively and how they learn/work best",\n  "keyTakeaway": "Single most important insight for teachers/parents/managers",\n  "personalizedMantra": "A motivating 1-line quote tailored to their cognitive strengths"\n}`,
    maxTokens: 500,
    validate: (x) => !!(x.narrativeSummary && x.keyTakeaway && x.personalizedMantra),
  }), opts);
}

// ── Assessment insights ──────────────────────────────────────────────────────

export interface AssessmentInsights {
  strengths: string[]; weaknesses: string[]; improvements: string[];
  archetype: { name: string; tagline: string }; summary?: string;
}

/** Per-assessment personalised insights (POST /ai/generate-insights, cached). */
export async function generateAssessmentInsights(params: {
  scores: Record<string, any>; type?: string; role?: string; context?: Record<string, any>;
  algorithmicGuidance?: Record<string, any>;
}, opts?: { force?: boolean }): Promise<AssessmentInsights | null> {
  const key = `insights_${hashKey(params)}`;
  if (!opts?.force) {
    const cached = await getCached<AssessmentInsights>(key);
    if (cached) return cached;
  }
  try {
    const res = await callEdgeFn('/ai/generate-insights', { method: 'POST', body: JSON.stringify(params) }, AI_TIMEOUT);
    if (res && Array.isArray(res.strengths) && res.archetype) {
      await setCached(key, res);
      return res as AssessmentInsights;
    }
  } catch { /* fall through */ }
  return null;
}

// ── Combined (learning + thinking + decision) profile ────────────────────────

export interface CombinedInsights { strengths: string[]; growthAreas: string[]; recommendations: string[] }

export function combinedFallback(p: { kolbStyle?: string; sternbergStyle?: string }): CombinedInsights {
  return {
    strengths: [
      `Picks up ideas quickly using ${p.kolbStyle || 'experiential'} learning strategies.`,
      `Shows strong ${p.sternbergStyle || 'analytical'} thinking when working through complex problems.`,
      'Moves flexibly between intuitive and systematic decision-making.',
    ],
    growthAreas: [
      'Balance fast intuitive judgements with evidence checks when stakes are high.',
      'Build in reflection time between busy stretches of project work.',
    ],
    recommendations: [
      'Alternate reading and theory with hands-on practice to consolidate learning.',
      'Keep a short decision journal to calibrate your intuition against outcomes.',
      'Explain your reasoning to a peer — it exposes gaps and strengthens memory.',
    ],
  };
}

export function generateCombinedInsights(
  p: { userName?: string; kolbStyle?: string; sternbergStyle?: string; dualProcessStyle?: string; scores?: any },
  opts?: { force?: boolean },
): Promise<AIResult<CombinedInsights>> {
  return withFallback(`combined_${hashKey([p.kolbStyle, p.sternbergStyle, p.dualProcessStyle])}`, combinedFallback(p), () =>
    aiJson<CombinedInsights>({
      system: 'You are an elite educational neuroscientist and cognitive advisor. Give inspiring, non-generic, high-utility feedback.',
      user: `Synthesise a unified three-framework cognitive analysis:\nName: ${p.userName || 'Student'}\nLearning Style (Kolb): ${p.kolbStyle || 'Adaptive'}\nThinking Style (Sternberg): ${p.sternbergStyle || 'Analytical-Creative'}\nDecision-Making Style (Dual Process): ${p.dualProcessStyle || 'Balanced'}\nScores: ${JSON.stringify(p.scores || {})}\n\nJSON: {"strengths":["3 strengths grounded in the 3 styles"],"growthAreas":["2 constructive growth areas"],"recommendations":["3 practical, actionable recommendations"]}`,
      maxTokens: 600,
      validate: (x) => nonEmptyArray(x.strengths) && nonEmptyArray(x.recommendations),
    }), opts);
}

// ── Student recommendations ──────────────────────────────────────────────────

export interface StudentRecommendation {
  id: number; category: 'learning' | 'exam' | 'career'; title: string; description: string; tag: string;
}

export function studentRecommendationsFallback(p: { learningStyle: string; thinkingStyle: string; decisionStyle: string }): StudentRecommendation[] {
  return [
    { id: 1, category: 'learning', title: 'Active Concept Synthesis', tag: 'Study Strategy', description: `With your ${p.learningStyle} learning style, turn reading into visual mind maps or flowcharts to lock it in.` },
    { id: 2, category: 'exam', title: 'Timed Revision Sprints', tag: 'Exam Prep', description: `Use your ${p.thinkingStyle} thinking by practising problems in timed 25-minute sprints.` },
    { id: 3, category: 'learning', title: 'Peer Teaching', tag: 'Collaboration', description: 'Explain hard concepts to a study partner in your own words — it reveals gaps fast.' },
    { id: 4, category: 'exam', title: 'Reflective Decision Pause', tag: 'Exam Technique', description: `With a ${p.decisionStyle} decision style, re-read each question stem and eliminate two wrong options before choosing.` },
    { id: 5, category: 'career', title: 'Subject & Career Alignment', tag: 'Future Readiness', description: `${p.thinkingStyle} thinking plus ${p.learningStyle} learning suits technical and creative problem-solving fields.` },
    { id: 6, category: 'learning', title: 'Interleaved Practice', tag: 'Brain Efficiency', description: 'Switch between related subjects in one session to keep your thinking agile.' },
  ];
}

export function generateStudentRecommendations(
  p: { name?: string; learningStyle: string; thinkingStyle: string; decisionStyle: string; educationLevel?: string },
  opts?: { force?: boolean },
): Promise<AIResult<StudentRecommendation[]>> {
  return withFallback(`student_recs_${hashKey(p)}`, studentRecommendationsFallback(p), async () => {
    const out = await aiJson<{ recommendations: StudentRecommendation[] }>({
      system: 'You are an elite cognitive learning specialist for young minds. Give encouraging, non-repetitive, evidence-based study guidance.',
      user: `Generate 6 personalised, actionable study and exam-preparation recommendations for a student.\nName: ${p.name || 'Student'}\nEducation level: ${p.educationLevel || 'Not specified'}\nLearning style: ${p.learningStyle}\nThinking style: ${p.thinkingStyle}\nDecision style: ${p.decisionStyle}\n\nJSON: {"recommendations":[{"id":1,"category":"learning|exam|career","title":"...","description":"1-2 sentences","tag":"2-3 word label"}]} — include at least two "learning", two "exam" and one "career".`,
      maxTokens: 900,
      validate: (x) => Array.isArray(x.recommendations) && x.recommendations.length >= 3,
    });
    if (!out) return null;
    return out.recommendations.slice(0, 6).map((r, i) => ({
      id: i + 1,
      category: (['learning', 'exam', 'career'] as const).includes(r.category) ? r.category : 'learning',
      title: String(r.title ?? ''), description: String(r.description ?? ''), tag: String(r.tag ?? ''),
    })).filter((r) => r.title && r.description);
  }, opts);
}

// ── Professional profile ─────────────────────────────────────────────────────

export interface ProfessionalInsights {
  strengths: string[]; developmentAreas: string[]; recommendations: string[]; idealRoles: string[]; leadershipInsight: string;
}

export function professionalFallback(profile: any): ProfessionalInsights {
  const learning = String(profile?.learning?.style || profile?.learning || 'Analytical').toLowerCase();
  const thinking = String(profile?.thinking?.style || profile?.thinking || 'Creative-Analytical').toLowerCase();
  const decision = String(profile?.decisionMaking?.style || profile?.decision || 'Balanced').toLowerCase();
  return {
    strengths: [
      `Adapts quickly through a ${learning} approach`,
      `Makes sense of complexity with ${thinking} methods`,
      `Applies context-aware judgement through a ${decision} framework`,
    ],
    developmentAreas: [
      'Experiment across contrasting cognitive modes to widen your range',
      'Turn intuitive insights into repeatable working frameworks',
    ],
    recommendations: [
      'Pair with a contrasting thinker for high-stakes strategic reviews',
      'Document your decision patterns to refine your mental models over time',
    ],
    idealRoles: ['Strategic Operations Lead', 'Product & Innovation Manager', 'Organisational Development Consultant'],
    leadershipInsight: `Combining ${learning} learning and ${thinking} thinking with a ${decision} decision style supports strategic adaptability and clear, collaborative problem-solving across teams.`,
  };
}

export function generateProfessionalInsights(profile: any, opts?: { force?: boolean }): Promise<AIResult<ProfessionalInsights>> {
  return withFallback(`prof_${hashKey(profile)}`, professionalFallback(profile), async () => {
    const out = await aiJson<ProfessionalInsights>({
      system: 'You are an executive talent strategist and industrial psychologist. Give insightful, non-generic, high-caliber professional feedback.',
      user: `Analyse this professional's cognitive assessment profile and generate executive career insights:\nProfile: ${JSON.stringify(profile)}\n\nJSON: {"strengths":["3 strengths"],"developmentAreas":["2 areas"],"recommendations":["2 actionable recommendations"],"idealRoles":["4 high-impact roles"],"leadershipInsight":"2-3 sentence synthesis of how their cognitive balance drives leadership"}`,
      maxTokens: 800,
      validate: (x) => nonEmptyArray(x.strengths) && nonEmptyArray(x.recommendations) && nonEmptyArray(x.idealRoles),
    });
    if (!out) return null;
    const fb = professionalFallback(profile);
    return {
      strengths: strings(out.strengths), recommendations: strings(out.recommendations), idealRoles: strings(out.idealRoles),
      developmentAreas: nonEmptyArray(out.developmentAreas) ? strings(out.developmentAreas) : fb.developmentAreas,
      leadershipInsight: out.leadershipInsight || fb.leadershipInsight,
    };
  }, opts);
}

// ── Parent tips ──────────────────────────────────────────────────────────────

export async function generateParentSupportTips(data: any, opts?: { force?: boolean }): Promise<string[] | null> {
  const key = `parent_tips_${hashKey(data)}`;
  if (!opts?.force) { const c = await getCached<string[]>(key); if (c) return c; }
  const out = await aiJson<{ tips: string[] }>({
    system: 'You are an expert child psychologist and family learning advisor. Give creative, non-repeating tips for parents.',
    user: `Analyse this child's assessment profile and give 4 highly specific, actionable parenting tips for home life:\nProfile: ${JSON.stringify(data)}\n\nJSON: {"tips":["tip 1","tip 2","tip 3","tip 4"]}`,
    maxTokens: 500,
    validate: (x) => nonEmptyArray(x.tips),
  });
  const tips = out ? strings(out.tips).slice(0, 4) : [];
  if (tips.length === 0) return null;
  await setCached(key, tips);
  return tips;
}

// ── Study strategy / daily discovery / career insights ───────────────────────

export interface StudyStrategy { weeklyRoutine: string; techniques: { name: string; description: string; duration: string }[] }

export async function generateStudyStrategy(subject: string, learningStyle: string, examGoal?: string, opts?: { force?: boolean }): Promise<StudyStrategy | null> {
  const key = `study_${hashKey([subject, learningStyle, examGoal])}`;
  if (!opts?.force) { const c = await getCached<StudyStrategy>(key); if (c) return c; }
  const out = await aiJson<StudyStrategy>({
    system: 'You are an academic coach specialising in evidence-based study techniques (active recall, spaced repetition, the Feynman technique).',
    user: `Create a custom study strategy.\nSubject: ${subject}\nLearning style: ${learningStyle}\n${examGoal ? `Goal: ${examGoal}\n` : ''}\nJSON: {"weeklyRoutine":"overview of recommended study cadence","techniques":[{"name":"...","description":"how to apply it for ${subject}","duration":"e.g. 25 mins daily"}]} — give 3 techniques.`,
    maxTokens: 700,
    validate: (x) => typeof x.weeklyRoutine === 'string' && nonEmptyArray(x.techniques),
  });
  if (out) await setCached(key, out);
  return out;
}

export interface DailyDiscovery {
  title: string; fact: string; challengeQuestion: string; options: string[]; correctAnswerIndex: number; explanation: string;
}

/** One per calendar day per category, so it's a genuine "of the day". */
export async function generateDailyDiscovery(category = 'Neuroscience & Learning', day = new Date().toISOString().slice(0, 10)): Promise<DailyDiscovery | null> {
  const key = `discovery_${hashKey([category, day])}`;
  const cached = await getCached<DailyDiscovery>(key);
  if (cached) return cached;
  const out = await aiJson<DailyDiscovery>({
    system: 'You are a fun science communicator creating engaging daily learning snippets for young people.',
    user: `Generate a fascinating daily brain discovery and a challenge question in the category "${category}" (today is ${day}; make it different from typical examples).\n\nJSON: {"title":"catchy title","fact":"fascinating 2-sentence fact","challengeQuestion":"fun multiple-choice question testing the fact","options":["A","B","C","D"],"correctAnswerIndex":0,"explanation":"why the answer is correct"}`,
    maxTokens: 600,
    validate: (x) => Array.isArray(x.options) && x.options.length === 4 && Number.isInteger(x.correctAnswerIndex) && x.correctAnswerIndex >= 0 && x.correctAnswerIndex < 4 && !!x.title && !!x.fact,
  });
  if (out) await setCached(key, out);
  return out;
}

export interface CareerInsights { advice: string; careerMatches: { title: string; rationale: string; keySkills: string[] }[] }

export async function generateCareerInsights(archetype: string, strengths: string[], scores?: any, opts?: { force?: boolean }): Promise<CareerInsights | null> {
  const key = `career_${hashKey([archetype, strengths, scores])}`;
  if (!opts?.force) { const c = await getCached<CareerInsights>(key); if (c) return c; }
  const out = await aiJson<CareerInsights>({
    system: 'You are an AI career counsellor and educational psychologist specialising in cognitive talent matching. Ground suggestions in careers relevant to Ghana and West Africa as well as global options.',
    user: `Analyse this cognitive profile and give tailored career recommendations.\nArchetype: ${archetype}\nTop strengths: ${strengths.join(', ')}\n${scores ? `Scores: ${JSON.stringify(scores)}\n` : ''}\nJSON: {"advice":"encouraging 2-sentence overview of career direction","careerMatches":[{"title":"...","rationale":"why it fits their cognitive style","keySkills":["...","..."]}]} — give 3 careers.`,
    maxTokens: 800,
    validate: (x) => typeof x.advice === 'string' && nonEmptyArray(x.careerMatches),
  });
  if (out) await setCached(key, out);
  return out;
}

// ── Teacher: classroom overview, per-student strategies, intervention ────────

export interface ClassroomOverview { learningInsight: string; thinkingInsight: string; decisionInsight: string; synergySummary: string }

export function classroomOverviewFallback(p: { dominantLearning: string; dominantThinking: string }): ClassroomOverview {
  return {
    learningInsight: `With ${p.dominantLearning} learning dominating, balance visual models with hands-on peer problem-solving.`,
    thinkingInsight: `Lean into the class's ${p.dominantThinking} orientation with open inquiry challenges backed by clear success criteria.`,
    decisionInsight: 'Give students a short reflective pause before group presentations and tests.',
    synergySummary: 'A versatile cohort that thrives when theory is tied to real-world Ghanaian and global examples.',
  };
}

export function generateClassroomOverview(
  p: { className: string; studentCount: number; dominantLearning: string; dominantThinking: string; dominantDecision?: string },
  opts?: { force?: boolean },
): Promise<AIResult<ClassroomOverview>> {
  return withFallback(`class_${hashKey(p)}`, classroomOverviewFallback(p), () => aiJson<ClassroomOverview>({
    system: 'You are a master pedagogical coach helping teachers differentiate instruction in diverse classrooms.',
    user: `Generate tailored classroom strategies for a teacher.\nClass: ${p.className}\nStudents: ${p.studentCount}\nDominant learning style: ${p.dominantLearning}\nDominant thinking style: ${p.dominantThinking}\nDominant decision style: ${p.dominantDecision || 'Balanced'}\n\nJSON: {"learningInsight":"2-sentence practical instructional strategy","thinkingInsight":"2-sentence practical thinking exercise","decisionInsight":"2-sentence decision-making and test-taking technique","synergySummary":"1-sentence classroom synergy takeaway"}`,
    maxTokens: 500,
    validate: (x) => !!(x.learningInsight && x.thinkingInsight),
  }), opts);
}

export interface StudentTeachingStrategies {
  quickInsights: { icon: string; text: string }[]; teachingStrategies: string[];
  educationalResources: { type: string; title: string; description: string; whyHelps: string }[];
}

export async function generateTeachingStrategies(studentData: any, opts?: { force?: boolean }): Promise<StudentTeachingStrategies | null> {
  const key = `teach_${hashKey(studentData)}`;
  if (!opts?.force) { const c = await getCached<StudentTeachingStrategies>(key); if (c) return c; }
  const out = await aiJson<StudentTeachingStrategies>({
    system: 'You are an expert educational psychologist. Give unique, creative insights tailored to the exact student metrics; avoid generic phrases.',
    user: `Analyse this student's cognitive profile and generate tailored teaching strategies.\nStudent: ${JSON.stringify(studentData)}\n\nJSON: {"quickInsights":[{"icon":"🧠","text":"..."}] (3 items),"teachingStrategies":["3 specific, actionable strategies"],"educationalResources":[{"type":"Guide|Article|Video","title":"...","description":"...","whyHelps":"..."}] (3 items)}`,
    maxTokens: 800,
    validate: (x) => nonEmptyArray(x.teachingStrategies),
  });
  if (out) await setCached(key, out);
  return out;
}

export interface InterventionPlan { priority: 'urgent' | 'normal' | 'optional'; focus: string; suggestions: string[] }

export function interventionFallback(p: { riskLevel: string; strengths: string[]; gaps: string[]; dominantStyle: string }): InterventionPlan {
  return {
    priority: p.riskLevel === 'high' ? 'urgent' : p.riskLevel === 'medium' ? 'normal' : 'optional',
    focus: p.riskLevel === 'high' ? `Targeted support for ${p.gaps[0] || 'foundational skills'}` : `Extending ${p.strengths[0] || 'cognitive strengths'}`,
    suggestions: [
      `Use concrete, hands-on activities to ground challenging concepts in a ${p.dominantStyle} style`,
      `Pair with a supportive peer who is strong in ${p.strengths[0] || 'complementary areas'}`,
      'Use quick multi-modal check-ins to monitor understanding before tests',
    ],
  };
}

export function generateIntervention(
  p: { studentName: string; riskLevel: string; strengths: string[]; gaps: string[]; dominantStyle: string },
  opts?: { force?: boolean },
): Promise<AIResult<InterventionPlan>> {
  const fb = interventionFallback(p);
  return withFallback(`intervention_${hashKey(p)}`, fb, () => aiJson<InterventionPlan>({
    system: 'You are an educational intervention specialist. Give practical, highly specific classroom differentiation tips.',
    user: `Generate a 3-step targeted instructional intervention plan.\nStudent: ${p.studentName}\nRisk: ${p.riskLevel}\nStrengths: ${p.strengths.join(', ') || 'Emerging'}\nGaps: ${p.gaps.join(', ') || 'General support needed'}\nDominant learning style: ${p.dominantStyle}\n\nJSON: {"priority":"${fb.priority}","focus":"1-sentence goal","suggestions":["3 specific differentiated teaching actions"]}`,
    maxTokens: 400,
    validate: (x) => nonEmptyArray(x.suggestions) && typeof x.focus === 'string',
  }).then((o) => (o ? { ...o, priority: fb.priority } : null)), opts);
}

// ── Teacher: lesson tools ────────────────────────────────────────────────────

export interface AssessmentItem {
  id: string; type: 'mcq' | 'short_answer' | 'discussion' | 'practical' | 'homework';
  question: string; options?: string[]; correctAnswer?: string; explanation?: string;
}
export interface AssessmentSuite {
  title: string; mcqs: AssessmentItem[]; shortAnswer: AssessmentItem[]; discussion: AssessmentItem[];
  practicalExercises: AssessmentItem[]; homework: AssessmentItem[];
}

const asItems = (a: any, type: AssessmentItem['type'], prefix: string): AssessmentItem[] =>
  (Array.isArray(a) ? a : [])
    .filter((x) => x && typeof x.question === 'string' && x.question.trim())
    .map((x, i) => ({
      id: String(x.id ?? `${prefix}${i + 1}`), type, question: x.question,
      options: Array.isArray(x.options) ? x.options.map(String) : undefined,
      correctAnswer: x.correctAnswer != null ? String(x.correctAnswer) : undefined,
      explanation: x.explanation != null ? String(x.explanation) : undefined,
    }));

/** Normalises a model-produced suite; null when it has no usable items. */
export function normalizeSuite(raw: any, topic: string): AssessmentSuite | null {
  if (!raw || typeof raw !== 'object') return null;
  const suite: AssessmentSuite = {
    title: typeof raw.title === 'string' && raw.title ? raw.title : `${topic} Assessment Suite`,
    mcqs: asItems(raw.mcqs, 'mcq', 'm').filter((q) => (q.options?.length ?? 0) >= 2),
    shortAnswer: asItems(raw.shortAnswer, 'short_answer', 's'),
    discussion: asItems(raw.discussion, 'discussion', 'd'),
    practicalExercises: asItems(raw.practicalExercises, 'practical', 'p'),
    homework: asItems(raw.homework, 'homework', 'h'),
  };
  const n = suite.mcqs.length + suite.shortAnswer.length + suite.discussion.length + suite.practicalExercises.length + suite.homework.length;
  return n > 0 ? suite : null;
}

export async function generateLessonAssessmentSuite(
  p: { subject: string; topic: string; gradeClass: string }, opts?: { force?: boolean },
): Promise<AssessmentSuite | null> {
  const key = `suite_${hashKey(p)}`;
  if (!opts?.force) { const c = await getCached<AssessmentSuite>(key); if (c) return c; }
  const raw = await aiJson<any>({
    system: 'You are an expert assessment designer creating differentiated quizzes and homework aligned to the Ghanaian (NaCCA/GES) and international curricula.',
    user: `Generate a multi-format lesson assessment suite.\nSubject: ${p.subject}\nTopic: ${p.topic}\nGrade/Class: ${p.gradeClass || 'Not specified'}\n\nJSON: {"title":"...","mcqs":[{"id":"m1","question":"...","options":["A","B","C","D"],"correctAnswer":"A","explanation":"..."}] (4),"shortAnswer":[{"id":"s1","question":"...","correctAnswer":"model answer","explanation":"marking note"}] (2),"discussion":[{"id":"d1","question":"...","explanation":"facilitation guide"}] (1),"practicalExercises":[{"id":"p1","question":"...","explanation":"success criteria"}] (1),"homework":[{"id":"h1","question":"...","explanation":"target time"}] (1)}`,
    maxTokens: 1400,
    validate: (x) => !!normalizeSuite(x, p.topic),
  });
  const suite = raw ? normalizeSuite(raw, p.topic) : null;
  if (suite) await setCached(key, suite);
  return suite;
}

export interface DifferentiationIdeas {
  strategies: { group: string; strategy: string }[];
  tips?: string[];
}

export async function generateDifferentiatedInstruction(
  p: { subject: string; topic: string; gradeClass: string; classSummary?: any }, opts?: { force?: boolean },
): Promise<DifferentiationIdeas | null> {
  const key = `diff_${hashKey(p)}`;
  if (!opts?.force) { const c = await getCached<DifferentiationIdeas>(key); if (c) return c; }
  const out = await aiJson<DifferentiationIdeas>({
    system: 'You are an expert in differentiated instruction for mixed-ability classrooms, including large classes with limited resources.',
    user: `Generate differentiated instruction strategies.\n${JSON.stringify(p)}\n\nJSON: {"strategies":[{"group":"e.g. Learners who need support / On-level / Extension / Visual learners / Kinaesthetic learners","strategy":"specific classroom activity"}] (5 items),"tips":["2 short practical tips"]}`,
    maxTokens: 700,
    validate: (x) => Array.isArray(x.strategies) && x.strategies.length > 0 && x.strategies.every((s: any) => s?.group && s?.strategy),
  });
  if (out) await setCached(key, out);
  return out;
}

export interface CurriculumTopic { title: string; estimatedHours: number }

export async function generateCurriculumTopics(
  p: { subject: string; grade: string; curriculum: string; mainTopic: string },
): Promise<CurriculumTopic[] | null> {
  const out = await aiJson<{ topics: any[] }>({
    system: 'You are an expert curriculum designer. Output strict JSON only.',
    user: `Generate a structured list of sub-topics for a curriculum tracker.\nSubject: ${p.subject}\nGrade/Class: ${p.grade}\nCurriculum: ${p.curriculum}\nMain topic/strand: ${p.mainTopic}\n\nJSON: {"topics":[{"title":"specific lesson goal","estimatedHours":1}]} — 5 to 8 topics, estimatedHours between 1 and 3.`,
    maxTokens: 600,
    validate: (x) => Array.isArray(x.topics) && x.topics.length > 0,
  });
  if (!out) return null;
  const topics = out.topics
    .filter((t) => t && typeof t.title === 'string' && t.title.trim())
    .map((t) => ({ title: t.title.trim(), estimatedHours: Math.min(3, Math.max(1, Math.round(Number(t.estimatedHours) || 1))) }));
  return topics.length ? topics : null;
}

export interface ReflectionFeedback { encouragement: string; insight: string; actionableStep: string }

/** Coaching feedback on a written reflection (student journal or a teacher's post-lesson note). */
export async function generateReflectionFeedback(
  text: string, opts: { audience: 'student' | 'teacher'; topic?: string },
): Promise<ReflectionFeedback | null> {
  const teacher = opts.audience === 'teacher';
  return aiJson<ReflectionFeedback>({
    system: teacher
      ? 'You are a warm, supportive instructional coach helping teachers reflect on their practice.'
      : 'You are a warm, supportive educational mentor helping students build metacognition and emotional intelligence.',
    user: `${teacher ? 'A teacher wrote this post-lesson reflection' : 'A student wrote this self-reflection journal entry'}:\n${opts.topic ? `Topic: ${opts.topic}\n` : ''}Writing: "${text.slice(0, 2000)}"\n\nProvide empathetic, constructive coaching feedback.\nJSON: {"encouragement":"warm 1-2 sentence praise for their effort and honesty","insight":"a deeper insight about what the reflection reveals about growth","actionableStep":"one concrete micro-action to try next"}`,
    maxTokens: 400,
    validate: (x) => !!(x.encouragement && x.insight && x.actionableStep),
  });
}

// ── Educational resources (parent / teacher) ─────────────────────────────────

export interface EducationalResource { title: string; description: string; type: 'article' | 'video' | 'guide' | 'tip'; relevance: string }

export async function generateEducationalResources(
  p: { learningStyle?: string; thinkingStyle?: string; decisionStyle?: string; userType: 'parent' | 'teacher' },
  opts?: { force?: boolean },
): Promise<EducationalResource[] | null> {
  const key = `edu_res_${hashKey(p)}`;
  if (!opts?.force) { const c = await getCached<EducationalResource[]>(key); if (c) return c; }
  const out = await aiJson<{ resources: any[] }>({
    system: 'You are an educational resource specialist. Recommend inspiring, practical resources tailored to the given student styles. Do not invent web addresses.',
    user: `Generate 4 tailored educational resources and guides for a ${p.userType} working with a student profile.\nLearning style: ${p.learningStyle || 'General'}\nThinking style: ${p.thinkingStyle || 'General'}\nDecision style: ${p.decisionStyle || 'General'}\n\nJSON: {"resources":[{"title":"specific resource title","description":"2-sentence practical description","type":"article|video|guide|tip","relevance":"why this fits their cognitive profile"}]}`,
    maxTokens: 700,
    validate: (x) => Array.isArray(x.resources) && x.resources.length > 0,
  });
  if (!out) return null;
  const kinds = ['article', 'video', 'guide', 'tip'] as const;
  const list = out.resources
    .filter((r) => r && typeof r.title === 'string' && r.title.trim() && typeof r.description === 'string')
    .slice(0, 4)
    .map((r) => ({
      title: r.title.trim(), description: r.description,
      type: (kinds as readonly string[]).includes(r.type) ? r.type : 'guide',
      relevance: typeof r.relevance === 'string' ? r.relevance : '',
    })) as EducationalResource[];
  if (list.length === 0) return null;
  await setCached(key, list);
  return list;
}
