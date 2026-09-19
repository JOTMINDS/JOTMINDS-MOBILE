import { callEdgeFn } from './supabase';
import { submitWithOutbox } from './outbox';

/** Reflections & notes — the webapp's `/reflection` routes (server-synced, per user). */
export interface Reflection {
  id: string;
  content: string;
  assessmentResultId?: string | null;
  createdAt: string;
}

export async function getReflections(): Promise<Reflection[]> {
  const res = await callEdgeFn('/reflection');
  return Array.isArray(res?.reflections) ? res.reflections : [];
}

/** Saves a reflection; queues it for later if the device is offline. */
export async function saveReflection(content: string, assessmentResultId?: string): Promise<{ queued: boolean; reflection?: Reflection }> {
  const r = await submitWithOutbox('/reflection', { content: content.trim(), assessmentResultId }, 'reflection');
  return { queued: r.queued, reflection: r.data?.reflection };
}

/** In-app feedback becomes a support ticket (visible in the admin Support Center). */
export interface FeedbackInput { rating: number; category: string; message: string; role?: string }

export const FEEDBACK_CATEGORIES = ['User Experience', 'Assessments', 'AI features', 'Bug report', 'Other'];

export function buildTicket(f: FeedbackInput, platform: string): { subject: string; message: string } {
  return {
    subject: `[App feedback] ${f.category} · ${f.rating}/5`,
    message: `${f.message.trim()}\n\n— ${f.role ?? 'user'} · mobile (${platform})`,
  };
}

export async function sendFeedback(f: FeedbackInput, platform: string): Promise<{ queued: boolean }> {
  const r = await submitWithOutbox('/superadmin/tickets', buildTicket(f, platform), 'feedback');
  return { queued: r.queued };
}
