import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import { colors, radii, shadow, spacing } from '../../theme';

interface RoleOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: [string, string];
  features: string[];
}

export default function EnhancedRoleSelectionScreen({ navigation }: any) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [ageGroup, setAgeGroup] = useState<string | null>(null);

  const roles: RoleOption[] = [
    {
      id: 'student',
      title: 'Student',
      description: 'Build cognitive skills and track your learning journey',
      icon: '🎓',
      gradient: ['#6E4D9C', '#5A3E82'],
      features: [
        'Interactive skill-building exercises',
        'Personalized learning paths',
        'Progress tracking & insights',
      ],
    },
    {
      id: 'parent',
      title: 'Parent',
      description: 'Support your child\'s cognitive development',
      icon: '👨‍👩‍👧‍👦',
      gradient: ['#EC4899', '#DB2777'],
      features: [
        'Expert coaching pathways',
        'Child progress monitoring',
        '1-on-1 specialist consultations',
      ],
    },
    {
      id: 'teacher',
      title: 'Teacher',
      description: 'Enhance your teaching practice and student outcomes',
      icon: '👨‍🏫',
      gradient: ['#10B981', '#059669'],
      features: [
        'Professional development modules',
        'Teaching style assessment',
        'Classroom insights & analytics',
      ],
    },
    {
      id: 'professional',
      title: 'Professional',
      description: 'Optimize cognitive performance for career success',
      icon: '💼',
      gradient: ['#3D52C9', '#2E3FA8'],
      features: [
        'Advanced cognitive training',
        'Performance analytics',
        'Executive function tools',
      ],
    },
  ];

  const ageGroups = [
    { id: '7-12', label: 'Ages 7-12', description: 'Fun & simplified' },
    { id: '13+', label: 'Ages 13+', description: 'Full experience' },
  ];

  const selectedRoleData = roles.find((r) => r.id === selectedRole);

  const handleContinue = () => {
    if (selectedRole === 'student' && !ageGroup) {
      return; // Need age selection for students
    }

    navigation.navigate('Signup', {
      role: selectedRole,
      ageGroup: ageGroup || '13+',
    });
  };

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.progressSteps}>
            <View style={[styles.step, styles.stepActive]}>
              <Text style={styles.stepText}>1</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.step}>
              <Text style={[styles.stepText, styles.stepTextInactive]}>2</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.step}>
              <Text style={[styles.stepText, styles.stepTextInactive]}>3</Text>
            </View>
          </View>
          <Text style={styles.headerTitle}>Choose Your Role</Text>
          <Text style={styles.headerSubtitle}>
            Select how you'll be using JotMinds
          </Text>
        </View>

        <View style={styles.section}>
          {roles.map((role) => {
            const isSelected = selectedRole === role.id;
            return (
              <TouchableOpacity
                key={role.id}
                onPress={() => setSelectedRole(role.id)}
              >
                <GlassCard
                  padding={0}
                  style={[
                    styles.roleCard,
                    isSelected && { borderColor: role.gradient[0], borderWidth: 3 },
                  ]}
                >
                  <LinearGradient
                    colors={role.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.roleHeader}
                  >
                    <Text style={styles.roleIcon}>{role.icon}</Text>
                    <View style={styles.roleHeaderText}>
                      <Text style={styles.roleTitle}>{role.title}</Text>
                      {isSelected && (
                        <View style={styles.selectedBadge}>
                          <Text style={styles.selectedText}>✓ Selected</Text>
                        </View>
                      )}
                    </View>
                  </LinearGradient>
                  <View style={styles.roleBody}>
                    <Text style={styles.roleDescription}>{role.description}</Text>
                    <View style={styles.featuresList}>
                      {role.features.map((feature, index) => (
                        <View key={index} style={styles.featureRow}>
                          <Text style={styles.featureDot}>•</Text>
                          <Text style={styles.featureText}>{feature}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedRole === 'student' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Age Group</Text>
            <View style={styles.ageGroupRow}>
              {ageGroups.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  onPress={() => setAgeGroup(group.id)}
                  style={styles.ageGroupContainer}
                >
                  <GlassCard
                    padding={20}
                    style={[
                      styles.ageGroupCard,
                      ageGroup === group.id && styles.ageGroupCardSelected,
                    ]}
                  >
                    <Text style={styles.ageGroupLabel}>{group.label}</Text>
                    <Text style={styles.ageGroupDescription}>
                      {group.description}
                    </Text>
                    {ageGroup === group.id && (
                      <View style={styles.ageGroupCheck}>
                        <Text style={styles.ageGroupCheckText}>✓</Text>
                      </View>
                    )}
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {selectedRole && (!['student'].includes(selectedRole) || ageGroup) && (
          <TouchableOpacity onPress={handleContinue}>
            <LinearGradient
              colors={selectedRoleData?.gradient || ['#6E4D9C', '#5A3E82']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.continueButton}
            >
              <Text style={styles.continueButtonText}>Continue →</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: 56,
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  progressSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  step: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActive: {
    backgroundColor: colors.purple,
  },
  stepText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  stepTextInactive: {
    color: 'rgba(255,255,255,0.5)',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  roleCard: {
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  roleIcon: {
    fontSize: 40,
    marginRight: spacing.md,
  },
  roleHeaderText: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  selectedBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  selectedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  roleBody: {
    padding: spacing.lg,
  },
  roleDescription: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  featuresList: {
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureDot: {
    fontSize: 16,
    color: colors.purple,
    marginRight: 8,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  ageGroupRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  ageGroupContainer: {
    flex: 1,
  },
  ageGroupCard: {
    alignItems: 'center',
    position: 'relative',
  },
  ageGroupCardSelected: {
    borderColor: colors.purple,
    borderWidth: 3,
  },
  ageGroupLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  ageGroupDescription: {
    fontSize: 13,
    color: colors.textMuted,
  },
  ageGroupCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageGroupCheckText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  continueButton: {
    borderRadius: radii.xl,
    paddingVertical: 18,
    alignItems: 'center',
    ...shadow.glow,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
