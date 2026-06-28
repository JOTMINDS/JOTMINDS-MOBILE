import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import { darkColors, darkRadii, darkShadow } from '../theme-dark';

interface DarkGlassCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: number;
  variant?: 'dark' | 'medium' | 'light';
  glowColor?: 'purple' | 'cyan' | 'none';
}

export default function DarkGlassCard({
  children,
  onPress,
  style,
  padding = 20,
  variant = 'dark',
  glowColor = 'none',
}: DarkGlassCardProps) {
  const backgroundColor =
    variant === 'dark'
      ? darkColors.glassDark
      : variant === 'medium'
        ? darkColors.glassMedium
        : darkColors.glassLight;

  const glowStyle =
    glowColor === 'purple'
      ? darkShadow.glow
      : glowColor === 'cyan'
        ? darkShadow.glowCyan
        : {};

  const cardStyle = [
    styles.card,
    { backgroundColor, padding },
    glowStyle,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: darkRadii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...darkShadow.card,
  },
});
