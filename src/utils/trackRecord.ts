/**
 * Builds the Track Record timeline: newest first, and for each entry what
 * changed versus the previous attempt of the SAME assessment (per style dimension).
 */
export interface TrackRecordInput {
  id: string;
  source: 'server' | 'professional';
  at: string;
  label: string;
  headline: string;
  /** dimension → style, for entries that carry several (professional cognitive) */
  styles?: Record<string, string>;
  assessmentType?: string;
}

export interface TrackRecordItem extends TrackRecordInput {
  changes: { dimension: string; from: string; to: string }[];
  isRetake: boolean;
}

const time = (s: string) => new Date(s).getTime() || 0;

export function buildTrackRecord(rows: TrackRecordInput[]): TrackRecordItem[] {
  const asc = [...rows].sort((a, b) => time(a.at) - time(b.at));
  const lastByLabel = new Map<string, TrackRecordInput>();
  const out: TrackRecordItem[] = asc.map((r) => {
    const prev = lastByLabel.get(r.label);
    lastByLabel.set(r.label, r);
    const changes: TrackRecordItem['changes'] = [];
    if (prev) {
      if (r.styles && prev.styles) {
        for (const [dimension, to] of Object.entries(r.styles)) {
          const from = prev.styles[dimension];
          if (from && to && from !== to) changes.push({ dimension, from, to });
        }
      } else if (prev.headline && r.headline && prev.headline !== r.headline) {
        changes.push({ dimension: 'Primary style', from: prev.headline, to: r.headline });
      }
    }
    return { ...r, changes, isRetake: !!prev };
  });
  return out.reverse();
}
