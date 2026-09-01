/**
 * Teacher Observation client. Backed by the /teacher-observation/* edge
 * routes (see JOTMINDS-WEBAPP supabase/functions/server/teacher-observation-routes.tsx).
 * All calls resolve to a safe empty shape on failure so screens don't crash
 * if the route isn't deployed yet.
 */
import { callEdgeFn } from './supabase';

export const CONCERN_TYPES = [
  'Academic Focus',
  'Behavioral / Attention',
  'Social Interaction',
  'Learning Pace',
  'Commendation',
] as const;
export type ConcernType = (typeof CONCERN_TYPES)[number];
export type Severity = 'low' | 'medium' | 'high';

export interface TeacherObservation {
  id: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  subject?: string;
  concernType: ConcernType;
  severity: Severity;
  observationText: string;
  recommendedAction?: string;
  sharedWithParent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewObservation {
  studentId: string;
  studentName?: string;
  subject?: string;
  concernType: ConcernType;
  severity: Severity;
  observationText: string;
  recommendedAction?: string;
  shareWithParent: boolean;
}

export async function createTeacherObservation(
  input: NewObservation,
): Promise<{ observation?: TeacherObservation; error?: string }> {
  try {
    const res = await callEdgeFn('/teacher-observation', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return { observation: res?.observation };
  } catch (e: any) {
    return { error: e?.message || 'Could not save observation' };
  }
}

export async function getTeacherObservations(teacherId: string): Promise<TeacherObservation[]> {
  try {
    const res = await callEdgeFn(`/teacher-observation/teacher/${teacherId}`);
    return res?.observations ?? [];
  } catch {
    return [];
  }
}

export async function getObservationsForChild(childId: string): Promise<TeacherObservation[]> {
  try {
    const res = await callEdgeFn(`/teacher-observation/child/${childId}`);
    return res?.observations ?? [];
  } catch {
    return [];
  }
}

export async function deleteTeacherObservation(id: string): Promise<void> {
  try {
    await callEdgeFn(`/teacher-observation/${id}`, { method: 'DELETE' });
  } catch {
    // non-critical
  }
}
