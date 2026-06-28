import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, callEdgeFn } from '../utils/supabase';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  school?: string;
  position?: string;
  organizationName?: string;
  dateOfBirth?: string;
  age?: number;
  assessmentsCompleted?: string[];
  subscriptionStatus?: 'free' | 'premium' | 'organization';
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  requestLoginOtp: (email: string) => Promise<void>;
  verifyLoginOtp: (email: string, token: string) => Promise<void>;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  role: string;
  phone?: string;
  school?: string;
  educationLevel?: string;
  organizationName?: string;
  organizationType?: string;
  position?: string;
  department?: string;
  organizationCode?: string;
  dateOfBirth?: string;
  hasConsented: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const calculateAge = (dob: string): number => {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

async function fetchProfile(supabaseUser: SupabaseUser): Promise<AppUser> {
  try {
    // /session returns the authenticated user's full profile from the KV store
    const data = await callEdgeFn('/session');
    const profile = data.user ?? data;
    return {
      id: supabaseUser.id,
      email: supabaseUser.email ?? '',
      name: profile.name ?? profile.full_name ?? supabaseUser.email ?? '',
      role: profile.user_role ?? profile.role ?? 'student',
      phone: profile.phone,
      school: profile.school,
      position: profile.position,
      organizationName: profile.organizationName ?? profile.organization,
      dateOfBirth: profile.dateOfBirth ?? profile.date_of_birth,
      age: profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : profile.age,
      assessmentsCompleted: profile.assessmentsCompleted ?? [],
      subscriptionStatus: profile.subscriptionStatus ?? profile.subscription_status ?? 'free',
    };
  } catch {
    // Fallback: build minimal profile from Supabase user metadata
    const meta = supabaseUser.user_metadata ?? {};
    return {
      id: supabaseUser.id,
      email: supabaseUser.email ?? '',
      name: meta.name ?? meta.full_name ?? '',
      role: meta.user_role ?? meta.role ?? 'student',
      subscriptionStatus: 'free',
      assessmentsCompleted: [],
    };
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    // Fail-safe: never let the loader/splash hang forever. If getSession or the
    // network stalls (or a stored token is unusable), fall through to Welcome.
    const failSafe = setTimeout(() => { if (mounted) setLoading(false); }, 6000);
    const done = () => { if (mounted) { clearTimeout(failSafe); setLoading(false); } };

    supabase.auth.getSession()
      .then(({ data: { session: s } }) => {
        if (!mounted) return;
        setSession(s);
        if (s?.user) {
          fetchProfile(s.user)
            .then((p) => { if (mounted) setUser(p); })
            .finally(done);
        } else {
          done();
        }
      })
      .catch(done); // getSession rejected — don't strand the user on a blank screen

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      if (!mounted) return;
      setSession(s);
      if (s?.user) {
        try {
          const profile = await fetchProfile(s.user);
          if (mounted) setUser(profile);
        } catch { /* keep any existing user; profile fetch can retry later */ }
      } else {
        setUser(null);
      }
      done();
    });

    return () => { mounted = false; clearTimeout(failSafe); subscription.unsubscribe(); };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  };

  const signUp = async (data: SignUpData) => {
    // Use the webapp's /signup route — it creates the auth user + KV profile
    // and handles org-code linking, keeping mobile signups identical to web.
    const isMinor =
      data.role === 'student' && data.dateOfBirth
        ? new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear() < 18
        : false;

    await callEdgeFn('/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
        phone: data.phone,
        school: data.school,
        educationLevel: data.educationLevel,
        organizationName: data.organizationName,
        organizationType: data.organizationType,
        position: data.position,
        department: data.department,
        organizationCode: data.organizationCode
          ? data.organizationCode.toUpperCase()
          : undefined,
        dateOfBirth: data.dateOfBirth,
        hasConsented: data.hasConsented,
        // Matches the webapp: 'individual' for normal users, 'parental' for minors
        consentType: isMinor ? 'parental' : 'individual',
        consentDate: new Date().toISOString(),
      }),
    });
  };

  // Passwordless login — Supabase sends a 6-digit email OTP and verifying it
  // returns a real session (handled by the onAuthStateChange listener above).
  const requestLoginOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: false },
    });
    if (error) throw new Error(error.message);
  };

  const verifyLoginOtp = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      type: 'email',
    });
    if (error) throw new Error(error.message);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const refreshUser = async () => {
    const { data: { session: s } } = await supabase.auth.getSession();
    if (s?.user) {
      const profile = await fetchProfile(s.user);
      setUser(profile);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, refreshUser, requestLoginOtp, verifyLoginOtp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
