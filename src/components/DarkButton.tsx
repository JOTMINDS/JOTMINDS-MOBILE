import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { darkColors, darkRadii, darkShadow, darkTypography } from '../theme-dark';

interface DarkButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'purple' | 'cyan' | 'coral' | 'success' | 'outline';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function DarkButton({
  label,
  onPress,
  variant = 'purple',
  size = 'large',
  icon,
  disabled = false,
  style,
}: DarkButtonProps) {
  const gradientColors =
    variant === 'purple'
      ? darkColors.gradientPurple
      : variant === 'cyan'
        ? darkColors.gradientCyan
        : variant === 'coral'
          ? darkColors.gradientCoral
          : darkColors.gradientSuccess;

  const buttonHeight =
    size === 'small' ? 40 : size === 'medium' ? 48 : 56;

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        style={[
          styles.button,
          styles.outlineButton,
          { height: buttonHeight },
          disabled && styles.disabled,
          style,
        ]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, styles.outlineText]}>
          {label} {icon}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[{ height: buttonHeight }, disabled && styles.disabled, style]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.button, { height: buttonHeight }]}
      >
        <Text style={styles.buttonText}>
          {label} {icon}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: darkRadii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    ...darkShadow.glow,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: darkColors.borderLight,
  },
  buttonText: {
    color: darkColors.textPrimary,
    fontSize: darkTypography.fontSize.md,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  outlineText: {
    color: darkColors.textSecondary,
  },
  disabled: {
    opacity: 0.5,
  },
});
