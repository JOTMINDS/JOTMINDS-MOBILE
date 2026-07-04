import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://femvnconxoefpctiptkj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbXZuY29ueG9lZnBjdGlwdGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTY1ODMsImV4cCI6MjA3ODAzMjU4M30.kmYrjWIfgzXZuLda3D8LjqL6V20DBgo8fkHsnIdQLGA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Edge Function base URL (same as webapp backend — verified live via deployed functions list)
export const EDGE_FN_URL = `${SUPABASE_URL}/functions/v1/make-server-fc8eb847`;

export async function callEdgeFn(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs = 20000,
): Promise<any> {
  // Getting the session shouldn't hang, but guard it so a stalled auth read
  // can't freeze the whole request forever.
  let token = SUPABASE_ANON_KEY;
  try {
    const { data: { session } } = await Promise.race([
      supabase.auth.getSession(),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000)),
    ]) as any;
    token = session?.access_token ?? SUPABASE_ANON_KEY;
  } catch {
    // fall back to anon key — the request itself will 401 if auth was required
  }

  // Hard timeout so a stalled network never leaves the UI spinning forever.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${EDGE_FN_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers ?? {}),
      },
    });
    // Read as text first: gateway/5xx responses are often HTML or empty, and
    // res.json() would throw a misleading "JSON Parse error" over the real cause.
    const text = await res.text();
    let json: any = null;
    try { json = text ? JSON.parse(text) : null; } catch { /* non-JSON body */ }
    if (!res.ok) {
      throw new Error((json && json.error) || `Request failed (${res.status})`);
    }
    return json ?? {};
  } catch (e: any) {
    if (e?.name === 'AbortError') {
      throw new Error('Request timed out. Check your connection and try again.');
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

// ── OTP (email verification during signup) ──────────────────────────────────
// The Edge Function generates the 6-digit code server-side, stores it (10-min
// expiry), emails it via Resend, and verifies it. The client never sees/sets it.
export async function sendSignupOtp(email: string): Promise<void> {
  await callEdgeFn('/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
}

export async function verifySignupOtp(email: string, otp: string): Promise<boolean> {
  const res = await callEdgeFn('/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.trim() }),
  });
  return res.verified === true;
}
