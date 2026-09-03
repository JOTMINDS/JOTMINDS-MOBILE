jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

import { roleKey, buildDailyTasks } from '../adaptationTasks';

describe('roleKey', () => {
  it('slugs a role name', () => {
    expect(roleKey('Product Manager')).toBe('product-manager');
    expect(roleKey('  Data / Analyst!! ')).toBe('data-analyst-');
  });
});

describe('buildDailyTasks', () => {
  const dims = [
    { dim: 'analyticalDepth', focus: 'Analytical Depth', icon: '🔍', actions: ['a1', 'a2'] },
    { dim: 'decisionSpeed', focus: 'Decision Speed', icon: '⚡', actions: ['b1', 'b2', 'b3'] },
  ];

  it('emits one task per gap dimension with a stable id', () => {
    const tasks = buildDailyTasks('pm', dims);
    expect(tasks).toHaveLength(2);
    expect(tasks[0].id).toMatch(/^pm:analyticalDepth:\d$/);
    expect(tasks[0].focus).toBe('Analytical Depth');
    expect(dims[0].actions).toContain(tasks[0].text);
  });

  it('picks the action by day so it rotates but is stable within a day', () => {
    const a = buildDailyTasks('pm', dims);
    const b = buildDailyTasks('pm', dims);
    expect(a.map((t) => t.id)).toEqual(b.map((t) => t.id));
  });
});
