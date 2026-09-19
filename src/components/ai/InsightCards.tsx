import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AICard, { useAIData, Bullets, useAICardStyles } from './AICard';
import {
  generateExecutiveSummary, generateAssessmentInsights, generateCombinedInsights, generateStudentRecommendations,
  generateProfessionalInsights, generateParentSupportTips, generateStudyStrategy, generateDailyDiscovery,
  generateCareerInsights, generateClassroomOverview, generateIntervention, generateTeachingStrategies,
  AIResult, ExecutiveSummary, CombinedInsights, StudentRecommendation, ProfessionalInsights, ClassroomOverview,
  InterventionPlan, AssessmentInsights, generateEducationalResources,
} from '../../utils/aiGenerators';

type S = ReturnType<typeof useAICardStyles>;

/** Adapts a generator that returns AIResult<T> to the card hook + AI flag. */
function useResult<T>(load: (force: boolean) => Promise<AIResult<T>>, deps: React.DependencyList, enabled = true) {
  const r = useAIData<AIResult<T>>(load, deps, enabled);
  return { ...r, value: r.data?.data ?? null, ai: r.data?.ai ?? false };
}

// ── Executive summary ────────────────────────────────────────────────────────
export function ExecutiveSummaryCard({ profile, enabled = true }: { profile: any; enabled?: boolean }) {
  const s = useAICardStyles();
  const { value, ai, loading, refresh } = useResult<ExecutiveSummary>((f) => generateExecutiveSummary(profile, { force: f }), [JSON.stringify(profile)], enabled);
  return (
    <AICard title="Your cognitive summary" loading={loading && enabled} empty={!value} ai={ai} onRefresh={refresh}>
      {value && (
        <>
          <Text style={s.text}>{value.narrativeSummary}</Text>
          <Text style={s.sub}>KEY TAKEAWAY</Text>
          <Text style={s.text}>{value.keyTakeaway}</Text>
          <Text style={s.quote}>“{value.personalizedMantra}”</Text>
        </>
      )}
    </AICard>
  );
}

// ── Per-assessment insights ──────────────────────────────────────────────────
export function AssessmentInsightsCard({ params, enabled = true }: {
  params: { scores: Record<string, any>; type?: string; role?: string; context?: Record<string, any> }; enabled?: boolean;
}) {
  const s = useAICardStyles();
  const { data, loading, refresh } = useAIData<AssessmentInsights>((f) => generateAssessmentInsights(params, { force: f }), [JSON.stringify(params)], enabled);
  return (
    <AICard title="AI insights for you" loading={loading && enabled} empty={!data} onRefresh={refresh}>
      {data && (
        <>
          <Text style={s.strong}>{data.archetype.name}</Text>
          <Text style={s.text}>{data.archetype.tagline}</Text>
          {!!data.summary && <Text style={[s.text, { marginTop: 8 }]}>{data.summary}</Text>}
          <Text style={s.sub}>STRENGTHS</Text><Bullets items={data.strengths} styles={s} />
          <Text style={s.sub}>GROWTH AREAS</Text><Bullets items={data.weaknesses ?? []} styles={s} />
          <Text style={s.sub}>NEXT STEPS</Text><Bullets items={data.improvements ?? []} styles={s} />
        </>
      )}
    </AICard>
  );
}

// ── Combined three-framework profile ─────────────────────────────────────────
export function CombinedInsightsCard({ params, enabled = true }: {
  params: { userName?: string; kolbStyle?: string; sternbergStyle?: string; dualProcessStyle?: string; scores?: any }; enabled?: boolean;
}) {
  const s = useAICardStyles();
  const { value, ai, loading, refresh } = useResult<CombinedInsights>((f) => generateCombinedInsights(params, { force: f }), [JSON.stringify(params)], enabled);
  return (
    <AICard title="Your full cognitive profile" loading={loading && enabled} empty={!value} ai={ai} onRefresh={refresh}>
      {value && (
        <>
          <Text style={s.sub}>STRENGTHS</Text><Bullets items={value.strengths} styles={s} />
          <Text style={s.sub}>GROWTH AREAS</Text><Bullets items={value.growthAreas} styles={s} />
          <Text style={s.sub}>RECOMMENDATIONS</Text><Bullets items={value.recommendations} styles={s} />
        </>
      )}
    </AICard>
  );
}

// ── Student recommendations ──────────────────────────────────────────────────
const CAT_LABEL: Record<StudentRecommendation['category'], string> = { learning: 'LEARNING', exam: 'EXAMS', career: 'CAREER' };

export function StudentRecommendationsCard({ params, enabled = true }: {
  params: { name?: string; learningStyle: string; thinkingStyle: string; decisionStyle: string; educationLevel?: string }; enabled?: boolean;
}) {
  const s = useAICardStyles();
  const { value, ai, loading, refresh } = useResult<StudentRecommendation[]>((f) => generateStudentRecommendations(params, { force: f }), [JSON.stringify(params)], enabled);
  return (
    <AICard title="Recommended for you" loading={loading && enabled} empty={!value?.length} ai={ai} onRefresh={refresh}>
      {value?.map((r) => (
        <View key={r.id} style={s.block}>
          <View style={s.chip}><Text style={s.chipText}>{CAT_LABEL[r.category]} · {r.tag}</Text></View>
          <Text style={s.strong}>{r.title}</Text>
          <Text style={s.text}>{r.description}</Text>
        </View>
      ))}
    </AICard>
  );
}

// ── Professional ─────────────────────────────────────────────────────────────
export function ProfessionalInsightsCard({ profile, enabled = true }: { profile: any; enabled?: boolean }) {
  const s = useAICardStyles();
  const { value, ai, loading, refresh } = useResult<ProfessionalInsights>((f) => generateProfessionalInsights(profile, { force: f }), [JSON.stringify(profile)], enabled);
  return (
    <AICard title="Professional insights" loading={loading && enabled} empty={!value} ai={ai} onRefresh={refresh}>
      {value && (
        <>
          <Text style={s.text}>{value.leadershipInsight}</Text>
          <Text style={s.sub}>STRENGTHS</Text><Bullets items={value.strengths} styles={s} />
          <Text style={s.sub}>DEVELOPMENT AREAS</Text><Bullets items={value.developmentAreas} styles={s} />
          <Text style={s.sub}>RECOMMENDATIONS</Text><Bullets items={value.recommendations} styles={s} />
          <Text style={s.sub}>IDEAL ROLES</Text><Bullets items={value.idealRoles} styles={s} />
        </>
      )}
    </AICard>
  );
}

// ── Parent tips ──────────────────────────────────────────────────────────────
export function ParentTipsCard({ data, childName, enabled = true }: { data: any; childName?: string; enabled?: boolean }) {
  const s = useAICardStyles();
  const { data: tips, loading, refresh } = useAIData<string[]>((f) => generateParentSupportTips(data, { force: f }), [JSON.stringify(data)], enabled);
  return (
    <AICard title={childName ? `Supporting ${childName} at home` : 'Supporting your child at home'} loading={loading && enabled} empty={!tips?.length} onRefresh={refresh}>
      <Bullets items={tips ?? []} styles={s} />
    </AICard>
  );
}

// ── Study strategy ───────────────────────────────────────────────────────────
export function StudyStrategyCard({ learningStyle }: { learningStyle: string }) {
  const s = useAICardStyles();
  const [subject, setSubject] = useState('General Academics');
  const SUBJECTS = ['General Academics', 'Mathematics', 'Science', 'English', 'Social Studies'];
  const { data, loading, refresh } = useAIData((f) => generateStudyStrategy(subject, learningStyle, undefined, { force: f }), [subject, learningStyle]);
  return (
    <AICard title="Study strategy" loading={loading} empty={!data} onRefresh={refresh}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        {SUBJECTS.map((x) => (
          <TouchableOpacity key={x} onPress={() => setSubject(x)} accessibilityRole="button" accessibilityState={{ selected: x === subject }}>
            <View style={[s.chip, x === subject && s.optionRight]}><Text style={s.chipText}>{x}</Text></View>
          </TouchableOpacity>
        ))}
      </View>
      {data && (
        <>
          <Text style={s.text}>{data.weeklyRoutine}</Text>
          {data.techniques.map((t, i) => (
            <View key={i} style={{ marginTop: 10 }}>
              <Text style={s.strong}>{t.name} · {t.duration}</Text>
              <Text style={s.text}>{t.description}</Text>
            </View>
          ))}
        </>
      )}
    </AICard>
  );
}

// ── Daily discovery (mini quiz) ──────────────────────────────────────────────
export function DailyDiscoveryCard() {
  const s = useAICardStyles();
  const [picked, setPicked] = useState<number | null>(null);
  const { data, loading } = useAIData((f) => generateDailyDiscovery(), []);
  return (
    <AICard title={data ? `Discovery of the day: ${data.title}` : 'Discovery of the day'} icon="🔭" loading={loading} empty={!data}>
      {data && (
        <>
          <Text style={s.text}>{data.fact}</Text>
          <Text style={[s.strong, { marginTop: 10 }]}>{data.challengeQuestion}</Text>
          {data.options.map((o, i) => {
            const answered = picked !== null;
            const right = answered && i === data.correctAnswerIndex;
            const wrong = answered && i === picked && i !== data.correctAnswerIndex;
            return (
              <TouchableOpacity key={i} disabled={answered} onPress={() => setPicked(i)} accessibilityRole="button">
                <View style={[s.option, right && s.optionRight, wrong && s.optionWrong]}><Text style={s.text}>{o}</Text></View>
              </TouchableOpacity>
            );
          })}
          {picked !== null && <Text style={[s.text, { marginTop: 10 }]}>{picked === data.correctAnswerIndex ? '✅ ' : '💡 '}{data.explanation}</Text>}
        </>
      )}
    </AICard>
  );
}

// ── Career insights ──────────────────────────────────────────────────────────
export function CareerInsightsCard({ archetype, strengths, scores, enabled = true }: {
  archetype: string; strengths: string[]; scores?: any; enabled?: boolean;
}) {
  const s = useAICardStyles();
  const { data, loading, refresh } = useAIData((f) => generateCareerInsights(archetype, strengths, scores, { force: f }), [archetype, strengths.join('|')], enabled);
  return (
    <AICard title="AI career guidance" icon="🧭" loading={loading && enabled} empty={!data} onRefresh={refresh}>
      {data && (
        <>
          <Text style={s.text}>{data.advice}</Text>
          {data.careerMatches.map((c, i) => (
            <View key={i} style={{ marginTop: 10 }}>
              <Text style={s.strong}>{c.title}</Text>
              <Text style={s.text}>{c.rationale}</Text>
              {!!c.keySkills?.length && <Text style={[s.text, { marginTop: 3 }]}>Key skills: {c.keySkills.join(', ')}</Text>}
            </View>
          ))}
        </>
      )}
    </AICard>
  );
}

// ── Teacher ──────────────────────────────────────────────────────────────────
export function ClassroomOverviewCard({ params, enabled = true }: {
  params: { className: string; studentCount: number; dominantLearning: string; dominantThinking: string; dominantDecision?: string }; enabled?: boolean;
}) {
  const s = useAICardStyles();
  const { value, ai, loading, refresh } = useResult<ClassroomOverview>((f) => generateClassroomOverview(params, { force: f }), [JSON.stringify(params)], enabled);
  return (
    <AICard title={`Teaching ${params.className}`} icon="🏫" loading={loading && enabled} empty={!value} ai={ai} onRefresh={refresh}>
      {value && (
        <>
          <Text style={s.sub}>LEARNING</Text><Text style={s.text}>{value.learningInsight}</Text>
          <Text style={s.sub}>THINKING</Text><Text style={s.text}>{value.thinkingInsight}</Text>
          <Text style={s.sub}>DECISIONS & TESTS</Text><Text style={s.text}>{value.decisionInsight}</Text>
          <Text style={s.quote}>{value.synergySummary}</Text>
        </>
      )}
    </AICard>
  );
}

const PRIORITY_LABEL: Record<InterventionPlan['priority'], string> = { urgent: '🔴 URGENT', normal: '🟠 NORMAL', optional: '🟢 OPTIONAL' };

export function InterventionCard({ params, enabled = true }: {
  params: { studentName: string; riskLevel: string; strengths: string[]; gaps: string[]; dominantStyle: string }; enabled?: boolean;
}) {
  const s = useAICardStyles();
  const { value, ai, loading, refresh } = useResult<InterventionPlan>((f) => generateIntervention(params, { force: f }), [JSON.stringify(params)], enabled);
  return (
    <AICard title={`Support plan: ${params.studentName}`} icon="🎯" loading={loading && enabled} empty={!value} ai={ai} onRefresh={refresh}>
      {value && (
        <>
          <Text style={s.sub}>{PRIORITY_LABEL[value.priority]}</Text>
          <Text style={s.strong}>{value.focus}</Text>
          <Bullets items={value.suggestions} styles={s} />
        </>
      )}
    </AICard>
  );
}

export function TeachingStrategiesCard({ studentData, studentName, enabled = true }: { studentData: any; studentName?: string; enabled?: boolean }) {
  const s = useAICardStyles();
  const { data, loading, refresh } = useAIData((f) => generateTeachingStrategies(studentData, { force: f }), [JSON.stringify(studentData)], enabled);
  return (
    <AICard title={studentName ? `Teaching ${studentName}` : 'Teaching strategies'} icon="🍎" loading={loading && enabled} empty={!data} onRefresh={refresh}>
      {data && (
        <>
          {data.quickInsights?.map((q, i) => <Text key={i} style={s.text}>{q.icon}  {q.text}</Text>)}
          <Text style={s.sub}>STRATEGIES</Text><Bullets items={data.teachingStrategies} styles={s} />
          {!!data.educationalResources?.length && (
            <>
              <Text style={s.sub}>RESOURCES</Text>
              {data.educationalResources.map((r, i) => (
                <View key={i} style={{ marginBottom: 8 }}>
                  <Text style={s.strong}>{r.title} · {r.type}</Text>
                  <Text style={s.text}>{r.description} {r.whyHelps}</Text>
                </View>
              ))}
            </>
          )}
        </>
      )}
    </AICard>
  );
}

// ── AI-first insights on result screens (the webapp's `aiInsights || fallbackInsights`) ──────────

type InsightParams = Parameters<typeof generateAssessmentInsights>[0];

/**
 * Loads AI insights for a result screen. Pass null until the result exists (hooks can't be
 * conditional). `algorithmicGuidance` should carry the rule-based text so the model is grounded
 * in it — and so the screen can fall back to it when the AI is unavailable.
 */
export function useAIAssessmentInsights(params: InsightParams | null) {
  return useAIData<AssessmentInsights>(
    (force) => generateAssessmentInsights(params!, { force }),
    [JSON.stringify(params)],
    params !== null,
  );
}

/** Banner above the insight sections: loading, the AI archetype + summary, or an honest fallback notice. */
export function AIInsightsBanner({ ai }: { ai: { loading: boolean; data: AssessmentInsights | null; refresh: () => void } }) {
  const s = useAICardStyles();
  return (
    <AICard title={ai.data ? ai.data.archetype.name : 'AI insights'} icon="✦" loading={ai.loading} ai={!!ai.data} onRefresh={ai.refresh}>
      {ai.data ? (
        <>
          <Text style={s.text}>{ai.data.archetype.tagline}</Text>
          {!!ai.data.summary && <Text style={[s.text, { marginTop: 8 }]}>{ai.data.summary}</Text>}
        </>
      ) : (
        <>
          <Text style={s.text}>AI insights aren’t available right now, so you’re seeing our standard insights for your style.</Text>
          <TouchableOpacity onPress={ai.refresh} accessibilityRole="button" style={{ marginTop: 8 }}>
            <Text style={s.link}>Try again</Text>
          </TouchableOpacity>
        </>
      )}
    </AICard>
  );
}

// ── Educational resources for a parent / teacher ─────────────────────────────
const RESOURCE_ICON: Record<string, string> = { article: '📄', video: '🎬', guide: '📘', tip: '💡' };

export function EducationalResourcesCard({ userType, styles: st, enabled = true }: {
  userType: 'parent' | 'teacher'; styles: { learning?: string; thinking?: string; decision?: string }; enabled?: boolean;
}) {
  const s = useAICardStyles();
  const params = { learningStyle: st.learning, thinkingStyle: st.thinking, decisionStyle: st.decision, userType };
  const { data, loading, refresh } = useAIData((f) => generateEducationalResources(params, { force: f }), [JSON.stringify(params)], enabled);
  return (
    <AICard title="Recommended resources" icon="📚" loading={loading && enabled} empty={!data?.length} onRefresh={refresh}>
      {data?.map((r, i) => (
        <View key={i} style={s.block}>
          <Text style={s.strong}>{RESOURCE_ICON[r.type] ?? '📘'} {r.title}</Text>
          <Text style={s.text}>{r.description}</Text>
          {!!r.relevance && <Text style={[s.text, { marginTop: 3, fontStyle: 'italic' }]}>{r.relevance}</Text>}
        </View>
      ))}
    </AICard>
  );
}
