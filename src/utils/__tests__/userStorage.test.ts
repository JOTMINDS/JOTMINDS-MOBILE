const store: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (k: string) => (k in store ? store[k] : null)),
  setItem: jest.fn(async (k: string, v: string) => { store[k] = v; }),
  removeItem: jest.fn(async (k: string) => { delete store[k]; }),
}));
let uid: string | null = 'u1';
jest.mock('../supabase', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: uid ? { user: { id: uid } } : null } }) } },
}));
import { readScoped, writeScoped } from '../userStorage';

beforeEach(() => { Object.keys(store).forEach((k) => delete store[k]); uid = 'u1'; });

describe('userStorage', () => {
  it('keeps users separate', async () => {
    await writeScoped('k', 'a');
    uid = 'u2';
    expect(await readScoped('k')).toBeNull();
    await writeScoped('k', 'b');
    uid = 'u1';
    expect(await readScoped('k')).toBe('a');
  });
  it('first user adopts legacy unscoped data, which is then removed', async () => {
    store.k = 'legacy';
    expect(await readScoped('k')).toBe('legacy');
    expect(store.k).toBeUndefined();
    uid = 'u2';
    expect(await readScoped('k')).toBeNull();
  });
});
