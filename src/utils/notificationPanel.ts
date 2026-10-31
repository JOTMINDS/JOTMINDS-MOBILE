import { insightsFor, DiscoverAudience, DiscoverInsight } from '../data/discoverContent';

/**
 * Pieces of the Notifications panel beyond the nudge feed: things to fix on the account, and a
 * couple of reading suggestions.
 */
export interface AccountNotice {
  id: string;
  icon: string;
  title: string;
  /** A screen in the root stack (or a tab) to open. */
  route: string;
  params?: Record<string, any>;
}

type U = {
  role?: string; avatarUrl?: string; school?: string; educationLevel?: string; age?: number | null; parentPin?: string;
} | null | undefined;

export function accountNotices(user: U): AccountNotice[] {
  if (!user) return [];
  const out: AccountNotice[] = [];
  if (!user.avatarUrl) out.push({ id: 'photo', icon: '📷', title: 'Add a profile photo', route: 'Profile' });
  if ((user.role === 'teacher' || user.role === 'student') && !user.school) {
    out.push({ id: 'school', icon: '🏫', title: 'Add your school', route: 'EditProfile' });
  }
  if (user.role === 'student' && !user.educationLevel) {
    out.push({ id: 'level', icon: '🎓', title: 'Choose your education level', route: 'EditProfile' });
  }
  const kid = user.role === 'student' && typeof user.age === 'number' && user.age >= 6 && user.age <= 10;
  if (kid && !user.parentPin) out.push({ id: 'pin', icon: '🔒', title: 'Ask a parent to set a PIN', route: 'Home' });
  return out;
}

/** Up to `n` articles for the audience, rotating daily so the panel isn't the same every visit. */
export function resourcePicks(audience: DiscoverAudience, n = 2, now: Date = new Date()): DiscoverInsight[] {
  const all = insightsFor(audience);
  if (all.length === 0) return [];
  const day = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 86_400_000);
  return Array.from({ length: Math.min(n, all.length) }, (_, i) => all[(day + i) % all.length]);
}
