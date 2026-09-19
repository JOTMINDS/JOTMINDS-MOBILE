import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  calculateProfessionalCognitiveProfile, ProfessionalAssessmentResponses, ProfessionalCognitiveProfile,
} from './professionalCognitiveScoring';
import { PROFESSIONAL_SECTIONS } from '../data/professionalCognitiveQuestions';

/**
 * On-device history of a professional's Professional Cognitive Assessment
 * attempts (the webapp holds the profile in component state only, so there's
 * no server copy to read). Per-user key so accounts on a shared device don't mix.
 */
export interface ProfessionalCognitiveEntry {
  id: string;
  at: string;
  responses: ProfessionalAssessmentResponses;
  profile: ProfessionalCognitiveProfile;
}

const MAX_ENTRIES = 20;
const key = (userId: string) => `jotminds.profCognitive.${userId}`;

export async function loadEntries(userId: string): Promise<ProfessionalCognitiveEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(key(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Scores the responses, stores the attempt (newest first, capped) and returns it. */
export async function saveAttempt(
  userId: string, responses: ProfessionalAssessmentResponses, now = new Date(),
): Promise<ProfessionalCognitiveEntry> {
  const entry: ProfessionalCognitiveEntry = {
    id: `pc_${now.getTime()}`,
    at: now.toISOString(),
    responses,
    profile: calculateProfessionalCognitiveProfile(responses),
  };
  const all = await loadEntries(userId);
  await AsyncStorage.setItem(key(userId), JSON.stringify([entry, ...all].slice(0, MAX_ENTRIES))).catch(() => {});
  return entry;
}

/** Questions answered / total (optional section included), for the progress bar. */
export function progress(responses: ProfessionalAssessmentResponses): { answered: number; total: number } {
  const total = PROFESSIONAL_SECTIONS.reduce((n, s) => n + s.questions.length, 0);
  const answered = PROFESSIONAL_SECTIONS.reduce(
    (n, s) => n + ((responses[s.id] ?? []).filter((v) => typeof v === 'number').length), 0,
  );
  return { answered, total };
}

/** The three required sections are fully answered; the optional one may be skipped or partial. */
export function isSubmittable(responses: ProfessionalAssessmentResponses): boolean {
  return PROFESSIONAL_SECTIONS.filter((s) => !s.optional)
    .every((s) => (responses[s.id] ?? []).filter((v) => typeof v === 'number').length === s.questions.length);
}

/** A plain-text report suitable for the share sheet. */
export function buildReportText(
  entry: ProfessionalCognitiveEntry,
  who: { name?: string; position?: string; organization?: string },
): string {
  const p = entry.profile;
  const lines = [
    'JotMinds Professional Assessment Report',
    [who.name, who.position, who.organization].filter(Boolean).join(' · '),
    `Completed ${new Date(entry.at).toLocaleDateString()}`,
    '',
    `Overall profile: ${p.overallProfile}`,
    p.summary,
    '',
    `Learning: ${p.learning.style} (${p.learning.score})`,
    `Thinking: ${p.thinking.style} (${p.thinking.score})`,
    `Decision-making: ${p.decisionMaking.style} (${p.decisionMaking.score})`,
    ...(p.motivation ? [`Motivation: ${p.motivation.style} (${p.motivation.score})`] : []),
    '',
    'Generated with JotMinds — jotminds.com',
  ];
  return lines.filter((l, i) => l !== '' || lines[i - 1] !== '').join('\n');
}
