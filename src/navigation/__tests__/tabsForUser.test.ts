import { tabsForUser } from '../tabsForUser';

describe('tabsForUser', () => {
  it('shows Role Fit only to professionals and older students', () => {
    expect(tabsForUser({ role: 'professional' })).toContain('RoleFit');
    expect(tabsForUser({ role: 'student', educationLevel: 'SHS' })).toContain('RoleFit');
    expect(tabsForUser({ role: 'teacher' })).not.toContain('RoleFit');
    expect(tabsForUser({ role: 'parent' })).not.toContain('RoleFit');
  });

  it('hides careers from elementary and early-years learners', () => {
    expect(tabsForUser({ role: 'student', educationLevel: 'Elementary' })).toEqual(['Home', 'Discover', 'MindHome', 'Profile']);
    expect(tabsForUser({ role: 'student', age: 8 })).not.toContain('RoleFit');
    expect(tabsForUser({ role: 'student', educationLevel: 'Pre-school' })).not.toContain('RoleFit');
  });

  it('gives teachers the Lesson Planner, like the webapp portal', () => {
    expect(tabsForUser({ role: 'teacher' })).toEqual(['Home', 'Planner', 'Discover', 'MindHome', 'Profile']);
  });

  it('always keeps Home and Profile, and treats an unknown role as a student', () => {
    for (const role of ['teacher', 'parent', 'professional', 'student', undefined]) {
      const tabs = tabsForUser({ role });
      expect(tabs[0]).toBe('Home');
      expect(tabs[tabs.length - 1]).toBe('Profile');
    }
    expect(tabsForUser(null)).toEqual(tabsForUser({ role: 'student' }));
  });
});
