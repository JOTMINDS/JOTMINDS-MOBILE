import { signInWithStudentCode as signInWithStudentCodeApi } from './api';
import { supabase } from './supabase';

interface Deps {
  signIn: typeof signInWithStudentCodeApi;
  setSession: (s: { access_token: string; refresh_token: string }) => Promise<{ error: { message: string } | null }>;
}

const defaultDeps: Deps = {
  signIn: signInWithStudentCodeApi,
  setSession: (s) => supabase.auth.setSession(s) as any,
};

/**
 * Institutional sign-in: exchange a school-issued student code for a real
 * Supabase session. The server verifies the code and returns the session;
 * setSession then triggers onAuthStateChange, which loads the profile like any
 * other sign-in. Throws a user-presentable Error on any failure.
 */
export async function signInWithCode(code: string, deps: Deps = defaultDeps): Promise<void> {
  const res = await deps.signIn(code);
  const session = res?.session;
  if (!session?.access_token) {
    throw new Error('Could not sign in with that student code.');
  }
  const { error } = await deps.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token ?? session.access_token,
  });
  if (error) throw new Error(error.message);
}
