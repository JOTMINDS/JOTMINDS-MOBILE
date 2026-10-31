import {
  CURRICULUM_FRAMEWORKS, DEFAULT_CURRICULUM, curriculumFormat, curriculumShortName, fitPhasesToDuration,
} from '../curriculumFormats';

describe('curriculumFormat', () => {
  it('gives each offered framework its own section labels', () => {
    const labels = CURRICULUM_FRAMEWORKS.map((f) => curriculumFormat(f).alignmentLabels.join('|'));
    expect(new Set(labels).size).toBe(CURRICULUM_FRAMEWORKS.length);
  });

  it('recognises the web names and short forms', () => {
    expect(curriculumFormat('National Curriculum (NaCCA / GES)').name).toMatch(/NaCCA/);
    expect(curriculumFormat('GES').name).toMatch(/NaCCA/);
    expect(curriculumFormat('Cambridge').alignmentLabels).toContain('Command Words');
    expect(curriculumFormat('IB').alignmentLabels).toContain('Statement of Inquiry');
    expect(curriculumFormat('Oxford International Curriculum').alignmentLabels).toContain('Learning Intentions');
  });

  it('falls back to generic sections for an unknown curriculum', () => {
    expect(curriculumFormat('Something local').alignmentLabels).toEqual(['Learning Outcomes', 'Key Vocabulary', 'Resources']);
    expect(curriculumFormat(undefined).name).toBeTruthy();
  });

  it('defaults to the national curriculum and has chip-sized names', () => {
    expect(DEFAULT_CURRICULUM).toBe(CURRICULUM_FRAMEWORKS[0]);
    expect(curriculumShortName(DEFAULT_CURRICULUM)).toBe('NaCCA / GES');
    expect(curriculumShortName(CURRICULUM_FRAMEWORKS[1])).toBe('Cambridge / Edexcel');
  });
});

describe('fitPhasesToDuration', () => {
  const phase = (name: string, durationMinutes: number) => ({ name, durationMinutes, activity: '' });

  it('rescales drifting phase times to the lesson length', () => {
    const out = fitPhasesToDuration([phase('a', 10), phase('b', 20), phase('c', 20)], 45);
    expect(out.reduce((t, p) => t + p.durationMinutes, 0)).toBe(45);
    expect(out.every((p) => p.durationMinutes >= 1)).toBe(true);
  });

  it('leaves correct times alone and tolerates empty input', () => {
    expect(fitPhasesToDuration([phase('a', 15), phase('b', 30)], 45).map((p) => p.durationMinutes)).toEqual([15, 30]);
    expect(fitPhasesToDuration([], 45)).toEqual([]);
  });
});
