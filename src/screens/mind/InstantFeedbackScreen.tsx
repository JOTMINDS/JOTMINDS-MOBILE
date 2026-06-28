import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import { colors, radii, spacing } from '../../theme';

function generateFeedback(checkin: any) {
  const { focus_score, decision_delay, emotional_state } = checkin;

  const observations: Record<string, string> = {
    calm: 'You reported a calm emotional state today.',
    confident: 'You came in feeling confident today.',
    anxious: 'You reported feeling anxious today.',
    overwhelmed: 'You reported feeling overwhelmed today.',
    distracted: 'You reported feeling distracted today.',
  };

  const patterns: Record<string, string> = {
    calm: 'Calm states correlate with 23% higher accuracy in decision-making.',
    confident: 'Confident states often precede peak performance windows.',
    anxious: 'Anxiety narrows attentional focus — useful for detail work, limiting for creative tasks.',
    overwhelmed: 'Overwhelm signals your cognitive load is at its limit. Prioritisation is critical now.',
    distracted: 'Distraction is a sign of under-stimulation or context-switching fatigue.',
  };

  const implications: Record<number, string> = {
    1: 'A focus score of 1 suggests today wasn\'t ideal for deep work.',
    2: 'A focus score of 2 indicates significant interruptions or mental fatigue.',
    3: 'A focus score of 3 is average — you had productive and unproductive periods.',
    4: 'A focus score of 4 means you were largely in the zone today.',
    5: 'A focus score of 5 is peak performance. Excellent.',
  };

  const adjustments: Record<string, string> = {
    calm: 'Use this state for your most cognitively demanding tasks tomorrow.',
    confident: 'Channel this into a stretch goal or a decision you\'ve been avoiding.',
    anxious: 'Try the 4-7-8 breathing technique before your next high-stakes task.',
    overwhelmed: 'Write down every open loop in your head — then close 3 of them today.',
    distracted: 'Block 25 minutes of uninterrupted time before your next break.',
  };

  return {
    observation: observations[emotional_state] ?? 'You completed your daily check-in.',
    pattern: patterns[emotional_state] ?? 'Your emotional patterns shape how you think and decide.',
    implication: implications[focus_score] ?? 'Your focus score has been recorded.',
    adjustment: adjustments[emotional_state] ?? 'Stay consistent with your daily check-ins for better insights.',
  };
}

const FEEDBACK_ITEMS = [
  { key: 'observation', label: 'Observation', icon: '👁️', color: colors.cyan },
  { key: 'pattern', label: 'Pattern Insight', icon: '🔄', color: colors.purple },
  { key: 'implication', label: 'Performance Implication', icon: '⚡', color: colors.warning },
  { key: 'adjustment', label: 'Micro-Adjustment', icon: '🎯', color: colors.success },
];

export default function InstantFeedbackScreen({ route, navigation }: any) {
  const { checkin } = route.params;
  const feedback = route.params.feedback ?? generateFeedback(checkin);

  const emotionEmojis: Record<string, string> = {
    calm: '😌', confident: '💪', anxious: '😰', overwhelmed: '😵', distracted: '🌀',
  };

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Success header */}
        <LinearGradient
          colors={['#14136E', '#2C2E83']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <AppIcon name="✅" size={52} color="#FFFFFF" style={styles.checkmark} />
          <Text style={styles.heroTitle}>Check-In Complete!</Text>
          <Text style={styles.heroSub}>Here's your cognitive snapshot for today</Text>

          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{checkin.focus_score}/5</Text>
              <Text style={styles.statLabel}>Focus</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <AppIcon name={emotionEmojis[checkin.emotional_state] ?? '😐'} size={26} color="#FFFFFF" />
              <Text style={styles.statLabel}>{checkin.emotional_state}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <AppIcon
                name={checkin.decision_delay ? '⚠️' : '✅'}
                size={26}
                color={checkin.decision_delay ? colors.warning : colors.success}
              />
              <Text style={styles.statLabel}>Decisions</Text>
            </View>
          </View>
        </LinearGradient>

        {/* 4-part feedback */}
        <View style={styles.feedbackList}>
          {FEEDBACK_ITEMS.map((item, i) => {
            const text = feedback[item.key as keyof typeof feedback];
            return (
              <GlassCard key={item.key} style={styles.feedbackCard}>
                <View style={styles.feedbackHeader}>
                  <View style={[styles.feedbackIconWrap, { backgroundColor: `${item.color}22` }]}>
                    <AppIcon name={item.icon} size={18} color={item.color} />
                  </View>
                  <Text style={[styles.feedbackLabel, { color: item.color }]}>{item.label}</Text>
                  <View style={styles.feedbackNum}>
                    <Text style={styles.feedbackNumText}>{i + 1}</Text>
                  </View>
                </View>
                <Text style={styles.feedbackText}>{text}</Text>
              </GlassCard>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => navigation.navigate('MindHome')}
        >
          <LinearGradient
            colors={['#6E4D9C', '#3D52C9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.doneBtnGradient}
          >
            <Text style={styles.doneBtnText}>Back to Mind →</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 56, paddingHorizontal: spacing.xl, paddingBottom: 120 },
  hero: { borderRadius: radii.xl, padding: 28, alignItems: 'center', marginBottom: 24 },
  checkmark: { fontSize: 48, marginBottom: 12 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', marginBottom: 6 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 24 },
  statRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: radii.lg, padding: 16, width: '100%' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4, textTransform: 'capitalize' },
  statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.2)' },
  feedbackList: { gap: 14, marginBottom: 24 },
  feedbackCard: { marginBottom: 0 },
  feedbackHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  feedbackIconWrap: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  feedbackIcon: { fontSize: 18 },
  feedbackLabel: { fontSize: 13, fontWeight: '700', flex: 1 },
  feedbackNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.bgTertiary, justifyContent: 'center', alignItems: 'center' },
  feedbackNumText: { fontSize: 11, fontWeight: '700', color: colors.textSubtle },
  feedbackText: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
  doneBtn: { borderRadius: radii.md, overflow: 'hidden' },
  doneBtnGradient: { paddingVertical: 18, alignItems: 'center' },
  doneBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
