const mockSubmit = jest.fn();
const mockCall = jest.fn();
jest.mock('../outbox', () => ({ submitWithOutbox: (...a: any[]) => mockSubmit(...a) }));
jest.mock('../supabase', () => ({ callEdgeFn: (...a: any[]) => mockCall(...a) }));

import { buildTicket, saveReflection, sendFeedback, getReflections } from '../reflectionsApi';

beforeEach(() => { mockSubmit.mockReset(); mockCall.mockReset(); });

describe('feedback → support ticket', () => {
  it('builds a subject with category and rating and tags the role/platform', () => {
    const t = buildTicket({ rating: 4, category: 'Bug report', message: '  It crashed  ', role: 'teacher' }, 'android');
    expect(t.subject).toBe('[App feedback] Bug report · 4/5');
    expect(t.message).toBe('It crashed\n\n— teacher · mobile (android)');
  });
  it('posts to the tickets route through the offline outbox', async () => {
    mockSubmit.mockResolvedValue({ queued: true });
    expect(await sendFeedback({ rating: 5, category: 'Other', message: 'hi' }, 'ios')).toEqual({ queued: true });
    expect(mockSubmit.mock.calls[0][0]).toBe('/superadmin/tickets');
    expect(mockSubmit.mock.calls[0][2]).toBe('feedback');
  });
});

describe('reflections', () => {
  it('saves trimmed content via the outbox and returns the stored reflection', async () => {
    mockSubmit.mockResolvedValue({ queued: false, data: { reflection: { id: 'r1', content: 'x', createdAt: 'now' } } });
    const r = await saveReflection('  x  ', 'res1');
    expect(mockSubmit).toHaveBeenCalledWith('/reflection', { content: 'x', assessmentResultId: 'res1' }, 'reflection');
    expect(r.reflection?.id).toBe('r1');
  });
  it('reports a queued (offline) save', async () => {
    mockSubmit.mockResolvedValue({ queued: true });
    expect((await saveReflection('note')).queued).toBe(true);
  });
  it('lists reflections and tolerates a malformed response', async () => {
    mockCall.mockResolvedValueOnce({ reflections: [{ id: 'a' }] });
    expect(await getReflections()).toEqual([{ id: 'a' }]);
    mockCall.mockResolvedValueOnce({});
    expect(await getReflections()).toEqual([]);
  });
});
