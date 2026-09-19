import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Curriculum tracker (scheme-of-work progress). On-device, like lesson plans:
 * the webapp keeps this in localStorage and has no sync route.
 */
export type TopicStatus = 'outstanding' | 'in_progress' | 'done';

export interface TrackerTopic { id: string; title: string; status: TopicStatus; estimatedHours: number }

export interface CurriculumTracker {
  id: string;
  subject: string;
  grade: string;
  curriculum: string;
  mainTopic: string;
  createdAt: string;
  topics: TrackerTopic[];
}

const KEY = 'jotminds.curriculumTrackers';
const NEXT: Record<TopicStatus, TopicStatus> = { outstanding: 'in_progress', in_progress: 'done', done: 'outstanding' };

export const nextStatus = (s: TopicStatus): TopicStatus => NEXT[s];

/** Share of estimated teaching hours completed (in-progress counts half); 0 for an empty tracker. */
export function progressPercent(topics: TrackerTopic[]): number {
  const total = topics.reduce((a, t) => a + t.estimatedHours, 0);
  if (total === 0) return 0;
  const done = topics.reduce((a, t) => a + t.estimatedHours * (t.status === 'done' ? 1 : t.status === 'in_progress' ? 0.5 : 0), 0);
  return Math.round((done / total) * 100);
}

export async function getTrackers(): Promise<CurriculumTracker[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function write(all: CurriculumTracker[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(all)).catch(() => {});
}

export async function saveTracker(t: CurriculumTracker): Promise<void> {
  const all = await getTrackers();
  await write([t, ...all.filter((x) => x.id !== t.id)]);
}

export async function deleteTracker(id: string): Promise<void> {
  await write((await getTrackers()).filter((t) => t.id !== id));
}

export function newTracker(
  input: { subject: string; grade: string; curriculum: string; mainTopic: string },
  topics: { title: string; estimatedHours: number }[],
  now = new Date(),
): CurriculumTracker {
  return {
    id: `trk_${now.getTime()}_${Math.random().toString(36).slice(2, 7)}`,
    ...input,
    createdAt: now.toISOString(),
    topics: topics.map((t, i) => ({ id: `t${i + 1}`, title: t.title, estimatedHours: t.estimatedHours, status: 'outstanding' as const })),
  };
}
