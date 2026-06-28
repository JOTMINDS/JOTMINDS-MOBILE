import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ViewStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii, shadow } from '../theme';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'purple' | 'cyan' | 'coral' | 'success';
  gradient?: [string, string];
  style?: ViewStyle;
  icon?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function GradientButton({
  label,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  gradient,
  style,
  icon = '→',
  size = 'large',
}: Props) {
  const buttonHeight = size === 'small' ? 40 : size === 'medium' ? 48 : 56;

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        disabled={disabled || loading}
        onPress={onPress}
        style={[styles.outline, { height: buttonHeight }, disabled && styles.disabled, style]}
      >
        <Text style={styles.outlineText}>{label} {icon}</Text>
      </TouchableOpacity>
    );
  }

  const colorsArr: [string, string] = gradient
    ? gradient
    : variant === 'secondary' || variant === 'cyan'
    ? colors.gradientCyan
    : variant === 'coral'
    ? colors.gradientCoral
    : variant === 'success'
    ? colors.gradientSuccess
    : colors.gradientPurple; // primary / purple

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled || loading}
      onPress={onPress}
      style={[styles.wrapper, { height: buttonHeight }, disabled && styles.disabled, style]}
    >
      <LinearGradient
        colors={disabled ? ['#475569', '#334155'] : colorsArr}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { height: buttonHeight }]}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Text style={styles.label}>{label}</Text>
            {icon ? <Text style={styles.icon}>{icon}</Text> : null}
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radii.md,
    overflow: 'hidden',
    ...shadow.glow,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  icon: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  outline: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.glassMedium,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.15,
  },
  disabled: {
    opacity: 0.5,
  },
});
