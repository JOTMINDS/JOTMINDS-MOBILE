jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn(),
}));
jest.mock('../supabase', () => ({ callEdgeFn: jest.fn() }));

import { PV2EventRecorder } from '../professionalV2Api';

const fixedNow = () => new Date('2026-09-19T10:00:00Z');

describe('PV2EventRecorder', () => {
  it('numbers events monotonically and stamps them', async () => {
    const send = jest.fn().mockResolvedValue(undefined);
    const r = new PV2EventRecorder('s1', send, fixedNow);
    r.record('viewed', 'i1');
    r.record('selected', 'i1', { code: 'A' });
    await r.flush();
    const batch = send.mock.calls[0][1];
    expect(batch.map((e: any) => e.clientSequence)).toEqual([0, 1]);
    expect(batch[0].clientTimestamp).toBe('2026-09-19T10:00:00.000Z');
    expect(r.pending).toBe(0);
  });

  it('keeps events when a flush fails and retries them later, in order', async () => {
    const send = jest.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(undefined);
    const r = new PV2EventRecorder('s1', send, fixedNow);
    r.record('viewed', 'i1');
    await r.flush();
    expect(r.pending).toBe(1);
    r.record('selected', 'i1');
    await r.flush();
    expect(r.pending).toBe(0);
    expect(send.mock.calls[1][1].map((e: any) => e.clientSequence)).toEqual([0, 1]);
  });

  it('never sends more than 200 events per request', async () => {
    const send = jest.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(undefined);
    const r = new PV2EventRecorder('s1', send, fixedNow);
    for (let i = 0; i < 450; i++) r.record('viewed', 'i1');
    await r.flush(); // settles the failed auto-flush; events are kept
    await r.flush(); // now everything drains
    const sizes = send.mock.calls.slice(1).map((c) => c[1].length);
    expect(Math.max(...sizes)).toBeLessThanOrEqual(200);
    expect(sizes.reduce((a, b) => a + b, 0)).toBe(450);
    expect(r.pending).toBe(0);
  });

  it('drops the oldest events when the buffer overflows offline', async () => {
    const send = jest.fn().mockRejectedValue(new Error('offline'));
    const r = new PV2EventRecorder('s1', send, fixedNow);
    for (let i = 0; i < 700; i++) r.record('viewed');
    await r.flush();
    expect(r.pending).toBeLessThanOrEqual(600);
  });
});
