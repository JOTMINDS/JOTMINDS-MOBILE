import { tabsForUser, hiddenTabsForUser } from '../tabsForUser';

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

  it('gives teachers the webapp Educator Portal menu, in order', () => {
    expect(tabsForUser({ role: 'teacher' })).toEqual(['Home', 'Students', 'PreSchool', 'Analytics', 'Planner', 'Insights']);
  });

  it('keeps Discover, Mind and Profile reachable for teachers without putting them on the bar', () => {
    expect(hiddenTabsForUser({ role: 'teacher' })).toEqual(['Discover', 'MindHome', 'Profile']);
    const visible = tabsForUser({ role: 'teacher' });
    hiddenTabsForUser({ role: 'teacher' }).forEach((t) => expect(visible).not.toContain(t));
  });

  it('has no hidden tabs for other roles, which keep Home first and Profile last', () => {
    for (const role of ['parent', 'professional', 'student', undefined]) {
      expect(hiddenTabsForUser({ role })).toEqual([]);
      const tabs = tabsForUser({ role });
      expect(tabs[0]).toBe('Home');
      expect(tabs[tabs.length - 1]).toBe('Profile');
    }
    expect(tabsForUser(null)).toEqual(tabsForUser({ role: 'student' }));
  });
});
