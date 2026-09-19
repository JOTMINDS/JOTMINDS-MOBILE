import AsyncStorage from '@react-native-async-storage/async-storage';
import { callEdgeFn } from './supabase';
import type { PV2Prompt } from './professionalV2Logic';

/**
 * Client for the Professional V2 assessment engine (webapp server:
 * assessment-session-routes.tsx + professional-profile-routes.tsx, mounted at
 * /assessment-sessions). The engine is server-authoritative: it owns item
 * order, option shuffling, scoring and the AI-bounded profile. The client only
 * renders what /next serves and reports responses + behavioural events.
 */

/** Must match the assessment_key created in the Super Admin "Assessment Studio (V2)". */
export const PV2_ASSESSMENT_KEY = 'professional_v2';
/** Shown to the user; the server records its own CONSENT_VERSION on start. */
export const PV2_CONSENT_COPY = [
  'Your answers are used to build your Professional Intelligence profile.',
  'We also record how you respond (timing, changes of answer, information you open) to keep results reliable.',
  'The AI only explains your already-computed profile. It cannot change scores and makes no hiring or promotion decision.',
  'You can withdraw and permanently erase this attempt at any time.',
];

export interface PV2NextItem {
  done: boolean;
  isSimulation?: boolean;
  sessionItemId?: string;
  position?: number;
  totalItems?: number;
  item?: PV2Prompt & { itemType?: string };
}

export interface PV2SessionInfo {
  id: string;
  status: 'in_progress' | 'paused' | 'completed' | string;
  currentPosition: number;
  totalItems: number;
}

export interface PV2ConstructResult {
  constructKey: string;
  name: string;
  constructType: 'preference' | 'capability' | 'behavioral' | 'meta' | 'validation' | string;
  preferenceSignalKey?: string | null;
  preferenceSummary?: Record<string, any>;
  capabilityLevel?: 'insufficient' | 'emerging' | 'moderate' | 'strong' | null;
  metaValue?: any;
  evidenceCount: number;
  supportingCount: number;
  contradictingCount: number;
  confidence: 'low' | 'moderate' | 'high';
}

export interface PV2Domain {
  domainKey: string;
  name: string;
  confidence: 'low' | 'moderate' | 'high';
  constructs: PV2ConstructResult[];
}

export interface PV2Insight {
  insight_type: 'domain_narrative' | 'blind_spot' | 'development_priority' | string;
  generated_text: string;
  structured_evidence?: { domainKey?: string; constructKeys?: string[] };
}

export interface PV2Profile {
  status: 'interpreting' | 'interpreted' | 'interpretation_failed' | string;
  overall_confidence: 'low' | 'moderate' | 'high';
  structured_summary: { domains: PV2Domain[]; overallConfidence: string };
}

// ── Session lifecycle ────────────────────────────────────────────────────────

export async function startSession(): Promise<{ sessionId: string; totalItems: number; resumed?: boolean }> {
  const res = await callEdgeFn('/assessment-sessions', {
    method: 'POST',
    body: JSON.stringify({ assessmentKey: PV2_ASSESSMENT_KEY, consentGiven: true }),
  });
  return { sessionId: res.sessionId, totalItems: res.totalItems, resumed: res.resumed };
}

export async function getSession(sessionId: string): Promise<PV2SessionInfo> {
  const res = await callEdgeFn(`/assessment-sessions/${sessionId}`);
  return res.session;
}

export const pauseSession = (id: string) =>
  callEdgeFn(`/assessment-sessions/${id}/pause`, { method: 'POST', body: '{}' });

export const resumeSession = (id: string) =>
  callEdgeFn(`/assessment-sessions/${id}/resume`, { method: 'POST', body: '{}' });

export const deleteSession = (id: string) =>
  callEdgeFn(`/assessment-sessions/${id}`, { method: 'DELETE' });

/** Completes the session and runs server-side scoring. */
export async function completeSession(id: string): Promise<{ scoringError?: string }> {
  const res = await callEdgeFn(`/assessment-sessions/${id}/complete`, { method: 'POST', body: '{}' }, 45000);
  return { scoringError: res.scoringError };
}

// ── Items ────────────────────────────────────────────────────────────────────

export async function getNext(id: string): Promise<PV2NextItem> {
  return callEdgeFn(`/assessment-sessions/${id}/next`);
}

export async function submitResponse(
  id: string, sessionItemId: string, response: Record<string, any>,
): Promise<{ done: boolean }> {
  const res = await callEdgeFn(`/assessment-sessions/${id}/responses`, {
    method: 'POST',
    body: JSON.stringify({ sessionItemId, response }),
  });
  return { done: !!res.done };
}

// ── Simulations ──────────────────────────────────────────────────────────────

export async function getSimulationStage(
  id: string, sessionItemId: string,
): Promise<{ done: boolean; stageId?: string; stage?: PV2Prompt & { stageType?: string } }> {
  return callEdgeFn(`/assessment-sessions/${id}/simulation/${sessionItemId}/stage`);
}

export async function submitStageResponse(
  id: string, sessionItemId: string, stageId: string, response: Record<string, any>,
): Promise<{ done: boolean; sessionDone?: boolean }> {
  const res = await callEdgeFn(`/assessment-sessions/${id}/simulation/${sessionItemId}/stage-response`, {
    method: 'POST',
    body: JSON.stringify({ stageId, response }),
  });
  return { done: !!res.done, sessionDone: res.sessionDone };
}

// ── Results & profile ────────────────────────────────────────────────────────

export async function getResults(id: string) {
  return callEdgeFn(`/assessment-sessions/${id}/results`);
}

/** Cached profile, or null if it hasn't been generated yet (404). */
export async function getProfile(id: string): Promise<{ profile: PV2Profile; insights: PV2Insight[] } | null> {
  try {
    const res = await callEdgeFn(`/assessment-sessions/${id}/profile`);
    return { profile: res.profile, insights: res.insights ?? [] };
  } catch (e: any) {
    if (/not found/i.test(e?.message ?? '')) return null;
    throw e;
  }
}

/** Assembles the structured profile and asks the AI to explain it (can take a while). */
export async function generateProfile(id: string): Promise<{ profile: PV2Profile; insights: PV2Insight[] }> {
  const res = await callEdgeFn(`/assessment-sessions/${id}/profile`, { method: 'POST', body: '{}' }, 60000);
  return { profile: res.profile, insights: res.insights ?? [] };
}

// ── Local pointer to the user's latest attempt ───────────────────────────────
// The server has no "list my sessions" route, so remember the last one here to
// offer Resume / View results. Keyed per user so accounts on a shared device
// never see each other's pointer.

export interface PV2Pointer { sessionId: string; state: 'active' | 'completed' }
const pointerKey = (userId: string) => `jotminds.pv2.last.${userId}`;

export async function loadPointer(userId: string): Promise<PV2Pointer | null> {
  try {
    const raw = await AsyncStorage.getItem(pointerKey(userId));
    return raw ? (JSON.parse(raw) as PV2Pointer) : null;
  } catch {
    return null;
  }
}

export async function savePointer(userId: string, p: PV2Pointer | null): Promise<void> {
  try {
    if (p) await AsyncStorage.setItem(pointerKey(userId), JSON.stringify(p));
    else await AsyncStorage.removeItem(pointerKey(userId));
  } catch {
    // best effort
  }
}

// ── Behavioural events ───────────────────────────────────────────────────────

export type PV2EventType = 'viewed' | 'selected' | 'changed' | 'opened' | 'ranked' | 'reallocated' | 'simulation_stage';

interface PV2Event {
  sessionItemId?: string;
  eventType: PV2EventType;
  eventValue: Record<string, any>;
  clientTimestamp: string;
  clientSequence: number;
}

const MAX_BATCH = 200;      // server cap per request
const MAX_BUFFER = 600;     // bound memory if the network is down for a long time
const AUTO_FLUSH_AT = 20;

/**
 * Buffers interaction events and ships them in batches. Events are
 * best-effort: a failed flush keeps them for the next attempt, and losing some
 * never blocks the assessment. `clientSequence` is monotonic per session so the
 * server can restore order despite out-of-order delivery.
 */
export class PV2EventRecorder {
  private buffer: PV2Event[] = [];
  private seq = 0;
  private flushing: Promise<void> | null = null;

  constructor(
    private readonly sessionId: string,
    private readonly send: (sessionId: string, events: PV2Event[]) => Promise<void> = defaultSend,
    private readonly now: () => Date = () => new Date(),
  ) {}

  record(eventType: PV2EventType, sessionItemId?: string, eventValue: Record<string, any> = {}) {
    this.buffer.push({
      sessionItemId, eventType, eventValue,
      clientTimestamp: this.now().toISOString(),
      clientSequence: this.seq++,
    });
    if (this.buffer.length > MAX_BUFFER) this.buffer.splice(0, this.buffer.length - MAX_BUFFER);
    if (this.buffer.length >= AUTO_FLUSH_AT) void this.flush();
  }

  get pending() { return this.buffer.length; }

  /** Sends everything buffered; never throws. */
  flush(): Promise<void> {
    if (this.flushing) return this.flushing;
    this.flushing = (async () => {
      try {
        while (this.buffer.length > 0) {
          const batch = this.buffer.slice(0, MAX_BATCH);
          try {
            await this.send(this.sessionId, batch);
          } catch {
            return; // keep the events, try again on the next flush
          }
          this.buffer.splice(0, batch.length);
        }
      } finally {
        this.flushing = null;
      }
    })();
    return this.flushing;
  }
}

async function defaultSend(sessionId: string, events: PV2Event[]): Promise<void> {
  await callEdgeFn(`/assessment-sessions/${sessionId}/events`, {
    method: 'POST',
    body: JSON.stringify({ events }),
  }, 15000);
}
