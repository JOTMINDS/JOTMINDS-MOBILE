import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { callEdgeFn } from './supabase';

/**
 * Offline outbox — queues write requests locally and replays them when the
 * device reconnects, so users can log check-ins (etc.) without connectivity.
 */
const KEY = 'jotminds.outbox';

export interface OutboxItem {
  id: string;
  endpoint: string;
  method: string;
  body: any;
  type: string; // e.g. 'checkin' — for UI grouping
  queuedAt: number;
}

type Listener = (count: number) => void;
const listeners = new Set<Listener>();

async function read(): Promise<OutboxItem[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function write(items: OutboxItem[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(items));
  listeners.forEach((l) => l(items.length));
}

export async function pendingCount(): Promise<number> {
  return (await read()).length;
}

export function subscribePending(l: Listener): () => void {
  listeners.add(l);
  read().then((items) => l(items.length));
  return () => listeners.delete(l);
}

export async function enqueue(item: Omit<OutboxItem, 'id' | 'queuedAt'>): Promise<void> {
  const items = await read();
  items.push({ ...item, id: `${Date.now()}_${Math.random().toString(36).slice(2)}`, queuedAt: Date.now() });
  await write(items);
}

let flushing = false;

/** Replay queued requests in order. Stops on the first failure (still offline). */
export async function flushOutbox(): Promise<void> {
  if (flushing) return;
  flushing = true;
  try {
    let items = await read();
    while (items.length > 0) {
      const item = items[0];
      try {
        await callEdgeFn(item.endpoint, { method: item.method, body: JSON.stringify(item.body) });
        items = items.slice(1);
        await write(items);
      } catch {
        break; // still failing → leave the rest queued
      }
    }
  } finally {
    flushing = false;
  }
}

function isNetworkError(err: any): boolean {
  const m = String(err?.message ?? err);
  return m.includes('Network request failed') || m.includes('Failed to fetch') || m.includes('timeout');
}

/**
 * Send a write online; if the network is unavailable, queue it for later.
 * Returns { queued: true } when it was stored for offline sync.
 */
export async function submitWithOutbox(
  endpoint: string,
  body: any,
  type: string,
): Promise<{ queued: boolean; data?: any }> {
  try {
    const data = await callEdgeFn(endpoint, { method: 'POST', body: JSON.stringify(body) });
    return { queued: false, data };
  } catch (err) {
    if (isNetworkError(err)) {
      await enqueue({ endpoint, method: 'POST', body, type });
      return { queued: true };
    }
    throw err; // real server error — surface it
  }
}

/** Call once at app start: flush now, and flush whenever connectivity returns. */
export function initOutboxSync(): () => void {
  flushOutbox();
  const unsub = NetInfo.addEventListener((state) => {
    if (state.isConnected) flushOutbox();
  });
  return unsub;
}
