import { assessmentBand } from '../utils/assessmentBand';

/**
 * Bottom-menu tabs per role, following the webapp's portals (each role there has its own menu)
 * instead of one shared menu.
 *  - Teachers get the webapp's Educator Portal menu: Home, My Students, Pre School, Analytics,
 *    Lesson Planner, Teaching Insights. Discover, Mind and Profile stay reachable (Home cards and
 *    the header profile button) but are kept off the bar.
 *  - Role Fit is professional content, so only professionals see it; older students get it as
 *    "Careers" (matches and dream careers, without the role builder).
 */
export type TabKey =
  | 'Home' | 'Students' | 'PreSchool' | 'Analytics' | 'Planner' | 'Insights'
  | 'Discover' | 'MindHome' | 'RoleFit' | 'Profile';

type U = { role?: string; age?: number | null; educationLevel?: string | null } | null | undefined;

export function tabsForUser(user?: U): TabKey[] {
  switch (user?.role) {
    case 'teacher':
      return ['Home', 'Students', 'PreSchool', 'Analytics', 'Planner', 'Insights'];
    case 'parent':
      return ['Home', 'Discover', 'MindHome', 'Profile'];
    case 'professional':
      return ['Home', 'Discover', 'MindHome', 'RoleFit', 'Profile'];
    default: {
      // Students: no careers tab for elementary and early-years learners.
      const younger = assessmentBand(user) === 'kids';
      return younger ? ['Home', 'Discover', 'MindHome', 'Profile'] : ['Home', 'Discover', 'MindHome', 'RoleFit', 'Profile'];
    }
  }
}

/** Screens that stay navigable (e.g. from Home cards) but have no button on the bar. */
export function hiddenTabsForUser(user?: U): TabKey[] {
  return user?.role === 'teacher' ? ['Discover', 'MindHome', 'Profile'] : [];
}
