/**
 * Evidence-event storage for the Pre-school (JM-PDAF) flow.
 *
 * Screens depend on the `PreschoolEvidenceStore` interface only. The current
 * implementation is device-local (AsyncStorage): evidence recorded here is NOT
 * shared with the webapp or other devices. When a server table + routes exist,
 * add a remote implementation and swap it in `getPreschoolStore()` — no screen
 * changes needed. No demo data is ever seeded.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  EvidenceEvent, DevelopmentalIndicator, DevelopmentalRating, AssessmentMethodCode, LanguageOfEvidence, PreschoolUser,
} from '../types/preschoolDevelopmental';

export interface PreschoolEvidenceStore {
  list(): Promise<EvidenceEvent[]>;
  save(event: EvidenceEvent): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export const PRESCHOOL_EVENTS_KEY = 'jotminds.preschool.evidence.v1';

export function createLocalStore(storage: KeyValueStorage = AsyncStorage): PreschoolEvidenceStore {
  const read = async (): Promise<EvidenceEvent[]> => {
    try {
      const raw = await storage.getItem(PRESCHOOL_EVENTS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  };
  const write = (events: EvidenceEvent[]) => storage.setItem(PRESCHOOL_EVENTS_KEY, JSON.stringify(events));

  return {
    list: read,
    async save(event) {
      const all = await read();
      const i = all.findIndex((e) => e.id === event.id);
      if (i >= 0) all[i] = event;
      else all.unshift(event);
      await write(all);
    },
    async remove(id) {
      await write((await read()).filter((e) => e.id !== id));
    },
  };
}

let store: PreschoolEvidenceStore | null = null;
export const getPreschoolStore = (): PreschoolEvidenceStore => (store ??= createLocalStore());

export interface NewEvidenceInput {
  child: PreschoolUser & { classId?: string };
  indicator: DevelopmentalIndicator;
  rating: DevelopmentalRating;
  method: AssessmentMethodCode;
  observer: { id: string; name: string };
  notes?: string;
  language?: LanguageOfEvidence;
  activityContext?: string;
  institutionId?: string;
  now?: Date;
}

export function buildEvidenceEvent(i: NewEvidenceInput): EvidenceEvent {
  const now = i.now ?? new Date();
  const notes = i.notes?.trim();
  return {
    id: `pe_${now.getTime()}_${Math.random().toString(36).slice(2, 8)}`,
    childId: i.child.id,
    childName: i.child.name,
    indicatorId: i.indicator.id,
    domainCode: i.indicator.domainCode,
    rating: i.rating,
    method: i.method,
    date: now.toISOString().slice(0, 10),
    timestamp: now.toISOString(),
    observerId: i.observer.id,
    observerName: i.observer.name,
    observerRole: 'teacher',
    ...(i.activityContext ? { activityContext: i.activityContext } : {}),
    ...(i.language ? { languageOfEvidence: i.language } : {}),
    ...(notes ? { notes } : {}),
    ...(i.child.classId ? { classId: i.child.classId } : {}),
    ...(i.institutionId ? { institutionId: i.institutionId } : {}),
  };
}
