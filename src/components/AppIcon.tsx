import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { resolveIcon } from './appIconMap';

/**
 * AppIcon — renders a clean vector icon in place of an emoji.
 *
 * It accepts the *legacy emoji string* (e.g. "🧠") as `name`, so existing
 * data arrays (`icon: '🧠'`) keep working unchanged — only the render call
 * needs to switch from <Text>{icon}</Text> to <AppIcon name={icon} />.
 * You can also pass a semantic key from SEMANTIC below.
 */

export interface AppIconProps {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
  /** Provide only when the icon conveys meaning on its own (e.g. an icon-only
   *  button). Omit for decorative icons so screen readers skip them. */
  accessibilityLabel?: string;
}

const isIonGlyph = (n: string) => Object.prototype.hasOwnProperty.call(Ionicons.glyphMap, n);

export default function AppIcon({ name, size = 22, color = '#FFFFFF', style, accessibilityLabel }: AppIconProps) {
  const a11y = accessibilityLabel
    ? { accessible: true, accessibilityRole: 'image' as const, accessibilityLabel }
    : { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' as const };
  const icon = resolveIcon(name, isIonGlyph);
  if (icon.kind === 'text') {
    // No vector for this symbol: draw the character itself instead of a "?".
    return <Text style={[{ fontSize: size, color }, style]} {...a11y}>{icon.text}</Text>;
  }
  const Comp = icon.lib === 'mci' ? MaterialCommunityIcons : Ionicons;
  return <Comp name={icon.name as any} size={size} color={color} style={style} {...a11y} />;
}
