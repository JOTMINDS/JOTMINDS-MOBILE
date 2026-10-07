import {
  isPreschoolChild, resolveChildBand, calculateIndicatorEvaluation, calculateChildDevelopmentProfile,
} from '../preschoolEngine';
import { MASTER_PRESCHOOL_INDICATORS, getIndicatorsByBandAndDomain } from '../../data/preschoolIndicators';
import { MASTER_PRESCHOOL_ACTIVITIES, ACTIVITIES_BY_ID } from '../../data/preschoolActivities';
import { DEVELOPMENTAL_DOMAINS, EvidenceEvent } from '../../types/preschoolDevelopmental';
import { INDICATORS_BY_ID } from '../../data/preschoolIndicators';

const child = (over: Record<string, any> = {}) => ({ id: 'c1', name: 'Kofi', role: 'student', ...over });

const event = (indicatorId: string, rating: 0 | 1 | 2 | 3 | 4, daysAgo = 0, i = 0): EvidenceEvent => {
  const ind = INDICATORS_BY_ID[indicatorId];
  const ts = new Date(Date.now() - daysAgo * 86400000).toISOString();
  return {
    id: `e${i}-${indicatorId}-${daysAgo}`, childId: 'c1', childName: 'Kofi', indicatorId,
    domainCode: ind.domainCode, rating, method: ind.defaultMethod, date: ts.slice(0, 10), timestamp: ts,
    observerId: 't1', observerName: 'Ms Ama', observerRole: 'teacher',
  };
};

describe('preschool data banks', () => {
  it('contains indicators for every domain with unique ids', () => {
    const ids = MASTER_PRESCHOOL_INDICATORS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBeGreaterThan(200);
    Object.keys(DEVELOPMENTAL_DOMAINS).forEach((d) =>
      expect(MASTER_PRESCHOOL_INDICATORS.some((i) => i.domainCode === d)).toBe(true));
  });

  it('maps every activity to indicators that exist', () => {
    expect(MASTER_PRESCHOOL_ACTIVITIES.length).toBeGreaterThan(0);
    MASTER_PRESCHOOL_ACTIVITIES.forEach((a) => {
      expect(ACTIVITIES_BY_ID[a.id]).toBe(a);
      a.mappedIndicatorIds.forEach((id) => expect(INDICATORS_BY_ID[id]).toBeDefined());
    });
  });

  it('filters indicators by band', () => {
    getIndicatorsByBandAndDomain('P2').forEach((i) => expect(String(i.band)).toContain('P2'));
  });
});

describe('isPreschoolChild', () => {
  it('accepts ages up to 6.5 and rejects older', () => {
    expect(isPreschoolChild(child({ age: 4 }))).toBe(true);
    expect(isPreschoolChild(child({ age: 6 }))).toBe(true);
    expect(isPreschoolChild(child({ age: 7 }))).toBe(false);
  });
  it('uses education level / class name keywords', () => {
    expect(isPreschoolChild(child({ educationLevel: 'Pre-school' }))).toBe(true);
    expect(isPreschoolChild(child({ className: 'KG 2 Blue' }))).toBe(true);
    expect(isPreschoolChild(child({ educationLevel: 'Elementary' }))).toBe(false);
    expect(isPreschoolChild(child({ className: 'Primary 3' }))).toBe(false);
  });
  it('rejects non-students', () => {
    expect(isPreschoolChild(child({ role: 'teacher', age: 4 }))).toBe(false);
  });
});

describe('resolveChildBand', () => {
  it('maps age to band', () => {
    expect(resolveChildBand(child({ age: 2 }))).toBe('P1');
    expect(resolveChildBand(child({ age: 3 }))).toBe('P1');
    expect(resolveChildBand(child({ age: 4 }))).toBe('P2');
    expect(resolveChildBand(child({ age: 5 }))).toBe('P3');
    expect(resolveChildBand(child({ age: 6 }))).toBe('P4');
  });
  it('falls back to level text, then P3', () => {
    expect(resolveChildBand(child({ educationLevel: 'Nursery 1' }))).toBe('P1');
    expect(resolveChildBand(child({ className: 'KG 2' }))).toBe('P3');
    expect(resolveChildBand(child({}))).toBe('P3');
  });
});

describe('calculateIndicatorEvaluation', () => {
  const ind = MASTER_PRESCHOOL_INDICATORS[0];
  it('returns an unrated, low-confidence result with no evidence', () => {
    const ev = calculateIndicatorEvaluation(ind, []);
    expect(ev.currentRating).toBe(0);
    expect(ev.confidence).toBe('low');
    expect(ev.lastObservedDate).toBeNull();
  });
  it('rates from accumulated evidence', () => {
    const ev = calculateIndicatorEvaluation(ind, [event(ind.id, 3, 0, 1), event(ind.id, 3, 5, 2), event(ind.id, 4, 9, 3)]);
    expect(ev.currentRating).toBeGreaterThanOrEqual(3);
    expect(ev.events).toHaveLength(3);
  });
});

describe('calculateChildDevelopmentProfile', () => {
  it('builds a profile from evidence without throwing', () => {
    const ind = MASTER_PRESCHOOL_INDICATORS[0];
    const p = calculateChildDevelopmentProfile(child({ age: 5 }), [event(ind.id, 3)]);
    expect(p.child.id).toBe('c1');
    expect(p.assignedBand).toBe('P3');
    expect(p.totalEvidenceEvents).toBe(1);
  });
  it('handles a child with no evidence', () => {
    expect(() => calculateChildDevelopmentProfile(child({ age: 3 }), [])).not.toThrow();
  });
});

describe('class intelligence and home activities', () => {
  const { calculateClassDevelopmentIntelligence } = require('../preschoolEngine');
  it('summarises a cohort with and without evidence', () => {
    const kids = [child({ id: 'a', name: 'A', age: 3 }), child({ id: 'b', name: 'B', age: 6 })];
    const empty = calculateClassDevelopmentIntelligence(kids, [], 'x', 'KG');
    expect(empty.totalChildren).toBe(2);
    expect(empty.activeObservations).toBe(0);
    expect(empty.bandDistribution).toMatchObject({ P1: 1, P4: 1 });

    const ind = MASTER_PRESCHOOL_INDICATORS[0];
    const ev = { ...event(ind.id, 3), childId: 'a' };
    const full = calculateClassDevelopmentIntelligence(kids, [ev], 'x', 'KG');
    expect(full.activeObservations).toBe(1);
    expect(full.domainAverages.length).toBeGreaterThan(0);
  });
  it('has home activities for every age band', () => {
    (['P1', 'P2', 'P3', 'P4'] as const).forEach((b) => {
      expect(getIndicatorsByBandAndDomain(b).some((i) => !!i.homeActivity)).toBe(true);
    });
  });
});
