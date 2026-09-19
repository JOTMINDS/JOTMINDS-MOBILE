/**
 * Pure logic for the Professional V2 assessment client: what the user's
 * in-progress answer looks like per item type, when it counts as complete,
 * and the exact JSON sent to the server.
 *
 * The server stores `response` as free-form jsonb, but its scoring engine
 * (supabase/functions/server/scoring-engine.tsx) only understands
 *   { optionCode }   forced_choice / situational_judgment (+ simulation branching)
 *   { value }        confidence_slider
 * Every other type is captured verbatim under a descriptive key so it is
 * retained for later scoring without pretending to be a scored shape.
 */

export type PV2ItemType =
  | 'forced_choice' | 'situational_judgment' | 'ranking' | 'multi_select'
  | 'confidence_slider' | 'timed_task' | 'open_response'
  | 'information_selection' | 'resource_allocation';

export interface PV2Option { optionId: string; code: string; text: string }

export interface PV2Prompt {
  /** item type, or stage type inside a simulation */
  type: PV2ItemType | string;
  promptText: string;
  timeLimitSeconds?: number | null;
  config?: Record<string, any>;
  options: PV2Option[];
}

/** Everything the user has entered so far for one prompt. */
export interface PV2Answer {
  choice?: string;                       // single choice option code
  multi?: string[];                      // multi_select / information_selection
  ranking?: string[];                    // option codes, best first
  value?: number;                        // confidence slider
  allocation?: Record<string, number>;   // option code -> points
  text?: string;                         // open_response / timed_task free text
}

export const SLIDER_DEFAULT = { min: 0, max: 100, step: 10 };
export const ALLOCATION_DEFAULT_TOTAL = 100;
export const ALLOCATION_STEP = 5;

const SINGLE_TYPES = ['forced_choice', 'situational_judgment'];

export function sliderBounds(config?: Record<string, any>) {
  const min = Number.isFinite(config?.min) ? Number(config!.min) : SLIDER_DEFAULT.min;
  const max = Number.isFinite(config?.max) ? Number(config!.max) : SLIDER_DEFAULT.max;
  const step = Number.isFinite(config?.step) && config!.step > 0 ? Number(config!.step) : SLIDER_DEFAULT.step;
  return { min, max: Math.max(max, min), step };
}

export function allocationTotal(config?: Record<string, any>): number {
  const t = Number(config?.total);
  return Number.isFinite(t) && t > 0 ? t : ALLOCATION_DEFAULT_TOTAL;
}

export function allocated(answer: PV2Answer): number {
  return Object.values(answer.allocation ?? {}).reduce((s, n) => s + n, 0);
}

/** A timed_task / information_selection with options behaves like a choice list. */
function hasOptions(p: PV2Prompt) {
  return p.options.length > 0;
}

/** Sensible starting state (ranking starts in the served order, slider mid-way). */
export function initialAnswer(p: PV2Prompt): PV2Answer {
  if (p.type === 'ranking') return { ranking: p.options.map((o) => o.code) };
  if (p.type === 'confidence_slider') {
    const { min, max } = sliderBounds(p.config);
    return { value: Math.round((min + max) / 2) };
  }
  if (p.type === 'resource_allocation') {
    return { allocation: Object.fromEntries(p.options.map((o) => [o.code, 0])) };
  }
  return {};
}

export function isAnswerComplete(p: PV2Prompt, a: PV2Answer, opts: { timedOut?: boolean } = {}): boolean {
  if (opts.timedOut && p.type === 'timed_task') return true; // never trap the user past the clock
  switch (p.type) {
    case 'forced_choice':
    case 'situational_judgment':
      return !!a.choice;
    case 'multi_select':
    case 'information_selection': {
      const min = Number.isFinite(p.config?.minSelections) ? Number(p.config!.minSelections) : 1;
      return (a.multi?.length ?? 0) >= min;
    }
    case 'ranking':
      return (a.ranking?.length ?? 0) === p.options.length && p.options.length > 0;
    case 'confidence_slider':
      return typeof a.value === 'number';
    case 'resource_allocation':
      return allocated(a) === allocationTotal(p.config);
    case 'open_response':
      return (a.text ?? '').trim().length > 0;
    case 'timed_task':
      return hasOptions(p) ? !!a.choice : (a.text ?? '').trim().length > 0;
    default:
      // unknown future type: fall back to whatever the options suggest
      return hasOptions(p) ? !!a.choice : (a.text ?? '').trim().length > 0;
  }
}

/** The JSON body sent as `response`. */
export function buildResponse(p: PV2Prompt, a: PV2Answer): Record<string, any> {
  if (SINGLE_TYPES.includes(p.type)) return { optionCode: a.choice };
  switch (p.type) {
    case 'multi_select':
      return { optionCodes: a.multi ?? [] };
    case 'information_selection':
      return { optionCodes: a.multi ?? [] };
    case 'ranking':
      return { ranking: a.ranking ?? [] };
    case 'confidence_slider':
      return { value: a.value };
    case 'resource_allocation': {
      const allocation = Object.fromEntries(Object.entries(a.allocation ?? {}).filter(([, n]) => n > 0));
      return { allocation };
    }
    case 'open_response':
      return { text: (a.text ?? '').trim() };
    case 'timed_task':
      return hasOptions(p) ? { optionCode: a.choice } : { text: (a.text ?? '').trim() };
    default:
      return hasOptions(p) ? { optionCode: a.choice } : { text: (a.text ?? '').trim() };
  }
}

export function moveInRanking(order: string[], index: number, dir: -1 | 1): string[] {
  const j = index + dir;
  if (j < 0 || j >= order.length) return order;
  const next = [...order];
  [next[index], next[j]] = [next[j], next[index]];
  return next;
}

export function stepAllocation(
  a: PV2Answer, code: string, delta: number, total: number,
): PV2Answer {
  const current = a.allocation ?? {};
  const cur = current[code] ?? 0;
  const room = total - allocated(a);
  const next = Math.max(0, Math.min(cur + delta, cur + room));
  return { ...a, allocation: { ...current, [code]: next } };
}

export function toggleMulti(list: string[] | undefined, code: string, max?: number): string[] {
  const cur = list ?? [];
  if (cur.includes(code)) return cur.filter((c) => c !== code);
  if (max && cur.length >= max) return cur;
  return [...cur, code];
}

/** "root_cause_reasoning" / "Root cause" → "Root Cause Reasoning". */
export function humanizeKey(key?: string | null): string {
  if (!key) return '';
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
