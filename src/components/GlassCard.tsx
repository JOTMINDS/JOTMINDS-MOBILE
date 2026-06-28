import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors, radii, shadow } from '../theme';
import { useTheme } from '../context/ThemeContext';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
  selected?: boolean;
  padding?: number;
  variant?: 'dark' | 'medium' | 'light';
  glowColor?: 'purple' | 'cyan' | 'none';
}

export default function GlassCard({
  children,
  style,
  onPress,
  selected,
  padding = 20,
  variant = 'dark',
  glowColor = 'none',
}: Props) {
  const t = useTheme();
  // Palette already turns these opaque + brightens borders in High Contrast.
  const backgroundColor =
    variant === 'dark' ? t.glassDark : variant === 'medium' ? t.glassMedium : t.glassLight;

  const glowStyle =
    glowColor === 'purple'
      ? shadow.glow
      : glowColor === 'cyan'
        ? shadow.glowCyan
        : {};

  const cardStyle = [
    styles.card,
    { backgroundColor, borderColor: t.borderSoft, padding },
    selected && styles.selected,
    glowStyle,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={cardStyle}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...shadow.card,
  },
  selected: {
    borderColor: colors.cyan,
    borderWidth: 2,
    ...shadow.raised,
  },
  highContrastBorder: {
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1.5,
  },
});
