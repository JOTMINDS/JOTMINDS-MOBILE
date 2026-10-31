/**
 * Lesson Planner (lite). Generation goes through the live
 * /ai/generate-lesson-plan edge route; plans are stored on-device in
 * AsyncStorage (the webapp keeps them in localStorage — there is no sync
 * route). Good enough for "plan it on the bus, teach it in class".
 */
import { readScoped, writeScoped } from './userStorage';
import { consecutiveDayStreak } from './streaks';
import { callEdgeFn } from './supabase';
import { aiJson } from './aiGenerators';
import { curriculumFormat, fitPhasesToDuration, LessonPhase, DEFAULT_CURRICULUM } from './curriculumFormats';

export interface LessonPlanInput {
  subject: string;
  gradeClass?: string;
  topic: string;
  durationMinutes?: number;
  /** Curriculum framework the plan should follow (see curriculumFormats.ts). */
  curriculum?: string;
}

export interface LessonPlan extends LessonPlanInput {
  id: string;
  createdAt: string;
  delivered?: boolean;
  summary: string;
  objectives: string[];
  differentiationStrategies: { style: string; activity: string }[];
  assessmentQuestions: { question: string; answer: string }[];
  /** Curriculum-specific headings (e.g. NaCCA strand and indicators), present when the curriculum was applied. */
  curriculumAlignment?: { label: string; items: string[] }[];
  /** The lesson flow with times that add up to the lesson length. */
  phases?: LessonPhase[];
  /** post-lesson reflections, newest first */
  reflections?: { at: string; text: string; feedback?: { encouragement: string; insight: string; actionableStep: string } }[];
}

const KEY = 'jotminds.lessonPlans';

const CURRICULUM_KEY = 'jotminds.lessonCurriculum';

/** The curriculum the teacher used last, so they pick it once (as in the webapp). */
export async function getPreferredCurriculum(): Promise<string> {
  try { return (await readScoped(CURRICULUM_KEY)) || DEFAULT_CURRICULUM; } catch { return DEFAULT_CURRICULUM; }
}
export async function setPreferredCurriculum(curriculum: string): Promise<void> {
  try { await writeScoped(CURRICULUM_KEY, curriculum); } catch { /* best effort */ }
}

const strings = (a: any): string[] => (Array.isArray(a) ? a.filter((x) => typeof x === 'string' && x.trim()) : []);

/** Curriculum-aware plan from the shared AI chat route; null if the model reply is unusable. */
async function generateCurriculumPlan(input: LessonPlanInput): Promise<Omit<LessonPlan, 'id' | 'createdAt' | keyof LessonPlanInput> | null> {
  const duration = input.durationMinutes ?? 45;
  const format = curriculumFormat(input.curriculum);
  const out = await aiJson<any>({
    system: `You are an expert curriculum designer who writes lesson plans in the exact format of the curriculum the teacher selected (${format.name}). Write in plain, simple English a busy teacher can scan quickly.`,
    user: `Generate a complete, ready-to-teach lesson plan.

Subject: ${input.subject}
Topic: ${input.topic}
Grade/Level: ${input.gradeClass || 'General'}
Curriculum: ${format.name}
Total lesson time: ${duration} minutes

CURRICULUM FORMAT (follow this strictly, the plan must look like a ${format.name} lesson plan):
${format.guide}

Be specific to ${input.topic}; do not write generic filler.

JSON structure:
{
  "summary": "2 sentence overview of the lesson",
  "objectives": ["3-4 measurable objectives written in the style this curriculum uses"],
  "curriculumAlignment": [{ "label": "one of: ${format.alignmentLabels.join(' | ')}", "items": ["specific item(s) for this lesson"] }],
  "phases": [
    { "name": "Introduction", "durationMinutes": 0, "activity": "What the teacher and learners do, step by step", "teachingNotes": "Short teaching tip", "materialsNeeded": ["item"] },
    { "name": "Main Lesson", "durationMinutes": 0, "activity": "...", "teachingNotes": "...", "materialsNeeded": [] },
    { "name": "Guided Practice", "durationMinutes": 0, "activity": "...", "teachingNotes": "...", "materialsNeeded": [] },
    { "name": "Assessment", "durationMinutes": 0, "activity": "...", "teachingNotes": "...", "materialsNeeded": [] },
    { "name": "Conclusion", "durationMinutes": 0, "activity": "...", "teachingNotes": "...", "materialsNeeded": [] }
  ],
  "differentiationStrategies": [{ "style": "Visual Learners", "activity": "Specific activity" }, { "style": "Auditory Learners", "activity": "Specific activity" }, { "style": "Kinesthetic Learners", "activity": "Specific activity" }, { "style": "Analytical Thinkers", "activity": "Specific activity" }],
  "assessmentQuestions": [{ "question": "Question 1", "answer": "Answer 1" }]
}
Rules: the five phase names exactly as shown and in that order; phase durationMinutes are whole numbers adding up to exactly ${duration}; at least 5 assessmentQuestions.`,
    maxTokens: 3000,
    validate: (x) => Array.isArray(x.objectives) && x.objectives.length > 0 && Array.isArray(x.phases) && x.phases.length > 0,
  });
  if (!out) return null;
  return {
    summary: typeof out.summary === 'string' ? out.summary : '',
    objectives: strings(out.objectives),
    curriculumAlignment: (Array.isArray(out.curriculumAlignment) ? out.curriculumAlignment : [])
      .filter((a: any) => a && typeof a.label === 'string' && strings(a.items).length)
      .map((a: any) => ({ label: a.label, items: strings(a.items) })),
    phases: fitPhasesToDuration(
      out.phases.filter((p: any) => p && typeof p.name === 'string' && typeof p.activity === 'string'),
      duration,
    ),
    differentiationStrategies: Array.isArray(out.differentiationStrategies) ? out.differentiationStrategies : [],
    assessmentQuestions: Array.isArray(out.assessmentQuestions) ? out.assessmentQuestions : [],
  };
}

export async function generateLessonPlan(input: LessonPlanInput): Promise<LessonPlan | null> {
  const base = { ...input, id: `lp-${Date.now()}`, createdAt: new Date().toISOString() };

  // Preferred: a plan laid out in the chosen curriculum's own format.
  if (input.curriculum) {
    const plan = await generateCurriculumPlan(input);
    if (plan) return { ...base, ...plan };
  }

  // Fallback: the original generic route. It ignores the curriculum, so the plan is
  // not labelled with one (the app must not claim a format it didn't apply).
  try {
    const res = await callEdgeFn(
      '/ai/generate-lesson-plan',
      {
        method: 'POST',
        body: JSON.stringify({
          subject: input.subject,
          gradeClass: input.gradeClass,
          topic: input.topic,
          durationMinutes: input.durationMinutes ?? 45,
        }),
      },
      30000,
    );
    if (!res || !Array.isArray(res.objectives)) return null;
    return {
      ...base,
      curriculum: undefined,
      summary: res.summary ?? '',
      objectives: res.objectives ?? [],
      differentiationStrategies: res.differentiationStrategies ?? [],
      assessmentQuestions: res.assessmentQuestions ?? [],
    };
  } catch {
    return null;
  }
}

export async function getLessonPlans(): Promise<LessonPlan[]> {
  try {
    const raw = await readScoped(KEY);
    return raw ? (JSON.parse(raw) as LessonPlan[]) : [];
  } catch {
    return [];
  }
}

export async function saveLessonPlan(plan: LessonPlan): Promise<void> {
  const all = await getLessonPlans();
  const next = [plan, ...all.filter((p) => p.id !== plan.id)];
  await writeScoped(KEY, JSON.stringify(next));
}

export async function updateLessonPlan(id: string, patch: Partial<LessonPlan>): Promise<void> {
  const all = await getLessonPlans();
  await writeScoped(KEY, JSON.stringify(all.map((p) => (p.id === id ? { ...p, ...patch } : p))));
}

export async function deleteLessonPlan(id: string): Promise<void> {
  const all = await getLessonPlans();
  await writeScoped(KEY, JSON.stringify(all.filter((p) => p.id !== id)));
}

/** Consecutive days on which the teacher created a lesson plan. */
export const planningStreak = (plans: LessonPlan[]): number =>
  consecutiveDayStreak(plans.map((p) => p.createdAt));
