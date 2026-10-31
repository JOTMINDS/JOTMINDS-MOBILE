import { groupStudentsByClass } from '../studentGroups';

const roster = [
  { id: '1', name: 'Kofi', className: 'JHS 2', email: 'kofi@x.com' },
  { id: '2', name: 'Ama', className: 'JHS 1', studentCode: 'JM-AAAA-1111' },
  { id: '3', name: 'Abena', className: 'JHS 2' },
  { id: '4', name: 'Yaw' },
  { id: '5', name: 'Efua', className: '  ' },
];

describe('groupStudentsByClass', () => {
  it('groups by class A–Z, students A–Z, unassigned last', () => {
    const g = groupStudentsByClass(roster);
    expect(g.map((x) => x.name)).toEqual(['JHS 1', 'JHS 2', 'No class yet']);
    expect(g[1].students.map((s) => s.name)).toEqual(['Abena', 'Kofi']);
    expect(g[2].students.map((s) => s.name)).toEqual(['Efua', 'Yaw']);
  });

  it('filters by name, email or code and drops empty classes', () => {
    expect(groupStudentsByClass(roster, 'abe').map((x) => x.students.map((s) => s.name))).toEqual([['Abena']]);
    expect(groupStudentsByClass(roster, 'kofi@').flatMap((x) => x.students.map((s) => s.id))).toEqual(['1']);
    expect(groupStudentsByClass(roster, 'jm-aaaa').flatMap((x) => x.students.map((s) => s.id))).toEqual(['2']);
    expect(groupStudentsByClass(roster, 'zzz')).toEqual([]);
  });

  it('tolerates an empty or missing roster', () => {
    expect(groupStudentsByClass([])).toEqual([]);
    expect(groupStudentsByClass(undefined as any)).toEqual([]);
  });
});
