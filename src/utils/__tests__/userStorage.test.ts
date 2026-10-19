const mockStore: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (k: string) => (k in mockStore ? mockStore[k] : null)),
  setItem: jest.fn(async (k: string, v: string) => { mockStore[k] = v; }),
  removeItem: jest.fn(async (k: string) => { delete mockStore[k]; }),
}));
let mockUid: string | null = 'u1';
jest.mock('../supabase', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: mockUid ? { user: { id: mockUid } } : null } }) } },
}));
import { readScoped, writeScoped } from '../userStorage';

beforeEach(() => { Object.keys(mockStore).forEach((k) => delete mockStore[k]); mockUid = 'u1'; });

describe('userStorage', () => {
  it('keeps users separate', async () => {
    await writeScoped('k', 'a');
    mockUid = 'u2';
    expect(await readScoped('k')).toBeNull();
    await writeScoped('k', 'b');
    mockUid = 'u1';
    expect(await readScoped('k')).toBe('a');
  });
  it('first user adopts legacy unscoped data, which is then removed', async () => {
    mockStore.k = 'legacy';
    expect(await readScoped('k')).toBe('legacy');
    expect(mockStore.k).toBeUndefined();
    mockUid = 'u2';
    expect(await readScoped('k')).toBeNull();
  });
});
