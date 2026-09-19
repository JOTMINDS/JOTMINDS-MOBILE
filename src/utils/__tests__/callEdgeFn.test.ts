const mockGetSession = jest.fn();
const mockRefreshSession = jest.fn();

jest.mock('react-native-url-polyfill/auto', () => ({}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn(),
}));
jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ auth: {
      // lazy: imports are hoisted above the const declarations
      getSession: (...a: any[]) => mockGetSession(...a),
      refreshSession: (...a: any[]) => mockRefreshSession(...a),
    } }),
}));

import { callEdgeFn } from '../supabase';

const res = (status: number, body: any) => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => (body === undefined ? '' : typeof body === 'string' ? body : JSON.stringify(body)),
});

const fetchMock = jest.fn();
(global as any).fetch = fetchMock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('callEdgeFn auth', () => {
  it('sends the signed-in user\'s access token', async () => {
    mockGetSession.mockResolvedValue({ data: { session: { access_token: 'user-jwt' } } });
    fetchMock.mockResolvedValue(res(200, { ok: true }));
    await callEdgeFn('/session');
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer user-jwt');
  });

  it('falls back to the anon key when signed out', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    fetchMock.mockResolvedValue(res(200, {}));
    await callEdgeFn('/signup', { method: 'POST' });
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toMatch(/^Bearer eyJ/);
  });

  it('refreshes the session and retries once on a 401 while signed in', async () => {
    mockGetSession
      .mockResolvedValueOnce({ data: { session: { access_token: 'expired' } } })
      .mockResolvedValueOnce({ data: { session: { access_token: 'fresh' } } });
    mockRefreshSession.mockResolvedValue({ error: null });
    fetchMock.mockResolvedValueOnce(res(401, { error: 'Unauthorized' })).mockResolvedValueOnce(res(200, { user: 1 }));
    await expect(callEdgeFn('/session')).resolves.toEqual({ user: 1 });
    expect(mockRefreshSession).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe('Bearer fresh');
  });

  it('does not retry forever: a second 401 surfaces the server error', async () => {
    mockGetSession.mockResolvedValue({ data: { session: { access_token: 'bad' } } });
    mockRefreshSession.mockResolvedValue({ error: null });
    fetchMock.mockResolvedValue(res(401, { error: 'Unauthorized' }));
    await expect(callEdgeFn('/session')).rejects.toThrow('Unauthorized');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not attempt a refresh when signed out (e.g. a wrong student code)', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    fetchMock.mockResolvedValue(res(401, { error: 'Invalid code' }));
    await expect(callEdgeFn('/auth/student-code', { method: 'POST' })).rejects.toThrow('Invalid code');
    expect(mockRefreshSession).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('surfaces the original error if the refresh itself fails', async () => {
    mockGetSession.mockResolvedValue({ data: { session: { access_token: 'x' } } });
    mockRefreshSession.mockResolvedValue({ error: new Error('refresh failed') });
    fetchMock.mockResolvedValue(res(401, { error: 'Unauthorized' }));
    await expect(callEdgeFn('/session')).rejects.toThrow('Unauthorized');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('reports a readable error for non-JSON gateway failures', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    fetchMock.mockResolvedValue(res(502, '<html>Bad gateway</html>'));
    await expect(callEdgeFn('/x')).rejects.toThrow('Request failed (502)');
  });
});
