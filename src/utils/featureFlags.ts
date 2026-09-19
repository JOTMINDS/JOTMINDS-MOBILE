import { useEffect, useState } from 'react';
import { callEdgeFn } from './supabase';

/**
 * Server-driven feature flags (webapp Super Admin → Feature Flags).
 * GET /feature-flags/effective resolves per-user overrides, role and plan
 * rules to `{ [key]: boolean }`. Fail open: a flag that hasn't loaded, or a
 * failed fetch, counts as enabled so a network blip never hides a feature.
 *
 * Keys the platform gates today: 'ai-coach', 'brain-gym', 'daily-challenge'.
 */
export type FeatureKey = 'ai-coach' | 'brain-gym' | 'daily-challenge';

const STALE_MS = 5 * 60 * 1000;

let flags: Record<string, boolean> = {};
let loadedFor: string | null = null;
let loadedAt = 0;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

/** Pure resolver, exported for tests. */
export function resolveFlag(map: Record<string, boolean>, key: string): boolean {
  return map[key] !== false;
}

export function isFeatureEnabled(key: FeatureKey): boolean {
  return resolveFlag(flags, key);
}

export function resetFeatureFlags(): void {
  flags = {};
  loadedFor = null;
  loadedAt = 0;
  emit();
}

async function loadFlags(userId: string): Promise<void> {
  try {
    const res = await callEdgeFn('/feature-flags/effective', {}, 8000);
    if (res?.flags && typeof res.flags === 'object') {
      flags = res.flags;
      loadedFor = userId;
      loadedAt = Date.now();
      emit();
    }
  } catch {
    // fail open — keep whatever we had
  }
}

function ensureFlags(userId: string): void {
  if (loadedFor !== userId) {
    // Different account than the cached flags — don't leak the previous user's.
    flags = {};
    loadedFor = null;
  } else if (Date.now() - loadedAt < STALE_MS) {
    return;
  }
  if (!inflight) {
    inflight = loadFlags(userId).finally(() => { inflight = null; });
  }
}

/** Live enabled state for one flag; refreshes at most every 5 minutes. */
export function useFeatureFlag(key: FeatureKey, userId?: string): boolean {
  const [, setTick] = useState(0);

  useEffect(() => {
    const l = () => setTick((t) => t + 1);
    listeners.add(l);
    if (userId) ensureFlags(userId);
    return () => { listeners.delete(l); };
  }, [userId]);

  return isFeatureEnabled(key);
}
