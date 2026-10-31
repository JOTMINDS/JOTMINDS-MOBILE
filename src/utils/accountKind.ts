/**
 * Whether a signed-in account is a person using JotMinds (student, teacher, parent, professional)
 * or a school / organization account. Mirrors the webapp, which sends school and organization
 * accounts to their own portal instead of the personal dashboards.
 *
 *  - school:       role school_admin / institution / school, or an Educational Institution
 *  - organization: role organization / supervisor (company, NGO and so on)
 *  - personal:     everyone else
 */
export type AccountKind = 'school' | 'organization' | 'personal';

type U = {
  role?: string | null;
  organizationType?: string | null;
  industrySector?: string | null;
} | null | undefined;

const SCHOOL_ROLES = new Set(['school_admin', 'institution', 'school']);
const ORG_ROLES = new Set(['organization', 'supervisor', 'admin']);

export function accountKind(user?: U): AccountKind {
  if (!user) return 'personal';
  const role = (user.role ?? '').toLowerCase();
  if (
    SCHOOL_ROLES.has(role) ||
    user.organizationType === 'Educational Institution' ||
    user.organizationType === 'School' ||
    user.industrySector === 'Educational Institutions'
  ) {
    return 'school';
  }
  return ORG_ROLES.has(role) ? 'organization' : 'personal';
}

/** True for school and organization accounts, which get the lean portal home and no personal features. */
export function isInstitutionAccount(user?: U): boolean {
  return accountKind(user) !== 'personal';
}

/** What to call the account in the UI. A school account is never shown as just "administrator". */
export function accountLabel(user?: U): string {
  switch (accountKind(user)) {
    case 'school': return 'School account';
    case 'organization': return (user?.role ?? '').toLowerCase() === 'admin' ? 'Administrator' : 'Organization account';
    default: {
      const role = user?.role ?? '';
      return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Member';
    }
  }
}
