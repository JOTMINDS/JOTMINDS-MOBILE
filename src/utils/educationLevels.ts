/** Education levels offered at signup / profile edit — mirrors the jotminds.com web signup (students only). */
export const EDUCATION_LEVELS = [
  { value: 'Pre-school', label: 'Pre-school' },
  { value: 'Elementary', label: 'Primary' },
  { value: 'JHS', label: 'JHS' },
  { value: 'SHS', label: 'SHS' },
  { value: 'Tertiary', label: 'Tertiary' },
];

/** Webapp accountMigration rule: age <= 6 → Pre-school, <= 10 → Elementary. */
export function levelFromAge(age: number): string | undefined {
  if (!(age > 0)) return undefined;
  if (age <= 6) return 'Pre-school';
  if (age <= 10) return 'Elementary';
  return undefined;
}

/** True for the level values the webapp treats as Pre-school / Early Years (case-insensitive). */
export const isPreschoolLevel = (level?: string | null): boolean =>
  !!level && ['pre-school', 'preschool', 'early years', 'nursery', 'kindergarten', 'creche', 'crèche'].includes(level.trim().toLowerCase());
