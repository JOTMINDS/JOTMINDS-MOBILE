import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface RoleSelectionScreenProps {
  navigation: any;
  onRoleSelected?: (role: string) => void;
}

export default function RoleSelectionScreen({ navigation, onRoleSelected }: RoleSelectionScreenProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roles = [
    {
      id: 'student',
      title: 'Student',
      description: 'Optimize study habits and track learning progress.',
      icon: '🎓',
      gradient: ['#3B82F6', '#2563EB'],
    },
    {
      id: 'parent',
      title: 'Parent',
      description: "Understand and support your child's cognitive growth.",
      icon: '👨‍👩‍👧',
      gradient: ['#EC4899', '#DB2777'],
    },
    {
      id: 'teacher',
      title: 'Teacher',
      description: 'Tailor instruction based on classroom cognitive insights.',
      icon: '👨‍🏫',
      gradient: ['#10B981', '#059669'],
    },
    {
      id: 'professional',
      title: 'Professional',
      description: 'Enhance productivity and manage cognitive load at work.',
      icon: '💼',
      gradient: ['#F59E0B', '#D97706'],
    },
  ];

  const handleContinue = () => {
    if (selectedRole && onRoleSelected) {
      onRoleSelected(selectedRole);
    }
  };

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
  };

  return (
    <LinearGradient
      colors={['#E8D5FF', '#F0E6FF', '#F5EDFF', '#FBF5FF']}
      style={styles.gradient}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with Progress */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.progressContainer}>
            <View style={styles.progressDot} />
            <View style={styles.progressDotInactive} />
            <View style={styles.progressDotInactive} />
          </View>

          <View style={styles.placeholder} />
        </View>

        {/* Logo and Title */}
        <View style={styles.logoSection}>
          <LinearGradient
            colors={['#6E4D9C', '#B79BDC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoBadge}
          >
            <Text style={styles.logoText}>JM</Text>
          </LinearGradient>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>Discover How You Think</Text>
          <Text style={styles.subtitle}>
            Select your role to personalize your cognitive insights experience.
          </Text>
        </View>

        {/* Role Cards */}
        <View style={styles.roleContainer}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              style={[
                styles.roleCard,
                selectedRole === role.id && styles.roleCardSelected,
              ]}
              onPress={() => handleRoleSelect(role.id)}
              activeOpacity={0.7}
            >
              <View style={styles.roleContent}>
                <View style={styles.roleIconContainer}>
                  <Text style={styles.roleIcon}>{role.icon}</Text>
                </View>

                <View style={styles.roleTextContainer}>
                  <Text style={styles.roleTitle}>{role.title}</Text>
                  <Text style={styles.roleDescription}>{role.description}</Text>
                </View>

                <View style={styles.checkboxContainer}>
                  {selectedRole === role.id ? (
                    <LinearGradient
                      colors={role.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.checkboxSelected}
                    >
                      <Text style={styles.checkmark}>✓</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.checkbox} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueButton, !selectedRole && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!selectedRole}
        >
          <LinearGradient
            colors={selectedRole ? ['#6E4D9C', '#5A3E82'] : ['#9CA3AF', '#6B7280']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.continueButtonGradient}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Text style={styles.continueButtonIcon}>→</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 44,
    paddingBottom: 34,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  backIcon: {
    fontSize: 20,
    color: '#14136E',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#14136E',
  },
  progressDotInactive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D3E4FE',
  },
  placeholder: {
    width: 44,
    height: 44,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoBadge: {
    width: 96,
    height: 96,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6E4D9C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#14136E',
    marginBottom: 8,
    letterSpacing: -0.7,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#464651',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 30,
  },
  roleContainer: {
    gap: 16,
    marginBottom: 32,
  },
  roleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7C5D3',
    shadowColor: '#14136E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  roleCardSelected: {
    borderColor: '#3D52C9',
    borderWidth: 2,
    backgroundColor: '#E0F7FA',
    shadowColor: '#3D52C9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 6,
  },
  roleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 21,
  },
  roleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  roleIcon: {
    fontSize: 24,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B1C30',
    marginBottom: 4,
    letterSpacing: 0.14,
  },
  roleDescription: {
    fontSize: 13,
    fontWeight: '400',
    color: '#464651',
    lineHeight: 16.25,
  },
  checkboxContainer: {
    marginLeft: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#C7C5D3',
    backgroundColor: colors.glassMedium,
  },
  checkboxSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6E4D9C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  continueButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0.1,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  continueButtonIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
