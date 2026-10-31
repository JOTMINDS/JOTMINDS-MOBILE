import { accountKind, accountLabel, isInstitutionAccount } from '../accountKind';

describe('accountKind', () => {
  it('treats school roles and educational institutions as school accounts', () => {
    expect(accountKind({ role: 'school_admin' })).toBe('school');
    expect(accountKind({ role: 'Institution' })).toBe('school');
    expect(accountKind({ role: 'organization', organizationType: 'Educational Institution' })).toBe('school');
    expect(accountKind({ role: 'professional', industrySector: 'Educational Institutions' })).toBe('school');
  });

  it('treats organization and supervisor roles as organization accounts', () => {
    expect(accountKind({ role: 'organization' })).toBe('organization');
    expect(accountKind({ role: 'Supervisor' })).toBe('organization');
    expect(accountKind({ role: 'admin' })).toBe('organization');
  });

  it('leaves people using JotMinds as personal, including professionals who belong to an organization', () => {
    for (const role of ['student', 'teacher', 'parent', 'professional', undefined]) {
      expect(accountKind({ role, organizationType: 'Corporate' })).toBe('personal');
    }
    expect(accountKind(null)).toBe('personal');
    expect(isInstitutionAccount({ role: 'teacher' })).toBe(false);
    expect(isInstitutionAccount({ role: 'school_admin' })).toBe(true);
  });
});

describe('accountLabel', () => {
  it('names school and organization accounts, not "administrator"', () => {
    expect(accountLabel({ role: 'school_admin' })).toBe('School account');
    expect(accountLabel({ role: 'organization' })).toBe('Organization account');
    expect(accountLabel({ role: 'admin' })).toBe('Administrator');
  });

  it('capitalizes the role for everyone else', () => {
    expect(accountLabel({ role: 'teacher' })).toBe('Teacher');
    expect(accountLabel({})).toBe('Member');
  });
});
