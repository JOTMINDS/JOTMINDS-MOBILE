// Compatibility shim — all calls now go through the authenticated Supabase client
import { callEdgeFn } from './supabase';
import { WIRE_TYPE, MobileAssessmentType } from './scoring';

export { callEdgeFn };

export const updateUserProfile = (updates: Record<string, any>) =>
  callEdgeFn('/user/profile', { method: 'PATCH', body: JSON.stringify(updates) });

export const getAllAssessmentResults = () =>
  callEdgeFn('/assessment/results');

const wireType = (type: string) => WIRE_TYPE[type as MobileAssessmentType] ?? type;

// The three core assessments (learning/thinking/decision) are now stored
// under the webapp's own names (kolb/sternberg/dual-process) so both apps
// share one record — see src/utils/scoring.ts's WIRE_TYPE doc comment.
// Reads fall back to the pre-migration mobile name so older results (or an
// account that hasn't retaken the assessment since) still show up.
export const getAssessmentResults = async (type: string) => {
  const wt = wireType(type);
  const primary = await callEdgeFn(`/assessment/results/${wt}`);
  if (wt !== type && !primary?.results && !primary?.result) {
    return callEdgeFn(`/assessment/results/${type}`);
  }
  return primary;
};

export const saveProgress = (
  assessmentType: string,
  currentQuestion: number,
  answers: any[],
  completed: boolean,
) =>
  callEdgeFn('/assessment/progress', {
    method: 'POST',
    body: JSON.stringify({ assessmentType: wireType(assessmentType), currentQuestion, answers, completed }),
  });

export const getProgress = (assessmentType: string) =>
  callEdgeFn(`/assessment/progress/${wireType(assessmentType)}`);

export const submitAssessment = (
  assessmentType: string,
  answers: any[],
  results: any,
  strengths: string[],
  weaknesses: string[],
  recommendations: string[],
) =>
  callEdgeFn('/assessment/submit', {
    method: 'POST',
    body: JSON.stringify({
      assessmentType: wireType(assessmentType),
      answers,
      results,
      strengths,
      weaknesses,
      recommendations,
    }),
  });

export const getLinkedChildren = () =>
  callEdgeFn('/parent/children');

export const linkChildByEmail = (childEmail: string) =>
  callEdgeFn('/parent/link-child', {
    method: 'POST',
    body: JSON.stringify({ childEmail }),
  });

export const createAccessRequest = (childEmail: string) =>
  callEdgeFn('/access-request/create', {
    method: 'POST',
    body: JSON.stringify({ childEmail }),
  });

export const getPendingAccessRequests = () =>
  callEdgeFn('/access-request/pending');

export const approveAccessRequest = (requestId: string) =>
  callEdgeFn('/access-request/approve', {
    method: 'POST',
    body: JSON.stringify({ requestId }),
  });

export const denyAccessRequest = (requestId: string) =>
  callEdgeFn('/access-request/deny', {
    method: 'POST',
    body: JSON.stringify({ requestId }),
  });

export const getStudentsForTeacher = () =>
  callEdgeFn('/teacher/students');

export const getOrganizationMembers = () =>
  callEdgeFn('/organization/members');

// ── Institutional student-code sign-in ─────────────────────────────────────
// Both routes are unauthenticated (the whole point is to sign in without an
// email/password). The server owns the student_codes table and exchanges a
// valid code for a real Supabase session.

export interface StudentCodeValidation {
  valid: boolean;
  studentName?: string;
  schoolName?: string | null;
}

export const validateStudentCode = (code: string): Promise<StudentCodeValidation> =>
  callEdgeFn('/student-code/validate', {
    method: 'POST',
    body: JSON.stringify({ code: code.trim().toUpperCase() }),
  });

export const signInWithStudentCode = (
  code: string,
): Promise<{ success?: boolean; session: any; user?: any }> =>
  callEdgeFn('/student-code/signin', {
    method: 'POST',
    body: JSON.stringify({ code: code.trim().toUpperCase() }),
  });
// ── Class management ──────────────────────────────────────────────────────
export interface SchoolClass {
  id: string;
  name: string;
  academicYear?: string;
  classTeacherId?: string;
  institutionId?: string;
  studentCount?: number;
  status?: string;
  classCode?: string;
  createdAt?: string;
}

export const getClasses = (institutionId?: string): Promise<{ classes: SchoolClass[] }> =>
  callEdgeFn(`/institutions/classes${institutionId ? `?institutionId=${encodeURIComponent(institutionId)}` : ''}`);

export const saveClass = (cls: Partial<SchoolClass>): Promise<{ class: SchoolClass }> =>
  callEdgeFn('/institutions/classes', { method: 'POST', body: JSON.stringify(cls) });

export const deleteClass = (id: string): Promise<{ success: boolean }> =>
  callEdgeFn(`/institutions/classes/${id}`, { method: 'DELETE' });

export const assignStudentToClass = (args: {
  userId: string;
  classId: string | null;
  className?: string;
  institutionId?: string;
  teacherId?: string;
}): Promise<{ success: boolean }> =>
  callEdgeFn('/institutions/members/assign-class', {
    method: 'POST',
    body: JSON.stringify({ ...args, role: 'student' }),
  });

export const enrollStudent = (args: {
  studentName: string;
  dateOfBirth: string;
  classId?: string;
  className?: string;
  teacherId?: string;
  institutionId?: string;
  educationLevel?: string;
}): Promise<{ student?: { id: string; name: string; studentCode: string }; code?: string; error?: string }> =>
  callEdgeFn('/enroll-student', { method: 'POST', body: JSON.stringify(args) });

// ── Account deletion ─────────────────────────────────────────────────────
/** Permanently deletes the signed-in user's account and all their data. */
export const deleteAccount = (): Promise<{ success?: boolean; error?: string }> =>
  callEdgeFn('/account/delete', { method: 'POST' });
