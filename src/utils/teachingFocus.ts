import type { JTIAReportData } from './jtiaScoring';

/**
 * Turns a teacher's Teaching Insights report into something Mind can use day to day: the
 * strongest domain, the one with most room to grow, and an intention and reflection question
 * aimed at that growth edge.
 */
export type TeachingDomainKey = keyof JTIAReportData['domainScores'];

export const DOMAIN_LABEL: Record<TeachingDomainKey, string> = {
  cognitive: 'Cognitive',
  instructional: 'Instruction',
  leadership: 'Classroom leadership',
  relationship: 'Relationships',
  professional: 'Professional growth',
};

const FOR_GROWTH: Record<TeachingDomainKey, { intention: string; prompt: string }> = {
  cognitive: { intention: 'Think out loud', prompt: 'Where did you show students how you were thinking today?' },
  instructional: { intention: 'Check understanding twice', prompt: 'Which part of today’s lesson did students grasp quickly, and which took longer?' },
  leadership: { intention: 'Set one clear routine', prompt: 'Where did your class run smoothly today, and what made the difference?' },
  relationship: { intention: 'Connect with one student', prompt: 'Which student did you connect with today, and what helped?' },
  professional: { intention: 'Reflect for two minutes', prompt: 'What is one thing you learned about your teaching today?' },
};

export interface TeachingFocus {
  strength: { key: TeachingDomainKey; label: string; score: number };
  growth: { key: TeachingDomainKey; label: string; score: number };
  /** All five domains, highest first, for a small bar chart. */
  domains: { key: TeachingDomainKey; label: string; score: number }[];
  intention: string;
  prompt: string;
}

export function teachingFocus(report: JTIAReportData | null | undefined): TeachingFocus | null {
  const scores = report?.domainScores;
  if (!scores) return null;
  const domains = (Object.keys(DOMAIN_LABEL) as TeachingDomainKey[])
    .map((key) => ({ key, label: DOMAIN_LABEL[key], score: Number(scores[key]) }))
    .filter((d) => Number.isFinite(d.score))
    .sort((a, b) => b.score - a.score);
  if (domains.length < 2) return null;
  const strength = domains[0];
  const growth = domains[domains.length - 1];
  return { strength, growth, domains, ...FOR_GROWTH[growth.key] };
}
