// Role Fit / Career matching must be driven by the full cognitive profile —
// all three core assessments — not a single quick test or the 60-second
// First Win taster. These helpers decide whether that profile is complete.

export const REQUIRED_DOMAINS = ['learning', 'thinking', 'decision'] as const;
export type CognitiveDomain = (typeof REQUIRED_DOMAINS)[number];

// Map every assessment type (mobile + webapp variants) to a core domain.
const DOMAIN_ALIASES: Record<string, CognitiveDomain> = {
  learning: 'learning', kolb: 'learning',
  thinking: 'thinking', sternberg: 'thinking', 'adult-thinking': 'thinking',
  'shs-thinking': 'thinking', 'jhs-thinking': 'thinking', 'child-thinking': 'thinking',
  decision: 'decision', 'dual-process': 'decision',
};

const DOMAIN_LABELS: Record<CognitiveDomain, string> = {
  learning: 'Learning Agility',
  thinking: 'Thinking Style',
  decision: 'Decision Style',
};

export function completedDomains(types: string[] = []): Set<CognitiveDomain> {
  const done = new Set<CognitiveDomain>();
  types.forEach((t) => {
    const d = DOMAIN_ALIASES[t];
    if (d) done.add(d);
  });
  return done;
}

export function missingCognitiveDomains(types: string[] = []): CognitiveDomain[] {
  const done = completedDomains(types);
  return REQUIRED_DOMAINS.filter((d) => !done.has(d));
}

export function isCognitiveProfileComplete(types: string[] = []): boolean {
  return missingCognitiveDomains(types).length === 0;
}

export const domainLabel = (d: string) => DOMAIN_LABELS[d as CognitiveDomain] ?? d;
