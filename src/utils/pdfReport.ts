import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { REQUIRED_DOMAINS, domainLabel } from './profileCompleteness';
import { CognitiveReport, reportTips, dimensionLabel } from './cognitiveReport';
import {
  generateExecutiveSummary, generateCombinedInsights, generateProfessionalInsights,
  AIResult, ExecutiveSummary, CombinedInsights, ProfessionalInsights,
} from './aiGenerators';
import type { ProfessionalCognitiveEntry } from './professionalCognitiveStore';

/**
 * PDF export for the cognitive and professional reports. The HTML is built here as a pure
 * function (tested); expo-print turns it into a PDF file and the share sheet hands it over.
 *
 * Everything that reaches the HTML is escaped: names, positions and AI text are untrusted.
 */
const HTML_ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (v: unknown): string => String(v ?? '').replace(/[&<>"']/g, (c) => HTML_ESC[c]);

const nl2 = (s: string) => esc(s).replace(/\n/g, '<br/>');
const date = (iso?: string) => (iso ? new Date(iso).toLocaleDateString() : '');

const CSS = `
  @page { margin: 22mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #1E293B; font-size: 12px; line-height: 1.5; }
  h1 { font-size: 24px; margin: 0 0 2px; color: #14136E; }
  h2 { font-size: 15px; margin: 22px 0 8px; color: #14136E; border-bottom: 2px solid #E2E8F0; padding-bottom: 4px; page-break-after: avoid; break-after: avoid; }
  .eyebrow { font-size: 10px; letter-spacing: 1.4px; font-weight: 700; color: #6E4D9C; }
  .muted { color: #64748B; }
  .row { display: flex; gap: 10px; }
  .hero { flex: 1; border-radius: 10px; padding: 14px; color: #fff; page-break-inside: avoid; }
  .hero .label { font-size: 9px; letter-spacing: 1.2px; font-weight: 700; opacity: .8; }
  .hero .style { font-size: 18px; font-weight: 800; margin: 3px 0; }
  .hero .desc { font-size: 10.5px; opacity: .95; }
  .card { border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px 14px; margin: 8px 0; page-break-inside: avoid; }
  .bar { display: flex; align-items: center; gap: 8px; margin: 5px 0; }
  .bar .name { width: 150px; } .bar .track { flex: 1; height: 8px; background: #E2E8F0; border-radius: 4px; overflow: hidden; }
  .bar .fill { height: 8px; border-radius: 4px; } .bar .val { width: 28px; text-align: right; font-weight: 700; }
  .tip { border-left: 4px solid #6E4D9C; padding-left: 10px; margin: 10px 0; page-break-inside: avoid; }
  .tip b { display: block; }
  ul { margin: 4px 0 4px 18px; padding: 0; }
  .fit b { color: #6E4D9C; font-size: 9.5px; letter-spacing: 1px; display: block; margin-top: 8px; }
  .note { font-size: 9.5px; color: #64748B; margin-top: 6px; }
  .footer { margin-top: 28px; padding-top: 8px; border-top: 1px solid #E2E8F0; font-size: 9.5px; color: #64748B; }
`;

const GRADIENT: Record<string, string> = {
  learning: 'linear-gradient(135deg,#3D52C9,#2E3FA8)',
  thinking: 'linear-gradient(135deg,#6E4D9C,#5A3E82)',
  decision: 'linear-gradient(135deg,#EC4899,#DB2777)',
};
const BAR_COLOR: Record<string, string> = { learning: '#3D52C9', thinking: '#6E4D9C', decision: '#EC4899' };

const list = (items: string[]) => (items.length ? `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : '');

function page(title: string, body: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"/><title>${esc(title)}</title><style>${CSS}</style></head><body>${body}
  <div class="footer">Generated with JotMinds on ${esc(new Date().toLocaleDateString())} · jotminds.com. This report describes thinking and learning preferences; it is not a clinical assessment or a hiring decision.</div></body></html>`;
}

// ── Cognitive report ─────────────────────────────────────────────────────────

export interface CognitivePdfInput {
  report: CognitiveReport;
  who: { name?: string; position?: string; organization?: string };
  summary?: AIResult<ExecutiveSummary> | null;
  combined?: AIResult<CombinedInsights> | null;
}

export function buildCognitiveReportHtml({ report, who, summary, combined }: CognitivePdfInput): string {
  const heroes = REQUIRED_DOMAINS.map((d) => {
    const dom = report.domains[d];
    if (!dom) return '';
    return `<div class="hero" style="background:${GRADIENT[d]};background-color:${BAR_COLOR[d]}">
      <div class="label">${esc(domainLabel(d).toUpperCase())}</div><div class="style">${esc(dom.style)}</div>
      <div class="desc">${esc(dom.description)}</div>${dom.completedAt ? `<div class="desc" style="margin-top:6px;opacity:.7">Completed ${esc(date(dom.completedAt))}</div>` : ''}</div>`;
  }).join('');

  const dims = REQUIRED_DOMAINS.map((d) => {
    const dom = report.domains[d];
    const entries = dom ? Object.entries(dom.scores) : [];
    if (entries.length === 0) return '';
    const bars = entries.map(([k, v]) => {
      const n = Math.max(0, Math.min(100, Math.round(Number(v) || 0)));
      return `<div class="bar"><div class="name">${esc(dimensionLabel(k))}</div><div class="track"><div class="fill" style="width:${n}%;background:${BAR_COLOR[d]}"></div></div><div class="val">${n}</div></div>`;
    }).join('');
    return `<div class="card"><b>${esc(domainLabel(d))} dimensions</b>${bars}</div>`;
  }).join('');

  const styleNames = report.complete
    ? { learning: report.domains.learning!.style, thinking: report.domains.thinking!.style, decision: report.domains.decision!.style }
    : null;
  const tips = styleNames
    ? reportTips(styleNames).map((t) => `<div class="tip"><b>${esc(t.title)}</b>${esc(t.body)}</div>`).join('')
    : '';

  const m = report.mapping;
  const fit = m ? `<div class="card fit">
      ${m.shsTrack.length ? `<b>SHS TRACK</b>${esc(m.shsTrack.join(', '))}` : ''}
      ${m.tertiaryFocus.length ? `<b>TERTIARY FOCUS</b>${esc(m.tertiaryFocus.join(', '))}` : ''}
      ${m.careerSuggestions.length ? `<b>CAREERS TO EXPLORE</b>${esc(m.careerSuggestions.join(', '))}` : ''}
      ${m.decisionTip ? `<b>DECISION TIP</b>${esc(m.decisionTip)}` : ''}</div>` : '';

  const summaryHtml = summary ? `<h2>Summary</h2><div class="card">${nl2(summary.data.narrativeSummary)}
      <p><b>Key takeaway:</b> ${esc(summary.data.keyTakeaway)}</p><p><i>“${esc(summary.data.personalizedMantra)}”</i></p>
      <div class="note">${summary.ai ? 'AI-generated — review before acting on it.' : 'Standard summary.'}</div></div>` : '';

  const combinedHtml = combined ? `<h2>Combined insights</h2><div class="card">
      <b>Strengths</b>${list(combined.data.strengths)}<b>Growth areas</b>${list(combined.data.growthAreas)}<b>Recommendations</b>${list(combined.data.recommendations)}
      <div class="note">${combined.ai ? 'AI-generated — review before acting on it.' : 'Standard guidance.'}</div></div>` : '';

  return page('JotMinds Cognitive Report', `
    <div class="eyebrow">FULL COGNITIVE REPORT</div>
    <h1>${esc(who.name || 'Cognitive profile')}</h1>
    <div class="muted">${esc([who.position, who.organization].filter(Boolean).join(' · '))}${report.latestAt ? `${who.position || who.organization ? ' · ' : ''}Updated ${esc(date(report.latestAt))}` : ''}</div>
    <h2>Your styles</h2><div class="row">${heroes}</div>
    ${summaryHtml}
    <h2>Dimension scores</h2>${dims}
    ${combinedHtml}
    ${tips ? `<h2>Putting your profile to work</h2>${tips}` : ''}
    ${fit ? `<h2>Career &amp; programme fit</h2>${fit}` : ''}`);
}

// ── Professional assessment report ───────────────────────────────────────────

export interface ProfessionalPdfInput {
  entry: ProfessionalCognitiveEntry;
  who: { name?: string; position?: string; organization?: string };
  insights?: AIResult<ProfessionalInsights> | null;
}

export function buildProfessionalReportHtml({ entry, who, insights }: ProfessionalPdfInput): string {
  const p = entry.profile;
  const dims = [
    ['Learning', p.learning], ['Thinking', p.thinking], ['Decision-making', p.decisionMaking],
    ...(p.motivation ? [['Motivation', p.motivation] as const] : []),
  ] as const;
  const cards = dims.map(([label, d]) => `<div class="card"><div class="eyebrow">${esc(String(label).toUpperCase())}</div>
      <b style="font-size:15px">${esc(d.style)}</b>${d.anchors ? `<div class="muted">${esc(d.anchors)}</div>` : ''}<div>${esc(d.description)}</div></div>`).join('');
  const ins = insights ? `<h2>Professional insights</h2><div class="card">${esc(insights.data.leadershipInsight)}
      <b>Strengths</b>${list(insights.data.strengths)}<b>Development areas</b>${list(insights.data.developmentAreas)}
      <b>Recommendations</b>${list(insights.data.recommendations)}<b>Ideal roles</b>${list(insights.data.idealRoles)}
      <div class="note">${insights.ai ? 'AI-generated — review before acting on it.' : 'Standard guidance.'}</div></div>` : '';
  return page('JotMinds Professional Assessment Report', `
    <div class="eyebrow">PROFESSIONAL ASSESSMENT REPORT</div>
    <h1>${esc(who.name || 'Professional profile')}</h1>
    <div class="muted">${esc([who.position, who.organization].filter(Boolean).join(' · '))}${who.position || who.organization ? ' · ' : ''}Completed ${esc(date(entry.at))}</div>
    <h2>Overall profile</h2><div class="card"><b style="font-size:15px">${esc(p.overallProfile)}</b><div>${esc(p.summary)}</div></div>
    <h2>Dimensions</h2>${cards}${ins}`);
}

// ── Export ───────────────────────────────────────────────────────────────────

/** Renders HTML to a PDF file and opens the share sheet. Never throws. */
export async function exportPdf(html: string, dialogTitle: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    if (!(await Sharing.isAvailableAsync())) return { ok: false, error: 'Sharing isn’t available on this device.' };
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle });
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Could not create the PDF.' };
  }
}

const withTimeout = <T,>(p: Promise<T>, ms: number): Promise<T | null> =>
  Promise.race([p, new Promise<null>((r) => setTimeout(() => r(null), ms))]);

/** Gathers the (cached) AI content and exports the full cognitive report. */
export async function exportCognitiveReportPdf(
  report: CognitiveReport, who: { name?: string; position?: string; organization?: string },
) {
  const styles = report.complete
    ? { learning: report.domains.learning!.style, thinking: report.domains.thinking!.style, decision: report.domains.decision!.style }
    : null;
  const [summary, combined] = styles
    ? await Promise.all([
        withTimeout(generateExecutiveSummary({ name: who.name, position: who.position, organization: who.organization, ...styles }), 30000),
        withTimeout(generateCombinedInsights({
          userName: who.name, kolbStyle: styles.learning, sternbergStyle: styles.thinking, dualProcessStyle: styles.decision,
          scores: { learning: report.domains.learning!.scores, thinking: report.domains.thinking!.scores, decision: report.domains.decision!.scores },
        }), 30000),
      ])
    : [null, null];
  return exportPdf(buildCognitiveReportHtml({ report, who, summary, combined }), 'Cognitive report');
}

export async function exportProfessionalReportPdf(
  entry: ProfessionalCognitiveEntry, who: { name?: string; position?: string; organization?: string },
) {
  const p = entry.profile;
  const insights = await withTimeout(generateProfessionalInsights({
    name: who.name, position: who.position,
    learning: { style: p.learning.style, score: p.learning.score },
    thinking: { style: p.thinking.style, score: p.thinking.score },
    decisionMaking: { style: p.decisionMaking.style, score: p.decisionMaking.score },
  }), 30000);
  return exportPdf(buildProfessionalReportHtml({ entry, who, insights }), 'Professional assessment report');
}
