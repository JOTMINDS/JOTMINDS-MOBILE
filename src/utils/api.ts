// Compatibility shim — all calls now go through the authenticated Supabase client
import { callEdgeFn } from './supabase';

export { callEdgeFn };

export const getAllAssessmentResults = () =>
  callEdgeFn('/assessment/results');

export const getAssessmentResults = (type: string) =>
  callEdgeFn(`/assessment/results/${type}`);

export const saveProgress = (
  assessmentType: string,
  currentQuestion: number,
  answers: any[],
  completed: boolean,
) =>
  callEdgeFn('/assessment/progress', {
    method: 'POST',
    body: JSON.stringify({ assessmentType, currentQuestion, answers, completed }),
  });

export const getProgress = (assessmentType: string) =>
  callEdgeFn(`/assessment/progress/${assessmentType}`);

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
    body: JSON.stringify({ assessmentType, answers, results, strengths, weaknesses, recommendations }),
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
