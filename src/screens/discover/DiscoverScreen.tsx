import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { getAllAssessmentResults } from '../../utils/api';
import { completedDomains, CognitiveDomain } from '../../utils/profileCompleteness';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import { colors, radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

const INSIGHTS = [
  {
    id: '1',
    tag: 'COGNITIVE SCIENCE',
    title: 'Why You Think Differently Under Pressure',
    preview: 'Stress activates System 1 thinking — fast, intuitive, and prone to errors. Understanding this can help you slow down when it matters most.',
    icon: '🧠',
    gradient: ['#6E4D9C', '#4F46E5'] as [string, string],
    readTime: '3 min',
    category: 'pattern',
    domain: 'decision' as CognitiveDomain,
  },
  {
    id: '2',
    tag: 'LEARNING SCIENCE',
    title: 'The Spacing Effect: Why Cramming Fails',
    preview: 'Distributed practice consistently outperforms massed practice ("cramming") for long-term retention. Your brain consolidates memory during rest, not during study.',
    icon: '📚',
    gradient: ['#3D52C9', '#2E3FA8'] as [string, string],
    readTime: '4 min',
    category: 'snapshot',
    domain: 'learning' as CognitiveDomain,
  },
  {
    id: '3',
    tag: 'DECISION MAKING',
    title: 'The Paradox of Choice in Career Decisions',
    preview: 'More options don\'t lead to better decisions. Too many choices can make complex life decisions harder, not easier.',
    icon: '🎯',
    gradient: ['#EC4899', '#DB2777'] as [string, string],
    readTime: '5 min',
    category: 'strategic',
    domain: 'decision' as CognitiveDomain,
  },
  {
    id: '4',
    tag: 'METACOGNITION',
    title: 'Imposter Syndrome vs. Overconfidence',
    preview: 'High confidence + wrong answers = overconfidence. Low confidence + right answers = imposter syndrome. Where do you fall?',
    icon: '🪞',
    gradient: ['#F59E0B', '#D97706'] as [string, string],
    readTime: '4 min',
    category: 'coach',
    domain: 'thinking' as CognitiveDomain,
  },
  {
    id: '5',
    tag: 'PERFORMANCE',
    title: 'The Ultradian Rhythm: Your Brain\'s 90-Minute Cycle',
    preview: 'Your brain naturally cycles between high and low focus every 90 minutes. Working with this rhythm can meaningfully boost your output and focus.',
    icon: '⏱️',
    gradient: ['#10B981', '#059669'] as [string, string],
    readTime: '3 min',
    category: 'snapshot',
    domain: 'learning' as CognitiveDomain,
  },
];

const CATEGORIES = ['All', 'Pattern', 'Snapshot', 'Coach', 'Strategic'];

export default function DiscoverScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  const [myDomains, setMyDomains] = useState<Set<CognitiveDomain>>(new Set());

  useEffect(() => {
    getAllAssessmentResults()
      .then((res) => setMyDomains(completedDomains((res?.results ?? []).map((r: any) => r.assessmentType))))
      .catch(() => {});
  }, []);

  // Real personalization: insights matching a domain the user has actually
  // completed surface first, rather than a fixed order for every user.
  const sorted = [...INSIGHTS].sort((a, b) => {
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
        <View style={styles.header}>
          <Text style={styles.greeting}>Discover</Text>
          <Text style={styles.subtitle}>Insights tailored for you</Text>
        </View>

        {/* Featured card */}
        <TouchableOpacity
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
        </TouchableOpacity>

        {/* Category filter */}
        <ScrollView
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
        </ScrollView>

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
                  style={styles.insightIconWrap}
                >
                  <AppIcon name={insight.icon} size={24} color="#FFFFFF" />
                </LinearGradient>
                <View style={styles.insightContent}>
                  <Text style={styles.insightTag}>{insight.tag}</Text>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <Text style={styles.insightPreview} numberOfLines={2}>{insight.preview}</Text>
                  <Text style={styles.insightReadTime}>{insight.readTime} read</Text>
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
