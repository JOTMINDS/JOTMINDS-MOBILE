import { diagnoseStudentRisk } from '../riskDiagnostic';

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
const kolb = (CE: number, RO: number, AC: number, AE: number, when = daysAgo(2)) => ({
  type: 'kolb', completedAt: when, score: { kolb: { style: 'Diverging', scores: { CE, RO, AC, AE } } },
});
const sternberg = { type: 'sternberg', completedAt: daysAgo(2), score: { sternberg: { style: 'Analytical', scores: { analytical: 20, creative: 18, practical: 19 } } } };
const decision = { type: 'dual-process', completedAt: daysAgo(2), score: { dualProcess: { style: 'Reflective', scores: { system1: 50, system2: 60 } } } };

describe('diagnoseStudentRisk', () => {
  it('flags a student with no assessments as unassessed', () => {
    const d = diagnoseStudentRisk({ id: 's1', name: 'Ama' }, []);
    expect(d.riskLevel).toBe('unassessed');
    expect(d.metrics.completedCount).toBe(0);
  });

  it('rates a balanced, fully assessed, recent student low risk', () => {
    const d = diagnoseStudentRisk({ id: 's1', name: 'Ama' }, [kolb(24, 24, 24, 24), sternberg, decision]);
    expect(d.riskLevel).toBe('low');
    expect(d.rootCauses[0].severity).toBe('positive');
    expect(d.diagnosticConfidence).toBe(98);
  });

  it('detects concrete-dominant asymmetry', () => {
    const d = diagnoseStudentRisk({ id: 's1', name: 'Ama' }, [kolb(40, 24, 10, 24), sternberg, decision]);
    expect(d.rootCauses.some((r) => r.title.startsWith('Concrete-Dominant'))).toBe(true);
  });

  it('flags dormant students as high risk', () => {
    const d = diagnoseStudentRisk({ id: 's1', name: 'Ama' }, [kolb(24, 24, 24, 24, daysAgo(90))]);
    expect(d.riskLevel).toBe('high');
    expect(d.metrics.daysSinceLastActive).toBeGreaterThan(60);
  });

  it('does not treat low style scores as risk (participation only)', () => {
    const low = kolb(2, 2, 2, 2);
    const d = diagnoseStudentRisk({ id: 's1', name: 'Ama' }, [low, { ...sternberg, score: { sternberg: { style: 'Analytical', scores: { analytical: 1, creative: 1, practical: 1 } } } }, decision]);
    expect(d.riskLevel).toBe('low');
  });
});
