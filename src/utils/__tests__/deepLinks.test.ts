import { parseDeepLink } from '../deepLinks';

describe('parseDeepLink', () => {
  it('reads student codes from the app scheme and the site', () => {
    expect(parseDeepLink('jotminds://login?code=jm-ab12-cd34')).toEqual({ kind: 'student-code', code: 'JM-AB12-CD34' });
    expect(parseDeepLink('https://jotminds.com/?code=JM-AB12-CD34')).toEqual({ kind: 'student-code', code: 'JM-AB12-CD34' });
    expect(parseDeepLink('https://www.jotminds.com/signin?code=JM-ZZZZ-9999')).toEqual({ kind: 'student-code', code: 'JM-ZZZZ-9999' });
  });
  it('treats other codes as organisation/institution join codes, with an optional role', () => {
    expect(parseDeepLink('https://jotminds.com/?code=acme2026&role=professional')).toEqual({ kind: 'join', code: 'ACME2026', role: 'professional' });
    expect(parseDeepLink('jotminds://signup?role=teacher')).toEqual({ kind: 'join', role: 'teacher', code: undefined });
  });
  it('ignores web-only roles (admin, organisation, supervisor)', () => {
    expect(parseDeepLink('https://jotminds.com/?role=school_admin')).toBeNull();
    expect(parseDeepLink('https://jotminds.com/?role=organization&code=ORG123')).toEqual({ kind: 'join', code: 'ORG123', role: undefined });
    expect(parseDeepLink('https://jotminds.com/?role=admin')).toBeNull();
  });
  it('rejects foreign hosts, lookalikes and unsafe values', () => {
    expect(parseDeepLink('https://evil.com/?code=JM-AB12-CD34')).toBeNull();
    expect(parseDeepLink('https://jotminds.com.evil.com/?code=ABC123')).toBeNull();
    expect(parseDeepLink('https://jotminds.com/?code=<script>alert(1)</script>')).toBeNull();
    expect(parseDeepLink('https://jotminds.com/?code=' + 'A'.repeat(64))).toBeNull();
  });
  it('returns null for links with nothing actionable or malformed input', () => {
    expect(parseDeepLink('https://jotminds.com/privacy')).toBeNull();
    expect(parseDeepLink('jotminds://')).toBeNull();
    expect(parseDeepLink('not a url')).toBeNull();
    expect(parseDeepLink(undefined)).toBeNull();
    expect(parseDeepLink(null)).toBeNull();
  });
});
