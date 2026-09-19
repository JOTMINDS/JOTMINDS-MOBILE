import {
  PV2Prompt, initialAnswer, isAnswerComplete, buildResponse, moveInRanking,
  stepAllocation, toggleMulti, humanizeKey, allocated,
} from '../professionalV2Logic';

const opts = (...codes: string[]) => codes.map((c) => ({ optionId: `id-${c}`, code: c, text: `Option ${c}` }));
const prompt = (type: string, extra: Partial<PV2Prompt> = {}): PV2Prompt =>
  ({ type, promptText: 'p', options: opts('A', 'B', 'C'), ...extra });

describe('single choice', () => {
  it('needs a choice and sends {optionCode} (what the scorer matches)', () => {
    const p = prompt('forced_choice');
    expect(isAnswerComplete(p, {})).toBe(false);
    expect(isAnswerComplete(p, { choice: 'B' })).toBe(true);
    expect(buildResponse(p, { choice: 'B' })).toEqual({ optionCode: 'B' });
  });
  it('situational_judgment behaves the same', () => {
    expect(buildResponse(prompt('situational_judgment'), { choice: 'C' })).toEqual({ optionCode: 'C' });
  });
});

describe('confidence slider', () => {
  it('starts mid-range and sends {value} (sliderIdentity scoring)', () => {
    const p = prompt('confidence_slider', { options: [] });
    const a = initialAnswer(p);
    expect(a.value).toBe(50);
    expect(isAnswerComplete(p, a)).toBe(true);
    expect(buildResponse(p, { value: 70 })).toEqual({ value: 70 });
  });
  it('honours config bounds', () => {
    const a = initialAnswer(prompt('confidence_slider', { options: [], config: { min: 1, max: 5 } }));
    expect(a.value).toBe(3);
  });
});

describe('ranking', () => {
  it('starts in served order, complete immediately, reorders safely', () => {
    const p = prompt('ranking');
    const a = initialAnswer(p);
    expect(a.ranking).toEqual(['A', 'B', 'C']);
    expect(isAnswerComplete(p, a)).toBe(true);
    expect(moveInRanking(['A', 'B', 'C'], 0, 1)).toEqual(['B', 'A', 'C']);
    expect(moveInRanking(['A', 'B', 'C'], 0, -1)).toEqual(['A', 'B', 'C']);
    expect(moveInRanking(['A', 'B', 'C'], 2, 1)).toEqual(['A', 'B', 'C']);
    expect(buildResponse(p, { ranking: ['C', 'A', 'B'] })).toEqual({ ranking: ['C', 'A', 'B'] });
  });
});

describe('resource allocation', () => {
  const p = prompt('resource_allocation');
  it('must spend exactly the total and never overspend', () => {
    let a = initialAnswer(p);
    expect(isAnswerComplete(p, a)).toBe(false);
    a = stepAllocation(a, 'A', 60, 100);
    a = stepAllocation(a, 'B', 60, 100); // clipped to the remaining 40
    expect(allocated(a)).toBe(100);
    expect(a.allocation).toEqual({ A: 60, B: 40, C: 0 });
    expect(isAnswerComplete(p, a)).toBe(true);
    expect(buildResponse(p, a)).toEqual({ allocation: { A: 60, B: 40 } });
  });
  it('cannot go below zero', () => {
    const a = stepAllocation(initialAnswer(p), 'A', -5, 100);
    expect(a.allocation!.A).toBe(0);
  });
  it('honours a custom total', () => {
    const q = prompt('resource_allocation', { config: { total: 10 } });
    const a = stepAllocation(initialAnswer(q), 'A', 10, 10);
    expect(isAnswerComplete(q, a)).toBe(true);
  });
});

describe('multi / information selection', () => {
  it('toggles and respects a max', () => {
    expect(toggleMulti(['A'], 'B')).toEqual(['A', 'B']);
    expect(toggleMulti(['A', 'B'], 'A')).toEqual(['B']);
    expect(toggleMulti(['A', 'B'], 'C', 2)).toEqual(['A', 'B']);
  });
  it('needs at least one selection by default', () => {
    const p = prompt('multi_select');
    expect(isAnswerComplete(p, { multi: [] })).toBe(false);
    expect(isAnswerComplete(p, { multi: ['A'] })).toBe(true);
    expect(buildResponse(p, { multi: ['A', 'C'] })).toEqual({ optionCodes: ['A', 'C'] });
  });
});

describe('open response and timed task', () => {
  it('open response needs non-blank text and trims it', () => {
    const p = prompt('open_response', { options: [] });
    expect(isAnswerComplete(p, { text: '   ' })).toBe(false);
    expect(buildResponse(p, { text: ' hello ' })).toEqual({ text: 'hello' });
  });
  it('timed task with no answer is still submittable after the clock runs out', () => {
    const p = prompt('timed_task', { options: [], timeLimitSeconds: 30 });
    expect(isAnswerComplete(p, {})).toBe(false);
    expect(isAnswerComplete(p, {}, { timedOut: true })).toBe(true);
  });
  it('timed task with options is a choice', () => {
    const p = prompt('timed_task');
    expect(buildResponse(p, { choice: 'A' })).toEqual({ optionCode: 'A' });
  });
});

describe('humanizeKey', () => {
  it('title-cases snake and kebab keys', () => {
    expect(humanizeKey('root_cause_reasoning')).toBe('Root Cause Reasoning');
    expect(humanizeKey('risk-tolerance')).toBe('Risk Tolerance');
    expect(humanizeKey(null)).toBe('');
  });
});
