import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import { colors, radii, spacing } from '../../theme';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 'GH₵ 0',
    period: 'forever',
    gradient: [colors.bgTertiary, colors.bgSecondary] as [string, string],
    features: [
      '3 cognitive assessments',
      'Daily Mind Check',
      'Weekly Snapshot (basic)',
      'Role Fit home screen',
      '5 Discover articles/month',
    ],
    locked: [
      'Export reports',
      'Advanced role comparisons',
      'Weekly report history',
      'Organization dashboards',
      'Candidate Comparison',
    ],
  },
  {
    id: 'premium',
    name: 'Premium Individual',
    price: 'GH₵ 49',
    period: '/month',
    gradient: ['#6E4D9C', '#3D52C9'] as [string, string],
    badge: 'MOST POPULAR',
    features: [
      'Everything in Free',
      'Export PDF reports',
      'Advanced role comparisons',
      'Full weekly report history',
      'Unlimited Discover articles',
      'Detailed Gap Map',
      'Adaptation plans',
    ],
    locked: [
      'Organization dashboards',
      'Candidate Comparison (HR)',
    ],
  },
  {
    id: 'organization',
    name: 'Organization Plan',
    price: 'GH₵ 299',
    period: '/month',
    gradient: ['#F59E0B', '#D97706'] as [string, string],
    badge: 'ENTERPRISE',
    features: [
      'Everything in Premium',
      'Organization dashboard',
      'Candidate Comparison',
      'Bulk user management',
      'Team cognitive analytics',
      'Dedicated account manager',
      'Custom org invite codes',
    ],
    locked: [],
  },
];

export default function SubscriptionScreen({ navigation }: any) {
  const { user } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const currentPlan = user?.subscriptionStatus ?? 'free';

  const handleSubscribe = (planId: string) => {
    if (planId === 'free') return;
    Alert.alert(
      'Upgrade Plan',
      `You're about to upgrade to the ${PLANS.find((p) => p.id === planId)?.name} plan. Payment integration with RevenueCat/Paystack coming soon.`,
      [{ text: 'OK' }],
    );
  };

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Plan</Text>
          <Text style={styles.subtitle}>Unlock the full JotMinds experience</Text>
        </View>

        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          const isSelected = selected === plan.id || isCurrent;

          return (
            <TouchableOpacity
              key={plan.id}
              style={[styles.planWrap, isSelected && styles.planWrapSelected]}
              onPress={() => setSelected(plan.id)}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={isSelected ? plan.gradient : [colors.bgSecondary, colors.bgTertiary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.planCard}
              >
                <View style={styles.planTop}>
                  <View>
                    {plan.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{plan.badge}</Text>
                      </View>
                    )}
                    <Text style={styles.planName}>{plan.name}</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.planPrice}>{plan.price}</Text>
                      <Text style={styles.planPeriod}>{plan.period}</Text>
                    </View>
                  </View>
                  {isCurrent && (
                    <View style={styles.currentBadge}>
                      <AppIcon name="✓" size={13} color="#FFFFFF" />
                      <Text style={styles.currentText}>Current</Text>
                    </View>
                  )}
                </View>

                <View style={styles.divider} />

                <View style={styles.featureList}>
                  {plan.features.map((f) => (
                    <View key={f} style={styles.featureRow}>
                      <AppIcon name="✓" size={15} color={colors.success} style={styles.featureCheck} />
                      <Text style={styles.featureText}>{f}</Text>
                    </View>
                  ))}
                  {plan.locked.map((f) => (
                    <View key={f} style={styles.featureRow}>
                      <AppIcon name="🔒" size={14} color="rgba(255,255,255,0.4)" style={styles.featureLock} />
                      <Text style={[styles.featureText, styles.featureTextLocked]}>{f}</Text>
                    </View>
                  ))}
                </View>

                {plan.id !== 'free' && !isCurrent && (
                  <TouchableOpacity
                    style={styles.upgradeBtn}
                    onPress={() => handleSubscribe(plan.id)}
                  >
                    <Text style={styles.upgradeBtnText}>
                      {plan.id === 'organization' ? 'Contact Sales' : 'Upgrade Now →'}
                    </Text>
                  </TouchableOpacity>
                )}
              </LinearGradient>
            </TouchableOpacity>
          );
        })}

        <Text style={styles.footnote}>
          Payments processed securely via Paystack / RevenueCat.{'\n'}
          Cancel anytime. No hidden fees.
        </Text>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 56, paddingHorizontal: spacing.xl, paddingBottom: 120 },
  backBtn: { marginBottom: 20 },
  backText: { fontSize: 15, color: colors.cyan, fontWeight: '600' },
  header: { marginBottom: 28 },
  title: { fontSize: 30, fontWeight: '800', color: colors.textPrimary, letterSpacing: -1 },
  subtitle: { fontSize: 15, color: colors.textMuted, marginTop: 4 },
  planWrap: { borderRadius: radii.xl, overflow: 'hidden', marginBottom: 16, borderWidth: 2, borderColor: 'transparent' },
  planWrapSelected: { borderColor: colors.purple },
  planCard: { padding: 24, borderRadius: radii.xl },
  planTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radii.pill, marginBottom: 8, alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 },
  planName: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  planPrice: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  planPeriod: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  currentBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: radii.pill,
  },
  currentText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginBottom: 20 },
  featureList: { gap: 10, marginBottom: 20 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureCheck: { fontSize: 14, color: colors.success, width: 20 },
  featureLock: { fontSize: 14, width: 20 },
  featureText: { fontSize: 13, color: 'rgba(255,255,255,0.85)', flex: 1 },
  featureTextLocked: { color: 'rgba(255,255,255,0.35)' },
  upgradeBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)', paddingVertical: 14,
    borderRadius: radii.md, alignItems: 'center',
  },
  upgradeBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  footnote: { fontSize: 11, color: colors.textSubtle, textAlign: 'center', lineHeight: 18, marginTop: 8 },
});
