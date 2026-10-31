import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { getAllAssessmentResults } from '../../utils/api';
import { completedDomains, CognitiveDomain } from '../../utils/profileCompleteness';
import { insightsFor, discoverAudience } from '../../data/discoverContent';
import { assessmentBand } from '../../utils/assessmentBand';
import { isJTIADone, getLastJTIAReport } from '../../utils/jtiaStatus';
import { loadTeacherStudents } from '../../utils/teacherStudents';
import { styleDistribution } from '../../utils/classInsights';
import { teachingFocus } from '../../utils/teachingFocus';
import { recommendTeacherArticles, orderByRecommendation, Recommendation } from '../../utils/teacherRecommendations';
import JotRobot from '../../components/kids/JotRobot';
import { DailyDiscoveryCard, StudyStrategyCard } from '../../components/ai/InsightCards';
import { stylesFromResults } from '../../utils/profileStyles';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import { colors, radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

const CATEGORIES = ['All', 'Pattern', 'Snapshot', 'Coach', 'Strategic'];

export default function DiscoverScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  const [myDomains, setMyDomains] = useState<Set<CognitiveDomain>>(new Set());
  const [learningStyle, setLearningStyle] = useState<string | undefined>();
  const [jtiaDone, setJtiaDone] = useState(false);
  const [recs, setRecs] = useState<Recommendation[]>([]);

  // Teachers and elementary learners get content written for them; everyone else the general set.
  const audience = discoverAudience(user?.role, assessmentBand(user));
  const isKids = audience === 'kids';
  const isTeacher = audience === 'teacher';
  const INSIGHTS = insightsFor(audience);

  useEffect(() => {
    if (audience !== 'general') return;
    getAllAssessmentResults()
      .then((res) => {
        setMyDomains(completedDomains((res?.results ?? []).map((r: any) => r.assessmentType)));
        setLearningStyle(stylesFromResults(res?.results ?? []).learning);
      })
      .catch(() => {});
  }, [audience]);

  useEffect(() => {
    if (!isTeacher) return;
    const refresh = () => {
      isJTIADone().then(setJtiaDone).catch(() => {});
      // Suggest articles from this class's styles and the teacher's own Teaching Insights.
      Promise.all([
        loadTeacherStudents().then((r) => styleDistribution(r.students)).catch(() => null),
        getLastJTIAReport().then(teachingFocus).catch(() => null),
      ]).then(([dist, focus]) => setRecs(recommendTeacherArticles(dist, focus)));
    };
    refresh();
    return navigation?.addListener?.('focus', refresh);
  }, [isTeacher, navigation]);

  // Real personalization: insights matching a domain the user has actually
  // completed surface first, rather than a fixed order for every user.
  const sorted = orderByRecommendation([...INSIGHTS], isTeacher ? recs : []).sort((a, b) => {
    const aMatch = myDomains.has(a.domain) ? 0 : 1;
    const bMatch = myDomains.has(b.domain) ? 0 : 1;
    return aMatch - bMatch;
  });

  const filtered = sorted.filter(
    (i) => activeCategory === 'All' || i.category === activeCategory.toLowerCase(),
  );

  const featured = sorted[0];

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, isKids && styles.headerKids]}>
          {isKids && <JotRobot mode="detective" size={84} />}
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Discover</Text>
            <Text style={styles.subtitle}>
              {isKids ? 'Fun facts for curious minds' : isTeacher ? 'Ideas for your classroom' : 'Insights tailored for you'}
            </Text>
          </View>
        </View>

        {/* Teachers: growth lives here (it was a separate Professional Development area) */}
        {isTeacher && (
          <View style={styles.growth}>
            <Text style={styles.growthLabel}>YOUR GROWTH</Text>
            <GlassCard padding={14} style={styles.growthCard} onPress={() => navigation.navigate(jtiaDone ? 'JTIAResults' : 'JTIAAssessment')}>
              <View style={styles.growthRow}>
                <LinearGradient colors={['#EC4899', '#DB2777']} style={styles.growthIcon}>
                  <AppIcon name="🎓" size={20} color="#FFFFFF" />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={styles.growthTitle}>Teaching Insights</Text>
                  <Text style={styles.growthSub}>{jtiaDone ? 'See your profile' : 'Find your teaching strengths'}</Text>
                </View>
                <Text style={styles.growthArrow}>→</Text>
              </View>
            </GlassCard>
            <GlassCard padding={14} style={styles.growthCard} onPress={() => navigation.navigate('TeacherDevelopment')}>
              <View style={styles.growthRow}>
                <LinearGradient colors={['#10B981', '#059669']} style={styles.growthIcon}>
                  <AppIcon name="🌟" size={20} color="#FFFFFF" />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={styles.growthTitle}>Growth modules</Text>
                  <Text style={styles.growthSub}>Short courses for your practice</Text>
                </View>
                <Text style={styles.growthArrow}>→</Text>
              </View>
            </GlassCard>
          </View>
        )}

        {audience === 'general' && <DailyDiscoveryCard />}
        {audience === 'general' && learningStyle && <StudyStrategyCard learningStyle={learningStyle} />}

        {/* Featured card */}
        {!isKids && <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => navigation.navigate('InsightDetail', { insight: featured })}
          style={styles.featuredWrap}
        >
          <LinearGradient
            colors={['#14136E', '#6E4D9C', '#3D52C9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.featuredCard}
          >
            <View style={styles.featuredTagRow}>
              <AppIcon name="✨" size={13} color="rgba(255,255,255,0.7)" />
              <Text style={styles.featuredTag}>FEATURED</Text>
            </View>
            <Text style={styles.featuredTitle}>{featured.title}</Text>
            <Text style={styles.featuredPreview} numberOfLines={2}>{featured.preview}</Text>
            <View style={styles.featuredMeta}>
              <Text style={styles.featuredReadTime}>{featured.readTime} read</Text>
              <Text style={styles.featuredArrow}>Read More →</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>}

        {/* Category filter */}
        {audience === 'general' && <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
          style={styles.categoriesScroll}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[styles.categoryChip, activeCategory === cat && styles.categoryChipActive]}
            >
              <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>}

        {/* Insight cards */}
        <View style={styles.section}>
          {filtered.map((insight) => (
            <GlassCard
              key={insight.id}
              style={styles.insightCard}
              onPress={() => navigation.navigate('InsightDetail', { insight })}
            >
              <View style={styles.insightRow}>
                <LinearGradient
                  colors={insight.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.insightIconWrap, isKids && styles.insightIconWrapKids]}
                >
                  <AppIcon name={insight.icon} size={isKids ? 32 : 24} color="#FFFFFF" />
                </LinearGradient>
                <View style={styles.insightContent}>
                  {!isKids && <Text style={styles.insightTag}>{insight.tag}</Text>}
                  <Text style={[styles.insightTitle, isKids && styles.insightTitleKids]}>{insight.title}</Text>
                  {isKids && <Text style={styles.insightPreviewKids}>{insight.preview}</Text>}
                  {!isKids && <Text style={styles.insightReadTime}>{insight.readTime} read</Text>}
                  {isTeacher && !!recs.find((r) => r.id === insight.id) && (
                    <Text style={styles.reason}>★ {recs.find((r) => r.id === insight.id)!.reason}</Text>
                  )}
                </View>
              </View>
            </GlassCard>
          ))}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: {
    paddingTop: 8,
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 24,
  },
  headerKids: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  growth: { marginBottom: 20 },
  growthLabel: { fontSize: 11, fontWeight: '700', color: colors.textSubtle, letterSpacing: 1.4, marginBottom: 10 },
  growthCard: { marginBottom: 10 },
  growthRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  growthIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  growthTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  growthSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  growthArrow: { fontSize: 18, color: colors.textMuted, fontWeight: '700' },
  reason: { fontSize: 12, fontWeight: '700', color: colors.cyan, marginTop: 6 },
  insightIconWrapKids: { width: 64, height: 64, borderRadius: 20 },
  insightTitleKids: { fontSize: 19, lineHeight: 25 },
  insightPreviewKids: { fontSize: 15, color: colors.textMuted, lineHeight: 21 },
  greeting: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    marginTop: 4,
  },
  featuredWrap: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    marginBottom: 24,
  },
  featuredCard: {
    padding: 24,
    borderRadius: radii.xl,
    minHeight: 180,
    justifyContent: 'space-between',
  },
  featuredTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  featuredTag: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.5,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    lineHeight: 26,
    marginBottom: 10,
    flex: 1,
  },
  featuredPreview: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 19,
    marginBottom: 16,
  },
  featuredMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredReadTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  featuredArrow: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  categoriesScroll: {
    marginBottom: 20,
  },
  categoriesRow: {
    gap: 8,
    paddingRight: 20,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  categoryChipActive: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  section: {
    gap: 12,
  },
  insightCard: {
    marginBottom: 0,
  },
  insightRow: {
    flexDirection: 'row',
    gap: 14,
  },
  insightIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  insightIcon: { fontSize: 24 },
  insightContent: { flex: 1 },
  insightTag: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.cyan,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 20,
    marginBottom: 6,
  },
  insightPreview: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 8,
  },
  insightReadTime: {
    fontSize: 11,
    color: colors.textSubtle,
    fontWeight: '600',
  },
});
