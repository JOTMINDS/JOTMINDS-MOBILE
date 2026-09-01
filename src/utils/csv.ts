/**
 * Minimal CSV parser — handles quoted fields, embedded commas/newlines, and
 * Mac / Windows / Unix line endings (mirrors the webapp's 251e0c5 fix).
 * No dependency; good enough for student-roster imports.
 */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  const src = text.replace(/^﻿/, ''); // strip BOM

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') { inQuotes = true; continue; }
    if (ch === ',') { row.push(field); field = ''; continue; }
    if (ch === '\r') {
      if (src[i + 1] === '\n') i++;
      row.push(field); field = ''; rows.push(row); row = [];
      continue;
    }
    if (ch === '\n') { row.push(field); field = ''; rows.push(row); row = []; continue; }
    field += ch;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim().length > 0));
}

export interface RosterRow {
  studentName: string;
  dateOfBirth: string;
  educationLevel?: string;
}

/**
 * Map a parsed CSV to roster rows. Expects a header with some of:
 * name / student name / full name, dob / date of birth / birthdate,
 * level / education level / grade. Falls back to positional (col 0 = name,
 * col 1 = dob, col 2 = level) when no recognisable header is present.
 */
export function toRosterRows(rows: string[][]): RosterRow[] {
  if (rows.length === 0) return [];
  const norm = (s: string) => s.trim().toLowerCase().replace(/[_\s-]+/g, '');
  const header = rows[0].map(norm);

  const nameIdx = header.findIndex((h) => ['name', 'studentname', 'fullname'].includes(h));
  const dobIdx = header.findIndex((h) => ['dob', 'dateofbirth', 'birthdate', 'birthday'].includes(h));
  const lvlIdx = header.findIndex((h) => ['level', 'educationlevel', 'grade', 'class'].includes(h));

  const hasHeader = nameIdx !== -1 || dobIdx !== -1;
  const body = hasHeader ? rows.slice(1) : rows;
  const n = hasHeader && nameIdx !== -1 ? nameIdx : 0;
  const d = hasHeader && dobIdx !== -1 ? dobIdx : 1;
  const l = hasHeader && lvlIdx !== -1 ? lvlIdx : 2;

  return body
    .map((r) => ({
      studentName: (r[n] ?? '').trim(),
      dateOfBirth: (r[d] ?? '').trim(),
      educationLevel: (r[l] ?? '').trim() || undefined,
    }))
    .filter((r) => r.studentName.length > 0);
}
