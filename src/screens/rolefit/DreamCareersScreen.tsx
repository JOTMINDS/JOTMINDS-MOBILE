import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator,
} from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { getAllAssessmentResults } from '../../utils/api';
import {
  calculateRoleFitScore, mapMobileProfileToDimensions, CognitiveRoleFitScore, RoleCognitiveDemand,
} from '../../utils/roleFitEngine';
import { GLOBAL_CAREERS, GlobalCareer } from '../../data/globalCareers';
import { missingCognitiveDomains } from '../../utils/profileCompleteness';
import {
  getDreamCareers, toggleDreamCareer, MAX_DREAM_CAREERS,
} from '../../utils/dreamCareers';
import { askJotti } from '../../utils/aiService';
import { rs } from '../../utils/responsive';
import { radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

const DIM_LABEL: Record<keyof RoleCognitiveDemand, string> = {
  analyticalDepth: 'analytical depth',
  ambiguityTolerance: 'comfort with ambiguity',
  emotionalLaborLoad: 'emotional stamina',
  decisionSpeed: 'decision speed',
  stakeholderComplexity: 'stakeholder navigation',
  repetitionVsInnovation: 'appetite for novelty',
  socialExposure: 'social energy',
  detailSensitivity: 'detail orientation',
  autonomyRequired: 'independent judgement',
  cognitiveLoadVolatility: 'handling shifting demands',
};

function topGaps(fit: CognitiveRoleFitScore): string[] {
  return Object.entries(fit.gapMap)
    .map(([k, v]) => ({ k: k as keyof RoleCognitiveDemand, gap: v.gap }))
    .filter((x) => x.gap > 1)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3)
    .map((x) => DIM_LABEL[x.k]);
}

export default function DreamCareersScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const toast = useToast();
  const { user } = useAuth();

  const [ids, setIds] = useState<string[]>([]);
  const [candidate, setCandidate] = useState<RoleCognitiveDemand | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [picking, setPicking] = useState(false);
  const [tips, setTips] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const [saved, results] = await Promise.all([
      getDreamCareers(),
      getAllAssessmentResults().then((d) => d?.results ?? []).catch(() => []),
    ]);
    setIds(saved);
    const complete = missingCognitiveDomains(results.map((r: any) => r.assessmentType)).length === 0;
    setHasProfile(complete);
    if (complete) setCandidate(mapMobileProfileToDimensions(results));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const shortlist = useMemo(
    () => ids.map((id) => GLOBAL_CAREERS.find((c) => c.id === id)).filter(Boolean) as GlobalCareer[],
    [ids],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GLOBAL_CAREERS
      .filter((c) => !ids.includes(c.id))
      .filter((c) => !q || c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q))
      .slice(0, 30);
  }, [query, ids]);

  const toggle = async (id: string) => {
    if (!ids.includes(id) && ids.length >= MAX_DREAM_CAREERS) {
      toast.info(`You can shortlist up to ${MAX_DREAM_CAREERS} careers.`);
      return;
    }
    setIds(await toggleDreamCareer(id));
  };

  // AI training/tools recommendation per shortlisted career (once each, per session).
  useEffect(() => {
    shortlist.forEach(async (c) => {
      if (tips[c.id]) return;
      const reply = await askJotti(
        `I want to become a ${c.title}. In 2 short sentences, name the single most valuable ` +
          `course, certification or tool to start with, and one free way to practice. No preamble.`,
        { role: user?.role },
      );
      if (reply) setTips((t) => ({ ...t, [c.id]: reply.trim() }));
    });
  }, [shortlist, user?.role]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return <ScreenBackground><View style={styles.centered}><ActivityIndicator size="large" color={colors.purple} /></View></ScreenBackground>;
  }

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10} style={styles.backRow}>
          <Text style={styles.backText}>← Role Fit</Text>
        </TouchableOpacity>
        <Text style={styles.h1}>Dream Careers</Text>
        <Text style={styles.meta}>
          Shortlist up to {MAX_DREAM_CAREERS} careers you're aiming for. We'll show how your
          thinking fits each — and what to build to close the gap.
        </Text>

        {/* Shortlist */}
        {shortlist.length === 0 ? (
          <GlassCard variant="dark" padding={20} style={styles.card}>
            <Text style={styles.emptyText}>Nothing shortlisted yet. Add a career below.</Text>
          </GlassCard>
        ) : (
          shortlist.map((c) => {
            const fit = candidate ? calculateRoleFitScore(candidate, c.demands) : null;
            const gaps = fit ? topGaps(fit) : [];
            return (
              <GlassCard key={c.id} variant="dark" padding={16} style={styles.card}>
                <View style={styles.shortHead}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.shortTitle}>{c.title}</Text>
                    <Text style={styles.shortCat}>{c.category}</Text>
                  </View>
                  {fit && (
                    <View style={styles.fitPill}>
                      <Text style={styles.fitScore}>{fit.fitScore}</Text>
                      <Text style={styles.fitLabel}>{fit.fitCategory}</Text>
                    </View>
                  )}
                  <TouchableOpacity onPress={() => toggle(c.id)} hitSlop={8} style={{ marginLeft: 8 }}>
                    <AppIcon name="✕" size={15} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>

                {!hasProfile && (
                  <Text style={styles.needProfile}>
                    Finish your cognitive profile to see your fit and gaps for this role.
                  </Text>
                )}

                {gaps.length > 0 && (
                  <Text style={styles.gaps}>Build: {gaps.join(' · ')}</Text>
                )}

                <View style={styles.tipBox}>
                  <Text style={styles.tipLabel}>✦ WHERE TO START</Text>
                  <Text style={styles.tipText}>
                    {tips[c.id] ?? c.description}
                  </Text>
                </View>
              </GlassCard>
            );
          })
        )}

        {/* Add careers */}
        <TouchableOpacity style={styles.addToggle} onPress={() => setPicking((p) => !p)}>
          <Text style={styles.addToggleText}>
            {picking ? 'Done adding' : `+ Add a career (${shortlist.length}/${MAX_DREAM_CAREERS})`}
          </Text>
        </TouchableOpacity>

        {picking && (
          <>
            <TextInput
              style={styles.search}
              value={query}
              onChangeText={setQuery}
              placeholder="Search careers…"
              placeholderTextColor={colors.textSubtle}
            />
            {filtered.map((c) => (
              <TouchableOpacity key={c.id} style={styles.pickRow} onPress={() => toggle(c.id)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pickTitle}>{c.title}</Text>
                  <Text style={styles.pickCat}>{c.category}</Text>
                </View>
                <AppIcon name="+" size={16} color={colors.cyan} />
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingHorizontal: spacing.xl, paddingTop: 12, paddingBottom: 48 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backRow: { marginBottom: 10 },
  backText: { fontSize: rs(14), color: colors.textMuted, fontWeight: '600' },
  h1: { fontSize: rs(24), fontWeight: '800', color: colors.text, letterSpacing: -0.5, marginBottom: 6 },
  meta: { fontSize: rs(13), color: colors.textMuted, marginBottom: 18, lineHeight: rs(19) },
  emptyText: { fontSize: rs(13), color: colors.textMuted },

  card: { marginBottom: 12 },
  shortHead: { flexDirection: 'row', alignItems: 'center' },
  shortTitle: { fontSize: rs(15), fontWeight: '800', color: colors.text },
  shortCat: { fontSize: rs(12), color: colors.textMuted, marginTop: 2 },
  fitPill: { alignItems: 'flex-end' },
  fitScore: { fontSize: rs(20), fontWeight: '900', color: colors.cyan },
  fitLabel: { fontSize: rs(9), fontWeight: '700', color: colors.textMuted, letterSpacing: 0.3 },
  needProfile: { fontSize: rs(12), color: colors.warning, marginTop: 8, lineHeight: rs(17) },
  gaps: { fontSize: rs(12), color: colors.textSecondary, marginTop: 10, fontWeight: '600' },
  tipBox: {
    marginTop: 12, padding: 12, borderRadius: radii.md,
    backgroundColor: colors.glassMedium, borderWidth: 1, borderColor: colors.borderLight,
  },
  tipLabel: { fontSize: rs(10), fontWeight: '800', color: colors.cyan, letterSpacing: 0.6, marginBottom: 4 },
  tipText: { fontSize: rs(12), color: colors.textSecondary, lineHeight: rs(18) },

  addToggle: { alignSelf: 'center', paddingVertical: 14, marginTop: 4 },
  addToggleText: { fontSize: rs(14), color: colors.purple, fontWeight: '800' },
  search: {
    backgroundColor: colors.glassMedium, borderRadius: radii.md, borderWidth: 1, borderColor: colors.borderLight,
    padding: 13, fontSize: rs(14), color: colors.text, marginBottom: 8,
  },
  pickRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 13, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  pickTitle: { fontSize: rs(14), fontWeight: '600', color: colors.text },
  pickCat: { fontSize: rs(11), color: colors.textMuted, marginTop: 1 },
});
