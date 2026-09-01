import { parseCSV, toRosterRows } from '../csv';

describe('parseCSV', () => {
  it('handles quoted fields with commas and CRLF line endings', () => {
    const rows = parseCSV('name,note\r\n"Doe, Jane","top of class"\r\nJohn,ok\r\n');
    expect(rows).toEqual([
      ['name', 'note'],
      ['Doe, Jane', 'top of class'],
      ['John', 'ok'],
    ]);
  });

  it('handles escaped quotes and bare CR (old Mac) line endings', () => {
    const rows = parseCSV('a\r"say ""hi""",b');
    expect(rows).toEqual([['a'], ['say "hi"', 'b']]);
  });

  it('drops blank lines and a BOM', () => {
    expect(parseCSV('﻿x\n\n\ny\n')).toEqual([['x'], ['y']]);
  });
});

describe('toRosterRows', () => {
  it('maps a recognised header regardless of column order', () => {
    const rows = parseCSV('Date of Birth,Full Name,Grade\n2011-04-02,Ama Mensah,JHS 1\n');
    expect(toRosterRows(rows)).toEqual([
      { studentName: 'Ama Mensah', dateOfBirth: '2011-04-02', educationLevel: 'JHS 1' },
    ]);
  });

  it('falls back to positional columns when there is no header', () => {
    const rows = parseCSV('Kojo Boateng,2010-09-15,SHS 2\n');
    expect(toRosterRows(rows)[0]).toEqual({
      studentName: 'Kojo Boateng',
      dateOfBirth: '2010-09-15',
      educationLevel: 'SHS 2',
    });
  });

  it('skips rows with no name', () => {
    const rows = parseCSV('name,dob\nAma,2011-01-01\n,2012-01-01\n');
    expect(toRosterRows(rows)).toHaveLength(1);
  });
});
