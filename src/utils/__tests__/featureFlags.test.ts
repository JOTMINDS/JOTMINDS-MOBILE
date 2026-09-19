import { resolveFlag } from '../featureFlags';

jest.mock('../supabase', () => ({ callEdgeFn: jest.fn() }));
jest.mock('react-native', () => ({}));

describe('feature flags', () => {
  it('fails open for unknown or unloaded flags', () => {
    expect(resolveFlag({}, 'brain-gym')).toBe(true);
  });
  it('respects an explicit false', () => {
    expect(resolveFlag({ 'brain-gym': false }, 'brain-gym')).toBe(false);
    expect(resolveFlag({ 'brain-gym': false }, 'ai-coach')).toBe(true);
  });
});
