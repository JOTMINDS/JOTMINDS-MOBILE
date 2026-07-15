/**
 * Network layer for parent-child features (linked children + assessments,
 * access requests, sharing consent, parent observations). Split from the
 * pure-logic files (cognitivePairingData.ts, parentObservationData.ts) for
 * the same reason gamificationApi.ts is split from gamification.ts —
 * importing supabase.ts pulls in AsyncStorage's native module, which breaks
 * Jest for anything that imports this file.
 */
import { callEdgeFn } from './supabase';
import { ParentObservationScore } from './parentObservationData';

export const getLinkedChildrenWithAssessments = () =>
  callEdgeFn('/parent/linked-children');

export const getMyAccessRequestsAsChild = () =>
  callEdgeFn('/access-request/all');

export const getChildConsents = (childId: string) =>
  callEdgeFn(`/consent/child/${childId}`);

export const getConsent = (childId: string, parentId: string) =>
  callEdgeFn(`/consent/${childId}/${parentId}`);

export const setConsent = (childId: string, parentId: string, consentGiven: boolean) =>
  callEdgeFn('/consent', {
    method: 'POST',
    body: JSON.stringify({ childId, parentId, consentGiven }),
  });

export const saveParentObservation = (
  childId: string,
  responses: number[],
  score: ParentObservationScore,
) =>
  callEdgeFn('/observation', {
    method: 'POST',
    body: JSON.stringify({
      childId,
      responses,
      score,
      // Server requires these three fields to be present — real content
      // (not filler), pulled from the score sections closest in meaning.
      thinking: score.sectionB.style,
      playing: score.sectionA.style,
      learning: score.sectionD.style,
    }),
  });

export const getObservationsForParent = async (parentId: string, childId: string) => {
  const res = await callEdgeFn(`/observation/parent/${parentId}`);
  const observations = (res?.observations || []).filter((o: any) => o.childId === childId);
  return { ...res, observations };
};
