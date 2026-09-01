/**
 * Lesson Planner (lite). Generation goes through the live
 * /ai/generate-lesson-plan edge route; plans are stored on-device in
 * AsyncStorage (the webapp keeps them in localStorage — there is no sync
 * route). Good enough for "plan it on the bus, teach it in class".
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { callEdgeFn } from './supabase';

export interface LessonPlanInput {
  subject: string;
  gradeClass?: string;
  topic: string;
  durationMinutes?: number;
}

export interface LessonPlan extends LessonPlanInput {
  id: string;
  createdAt: string;
  delivered?: boolean;
  summary: string;
  objectives: string[];
  differentiationStrategies: { style: string; activity: string }[];
  assessmentQuestions: { question: string; answer: string }[];
}

const KEY = 'jotminds.lessonPlans';

export async function generateLessonPlan(input: LessonPlanInput): Promise<LessonPlan | null> {
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
      ...input,
      id: `lp-${Date.now()}`,
      createdAt: new Date().toISOString(),
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
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LessonPlan[]) : [];
  } catch {
    return [];
  }
}

export async function saveLessonPlan(plan: LessonPlan): Promise<void> {
  const all = await getLessonPlans();
  const next = [plan, ...all.filter((p) => p.id !== plan.id)];
  await AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
}

export async function updateLessonPlan(id: string, patch: Partial<LessonPlan>): Promise<void> {
  const all = await getLessonPlans();
  await AsyncStorage.setItem(
    KEY,
    JSON.stringify(all.map((p) => (p.id === id ? { ...p, ...patch } : p))),
  ).catch(() => {});
}

export async function deleteLessonPlan(id: string): Promise<void> {
  const all = await getLessonPlans();
  await AsyncStorage.setItem(KEY, JSON.stringify(all.filter((p) => p.id !== id))).catch(() => {});
}
