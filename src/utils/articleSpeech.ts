/** The text read aloud for an article: its title, then each section's heading and body. */
export function articleSpeech(title: string, sections: { heading: string; body: string }[]): string {
  const clean = (t: string) => t.replace(/\s+/g, ' ').trim();
  return [title, ...sections.map((s) => `${s.heading}. ${s.body}`)].map(clean).filter(Boolean).join('\n\n');
}
