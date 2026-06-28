import React from 'react';
import { TextStyle, StyleProp } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * AppIcon — renders a clean vector icon in place of an emoji.
 *
 * It accepts the *legacy emoji string* (e.g. "🧠") as `name`, so existing
 * data arrays (`icon: '🧠'`) keep working unchanged — only the render call
 * needs to switch from <Text>{icon}</Text> to <AppIcon name={icon} />.
 * You can also pass a semantic key from SEMANTIC below.
 */

type Lib = 'ion' | 'mci';
type IconDef = { lib: Lib; name: string };

const MAP: Record<string, IconDef> = {
  // navigation
  '🏠': { lib: 'ion', name: 'home' },
  '💡': { lib: 'ion', name: 'bulb' },
  '🧠': { lib: 'mci', name: 'brain' },
  '🎯': { lib: 'mci', name: 'target' },
  '👤': { lib: 'ion', name: 'person' },

  // people / roles
  '👨': { lib: 'ion', name: 'person' },
  '👩': { lib: 'ion', name: 'person' },
  '👧': { lib: 'ion', name: 'person' },
  '👦': { lib: 'ion', name: 'person' },
  '👶': { lib: 'mci', name: 'baby-face-outline' },
  '👥': { lib: 'ion', name: 'people' },
  '🎓': { lib: 'ion', name: 'school' },
  '👨‍🏫': { lib: 'mci', name: 'human-male-board' },
  '💼': { lib: 'ion', name: 'briefcase' },
  '🏫': { lib: 'ion', name: 'business' },
  '🏢': { lib: 'ion', name: 'business' },

  // status / feedback
  '✓': { lib: 'ion', name: 'checkmark' },
  '✅': { lib: 'ion', name: 'checkmark-circle' },
  '✕': { lib: 'ion', name: 'close' },
  '⚠': { lib: 'ion', name: 'warning' },
  '⚠️': { lib: 'ion', name: 'warning' },
  '👍': { lib: 'ion', name: 'thumbs-up' },
  '🔒': { lib: 'ion', name: 'lock-closed' },
  '🎉': { lib: 'mci', name: 'party-popper' },
  '🏆': { lib: 'ion', name: 'trophy' },
  '🔥': { lib: 'ion', name: 'flame' },
  '🌟': { lib: 'ion', name: 'star' },
  '⭐': { lib: 'ion', name: 'star' },
  '✨': { lib: 'ion', name: 'sparkles' },

  // data / charts
  '📊': { lib: 'ion', name: 'bar-chart' },
  '📈': { lib: 'ion', name: 'trending-up' },
  '📉': { lib: 'ion', name: 'trending-down' },
  '➡': { lib: 'ion', name: 'arrow-forward' },
  '➡️': { lib: 'ion', name: 'arrow-forward' },
  '🔄': { lib: 'ion', name: 'sync' },
  '➕': { lib: 'ion', name: 'add' },

  // cognition / role-fit dimensions
  '👁': { lib: 'ion', name: 'eye' },
  '👁️': { lib: 'ion', name: 'eye' },
  '👀': { lib: 'ion', name: 'eye' },
  '⚡': { lib: 'ion', name: 'flash' },
  '🧮': { lib: 'ion', name: 'calculator' },
  '🌫': { lib: 'ion', name: 'cloudy' },
  '🌫️': { lib: 'ion', name: 'cloudy' },
  '❤': { lib: 'ion', name: 'heart' },
  '❤️': { lib: 'ion', name: 'heart' },
  '🗣': { lib: 'ion', name: 'megaphone' },
  '🗣️': { lib: 'ion', name: 'megaphone' },
  '🔍': { lib: 'ion', name: 'search' },
  '🧭': { lib: 'ion', name: 'compass' },
  '🌊': { lib: 'ion', name: 'water' },
  '🪞': { lib: 'ion', name: 'scan' },
  '🧩': { lib: 'ion', name: 'extension-puzzle' },
  '🏋': { lib: 'mci', name: 'weight-lifter' },
  '🏋️': { lib: 'mci', name: 'weight-lifter' },
  '🔗': { lib: 'ion', name: 'link' },
  '📌': { lib: 'ion', name: 'pin' },
  '⚖': { lib: 'mci', name: 'scale-balance' },
  '⚖️': { lib: 'mci', name: 'scale-balance' },
  '🌱': { lib: 'ion', name: 'leaf' },
  '🌍': { lib: 'ion', name: 'earth' },
  '🚀': { lib: 'ion', name: 'rocket' },

  // emotions (Daily Mind Check)
  '😌': { lib: 'mci', name: 'emoticon-happy-outline' },
  '💪': { lib: 'mci', name: 'arm-flex' },
  '😰': { lib: 'mci', name: 'emoticon-confused-outline' },
  '😵': { lib: 'mci', name: 'emoticon-dead-outline' },
  '🌀': { lib: 'mci', name: 'blur' },
  '😐': { lib: 'mci', name: 'emoticon-neutral-outline' },
  '😬': { lib: 'mci', name: 'emoticon-frown-outline' },
  '💭': { lib: 'ion', name: 'chatbubble-ellipses' },

  // content / misc
  '📚': { lib: 'ion', name: 'book' },
  '📖': { lib: 'ion', name: 'book' },
  '📝': { lib: 'ion', name: 'document-text' },
  '✏': { lib: 'ion', name: 'create' },
  '✏️': { lib: 'ion', name: 'create' },
  '✍': { lib: 'ion', name: 'create' },
  '✍️': { lib: 'ion', name: 'create' },
  '💬': { lib: 'ion', name: 'chatbubble-ellipses' },
  '🗨': { lib: 'ion', name: 'chatbubble' },
  '🗨️': { lib: 'ion', name: 'chatbubble' },
  '✉': { lib: 'ion', name: 'mail' },
  '✉️': { lib: 'ion', name: 'mail' },
  '📱': { lib: 'ion', name: 'phone-portrait' },
  '📞': { lib: 'ion', name: 'call' },
  '💻': { lib: 'ion', name: 'laptop' },
  '🎨': { lib: 'ion', name: 'color-palette' },
  '🎮': { lib: 'ion', name: 'game-controller' },
  '📋': { lib: 'ion', name: 'clipboard' },
  '🎂': { lib: 'mci', name: 'cake-variant' },
  '🎫': { lib: 'ion', name: 'ticket' },
  '🍎': { lib: 'mci', name: 'food-apple' },
  '🤸': { lib: 'mci', name: 'run' },
  '✋': { lib: 'ion', name: 'hand-left' },
  '👋': { lib: 'mci', name: 'hand-wave' },
  '⚕': { lib: 'mci', name: 'medical-bag' },
  '⚕️': { lib: 'mci', name: 'medical-bag' },
  '⏳': { lib: 'mci', name: 'timer-sand' },
  '⏱': { lib: 'ion', name: 'timer' },
  '⏱️': { lib: 'ion', name: 'timer' },
};

// Optional semantic aliases (clearer than emoji at call sites if you prefer)
const SEMANTIC: Record<string, IconDef> = {
  home: MAP['🏠'],
  discover: MAP['💡'],
  mind: MAP['🧠'],
  rolefit: MAP['🎯'],
  profile: MAP['👤'],
  eye: { lib: 'ion', name: 'eye' },
  'eye-off': { lib: 'ion', name: 'eye-off' },
  mail: { lib: 'ion', name: 'mail' },
  lock: { lib: 'ion', name: 'lock-closed' },
  'arrow-forward': { lib: 'ion', name: 'arrow-forward' },
  'arrow-back': { lib: 'ion', name: 'arrow-back' },
};

export interface AppIconProps {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
  /** Provide only when the icon conveys meaning on its own (e.g. an icon-only
   *  button). Omit for decorative icons so screen readers skip them. */
  accessibilityLabel?: string;
}

export default function AppIcon({ name, size = 22, color = '#FFFFFF', style, accessibilityLabel }: AppIconProps) {
  const def = MAP[name] ?? SEMANTIC[name] ?? { lib: 'ion' as Lib, name: 'ellipse' };
  const a11y = accessibilityLabel
    ? { accessible: true, accessibilityRole: 'image' as const, accessibilityLabel }
    : { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' as const };
  const Comp = def.lib === 'mci' ? MaterialCommunityIcons : Ionicons;
  return <Comp name={def.name as any} size={size} color={color} style={style} {...a11y} />;
}
