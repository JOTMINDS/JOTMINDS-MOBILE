import { findResultForDomain, CognitiveDomain, REQUIRED_DOMAINS } from './profileCompleteness';
import { normalizeAssessmentResult, STYLE_DESCRIPTIONS } from './scoring';
import { getGhanaMapping, GhanaMapping } from './ghanaMapping';

/**
 * The full cognitive report: the learning + thinking + decision results combined
 * into one document, as the webapp's "Cognitive Profile" page does. Pure logic;
 * the screen just renders it.
 */
export interface ReportDomain {
  domain: CognitiveDomain;
  style: string;
  description: string;
  scores: Record<string, number>;
  completedAt?: string;
}

export interface CognitiveReport {
  complete: boolean;
  missing: CognitiveDomain[];
  domains: Partial<Record<CognitiveDomain, ReportDomain>>;
  /** newest completion date across the three */
  latestAt?: string;
  mapping: GhanaMapping | null;
}

interface StoredResult { assessmentType: string; results?: any; completedAt?: string; createdAt?: string }

export function buildCognitiveReport(stored: StoredResult[] = []): CognitiveReport {
  const domains: CognitiveReport['domains'] = {};
  for (const d of REQUIRED_DOMAINS) {
    // newest first if several attempts are stored
    const matches = stored
      .filter((r) => r.results && findResultForDomain([r], d))
      .sort((a, b) => (new Date(b.completedAt ?? b.createdAt ?? 0).getTime() || 0) - (new Date(a.completedAt ?? a.createdAt ?? 0).getTime() || 0));
    const entry = matches[0];
    if (!entry) continue;
    const n = normalizeAssessmentResult(entry.results);
    if (!n.primaryStyle) continue;
    domains[d] = {
      domain: d,
      style: n.primaryStyle,
      description: STYLE_DESCRIPTIONS[n.primaryStyle] ?? '',
      scores: n.scores,
      completedAt: entry.completedAt ?? entry.createdAt,
    };
  }
  const missing = REQUIRED_DOMAINS.filter((d) => !domains[d]);
  const complete = missing.length === 0;
  const dates = REQUIRED_DOMAINS.map((d) => domains[d]?.completedAt).filter(Boolean) as string[];
  const latestAt = dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
  return {
    complete,
    missing,
    domains,
    latestAt,
    mapping: complete
      ? getGhanaMapping({ kolbStyle: domains.learning!.style, sternbergStyle: domains.thinking!.style, dualProcessStyle: domains.decision!.style })
      : null,
  };
}

export interface ReportTip { title: string; body: string }

/** Three practical tips, one per domain (same guidance as the webapp's report). */
export function reportTips(styles: { learning: string; thinking: string; decision: string }): ReportTip[] {
  const l = styles.learning;
  const t = styles.thinking;
  const d = styles.decision;
  return [
    {
      title: 'Optimise your study or work environment',
      body: `Based on your ${l} learning style, create a space that lets you ${
        l.includes('Diverging') ? 'observe and reflect quietly'
          : l.includes('Assimilating') ? 'organise information systematically'
            : l.includes('Converging') ? 'test ideas and solve problems'
              : 'engage actively with materials'
      }.`,
    },
    {
      title: 'Leverage your thinking strengths',
      body: `Your ${t} thinking style means you excel at ${
        t.includes('Analytical') ? 'breaking down complex problems and critical analysis'
          : t.includes('Creative') ? 'generating innovative ideas and new approaches'
            : 'applying knowledge to real-world situations'
      }. Use this in group projects and discussions.`,
    },
    {
      title: 'Improve your decision-making',
      body: `As a ${d} decision-maker, ${
        d.includes('Balanced') ? 'you can flex between quick intuition and careful analysis — match your approach to the situation'
          : d.includes('Intuitive') ? 'trust your gut feelings but double-check important decisions with analysis'
            : 'your thorough analysis is valuable, but practise making quicker decisions in low-stakes situations'
      }.`,
    },
  ];
}

/** Plain-text version for the share sheet. */
export function reportText(report: CognitiveReport, who: { name?: string }): string | null {
  if (!report.complete) return null;
  const { learning, thinking, decision } = report.domains;
  const lines = [
    'JotMinds Cognitive Profile',
    who.name ?? '',
    report.latestAt ? `Completed ${new Date(report.latestAt).toLocaleDateString()}` : '',
    '',
    `Learning style: ${learning!.style}`,
    `Thinking style: ${thinking!.style}`,
    `Decision style: ${decision!.style}`,
  ];
  if (report.mapping?.careerSuggestions.length) lines.push('', `Career fit: ${report.mapping.careerSuggestions.join(', ')}`);
  lines.push('', 'Discover yours at jotminds.com');
  return lines.filter((l, i) => l !== '' || (lines[i - 1] ?? '') !== '').join('\n');
}
