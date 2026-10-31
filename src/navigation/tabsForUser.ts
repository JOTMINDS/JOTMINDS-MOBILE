import { assessmentBand } from '../utils/assessmentBand';

/**
 * Bottom-menu tabs per role, following the webapp's portals (each role there has its own
 * menu) instead of one shared menu. Role Fit is professional content, so it only shows
 * for professionals; older students get it as "Careers" (matches and dream careers,
 * without the role-builder). Teachers get the Lesson Planner, the webapp's main teacher tool.
 */
export type TabKey = 'Home' | 'Planner' | 'Discover' | 'MindHome' | 'RoleFit' | 'Profile';

export function tabsForUser(user?: { role?: string; age?: number | null; educationLevel?: string | null } | null): TabKey[] {
  switch (user?.role) {
    case 'teacher':
      return ['Home', 'Planner', 'Discover', 'MindHome', 'Profile'];
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
