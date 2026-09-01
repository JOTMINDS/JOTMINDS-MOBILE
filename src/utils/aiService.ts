/**
 * Thin client for the JotMinds AI endpoints.
 *
 * The webapp's src/app/utils/aiService.ts proxies OpenAI through a Cloudflare
 * Pages Function (`/api/openai`) that only exists in the web deployment. Mobile
 * has no such proxy, so it calls the structured `/ai/*` routes on the shared
 * Supabase edge function instead (already deployed — see supabase server
 * ai-routes.tsx). Same OpenAI key, same models, server-side.
 *
 * Every call degrades gracefully: on any error it resolves to `null` and the
 * caller falls back to the existing static content.
 */
import { callEdgeFn } from './supabase';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIInsights {
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  archetype: { name: string; tagline: string };
  summary: string;
}

// Slightly longer timeout than the default — model latency on a phone network.
const AI_TIMEOUT = 30000;

/**
 * One turn with the JotMinds AI Cognitive Coach ("Ask Jotti").
 * Backed by POST /ai/coach-chat.
 */
export async function askJotti(
  message: string,
  opts: {
    profile?: Record<string, any>;
    scores?: Record<string, any>;
    role?: string;
    algorithmicGuidance?: Record<string, any>;
    history?: ChatMessage[];
  } = {},
): Promise<string | null> {
  try {
    const res = await callEdgeFn(
      '/ai/coach-chat',
      {
        method: 'POST',
        body: JSON.stringify({
          message,
          profile: opts.profile,
          scores: opts.scores,
          role: opts.role,
          algorithmicGuidance: opts.algorithmicGuidance,
          history: opts.history ?? [],
        }),
      },
      AI_TIMEOUT,
    );
    return typeof res?.reply === 'string' ? res.reply : null;
  } catch {
    return null;
  }
}

/**
 * Freeform chat against the JotMinds AI Learning Coach.
 * Backed by POST /ai/chat. `messages` is the running transcript.
 */
export async function sendAIChat(
  messages: ChatMessage[],
  userProfile?: Record<string, any>,
): Promise<string | null> {
  try {
    const res = await callEdgeFn(
      '/ai/chat',
      { method: 'POST', body: JSON.stringify({ messages, userProfile }) },
      AI_TIMEOUT,
    );
    return typeof res?.reply === 'string' ? res.reply : null;
  } catch {
    return null;
  }
}

/**
 * AI-personalized insights for an assessment result.
 * Backed by POST /ai/generate-insights. Returns null on any failure so the
 * caller keeps its algorithmic strengths/weaknesses.
 */
export async function generateAIInsights(params: {
  scores: Record<string, any>;
  type?: string;
  role?: string;
  algorithmicGuidance?: Record<string, any>;
  context?: Record<string, any>;
}): Promise<AIInsights | null> {
  try {
    const res = await callEdgeFn(
      '/ai/generate-insights',
      { method: 'POST', body: JSON.stringify(params) },
      AI_TIMEOUT,
    );
    if (res && Array.isArray(res.strengths) && res.archetype) return res as AIInsights;
    return null;
  } catch {
    return null;
  }
}

/**
 * AI professional-development recommendations for a JTIA report.
 * Backed by POST /ai/generate-jtia-insights. Shape mirrors
 * JTIAReportData['recommendations'] so it can be swapped in directly.
 */
export async function generateJTIAAIRecommendations(
  report: Record<string, any>,
): Promise<{ resources: string[]; activities: string[]; coaching: string[]; pathways: string[] } | null> {
  try {
    const res = await callEdgeFn(
      '/ai/generate-jtia-insights',
      { method: 'POST', body: JSON.stringify({ report }) },
      AI_TIMEOUT,
    );
    if (res && Array.isArray(res.resources)) return res;
    return null;
  } catch {
    return null;
  }
}
