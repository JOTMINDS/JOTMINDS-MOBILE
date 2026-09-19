const mockCallEdgeFn = jest.fn();

jest.mock('../supabase', () => ({
  callEdgeFn: (...a: any[]) => mockCallEdgeFn(...a),
  supabase: { auth: { setSession: jest.fn() } },
}));

import { signInWithCode } from '../studentCodeAuth';
import { signInWithStudentCode, validateStudentCode } from '../api';

beforeEach(() => jest.clearAllMocks());

describe('student code API', () => {
  it('normalises the code (trim + uppercase) for validate', async () => {
    mockCallEdgeFn.mockResolvedValue({ valid: true, studentName: 'Ama' });
    await validateStudentCode('  ab12cd ');
    expect(mockCallEdgeFn).toHaveBeenCalledWith('/student-code/validate', {
      method: 'POST', body: JSON.stringify({ code: 'AB12CD' }),
    });
  });

  it('normalises the code for sign-in', async () => {
    mockCallEdgeFn.mockResolvedValue({ session: {} });
    await signInWithStudentCode(' xy99zz');
    expect(mockCallEdgeFn).toHaveBeenCalledWith('/student-code/signin', {
      method: 'POST', body: JSON.stringify({ code: 'XY99ZZ' }),
    });
  });
});

describe('signInWithCode', () => {
  const ok = { session: { access_token: 'at', refresh_token: 'rt' } };

  it('hands the server-issued session to Supabase', async () => {
    const setSession = jest.fn().mockResolvedValue({ error: null });
    await signInWithCode('ABC123', { signIn: jest.fn().mockResolvedValue(ok), setSession });
    expect(setSession).toHaveBeenCalledWith({ access_token: 'at', refresh_token: 'rt' });
  });

  it('falls back to the access token when no refresh token is returned', async () => {
    const setSession = jest.fn().mockResolvedValue({ error: null });
    await signInWithCode('ABC123', { signIn: jest.fn().mockResolvedValue({ session: { access_token: 'at' } }), setSession });
    expect(setSession).toHaveBeenCalledWith({ access_token: 'at', refresh_token: 'at' });
  });

  it('fails clearly when the server returns no session', async () => {
    const setSession = jest.fn();
    await expect(signInWithCode('ABC123', { signIn: jest.fn().mockResolvedValue({}), setSession }))
      .rejects.toThrow('Could not sign in with that student code.');
    expect(setSession).not.toHaveBeenCalled();
  });

  it('propagates an invalid-code error from the server', async () => {
    const setSession = jest.fn();
    await expect(signInWithCode('BAD', { signIn: jest.fn().mockRejectedValue(new Error('Invalid code')), setSession }))
      .rejects.toThrow('Invalid code');
    expect(setSession).not.toHaveBeenCalled();
  });

  it('surfaces a setSession failure', async () => {
    const setSession = jest.fn().mockResolvedValue({ error: { message: 'bad token' } });
    await expect(signInWithCode('ABC123', { signIn: jest.fn().mockResolvedValue(ok), setSession }))
      .rejects.toThrow('bad token');
  });
});
