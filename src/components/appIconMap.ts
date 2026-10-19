/**
 * Lookup tables behind <AppIcon>. Kept free of React / icon-font imports so they
 * can be unit-tested against the real glyph maps (see __tests__/appIconMap.test.ts).
 */

export type Lib = 'ion' | 'mci';
export type IconDef = { lib: Lib; name: string };

export const MAP: Record<string, IconDef> = {
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

  // symbols used across screens/data that used to fall through to a literal "?"
  '→': { lib: 'ion', name: 'arrow-forward' },
  '←': { lib: 'ion', name: 'arrow-back' },
  '↗': { lib: 'ion', name: 'share-outline' },
  '+': { lib: 'ion', name: 'add' },
  '○': { lib: 'ion', name: 'ellipse-outline' },
  '✦': { lib: 'ion', name: 'sparkles' },
  '🔺': { lib: 'ion', name: 'caret-up' },
  '📷': { lib: 'ion', name: 'camera' },
  '🎟': { lib: 'ion', name: 'ticket' },
  '🎟️': { lib: 'ion', name: 'ticket' },
  '🔐': { lib: 'ion', name: 'lock-closed' },
  '🗑': { lib: 'ion', name: 'trash' },
  '🗑️': { lib: 'ion', name: 'trash' },
  '🛡': { lib: 'ion', name: 'shield-checkmark' },
  '🛡️': { lib: 'ion', name: 'shield-checkmark' },
  '👨\u200d⚕️': { lib: 'mci', name: 'doctor' },
  '🙂': { lib: 'mci', name: 'face-recognition' },
  '👆': { lib: 'ion', name: 'finger-print' },
  '📓': { lib: 'ion', name: 'journal' },
  '📄': { lib: 'ion', name: 'document' },
  '🗂': { lib: 'ion', name: 'albums' },
  '🗂️': { lib: 'ion', name: 'albums' },
  '🔁': { lib: 'ion', name: 'repeat' },
  '🔬': { lib: 'mci', name: 'microscope' },
  '🔭': { lib: 'mci', name: 'telescope' },
  '📐': { lib: 'mci', name: 'ruler-square' },
  '🏗': { lib: 'mci', name: 'crane' },
  '🏗️': { lib: 'mci', name: 'crane' },
  '🧸': { lib: 'mci', name: 'teddy-bear' },
  '🤝': { lib: 'mci', name: 'handshake' },

  // badges / gamification
  '👑': { lib: 'mci', name: 'crown' },
  '🌙': { lib: 'ion', name: 'moon' },
  '☀': { lib: 'ion', name: 'sunny' },
  '☀️': { lib: 'ion', name: 'sunny' },
  '🌅': { lib: 'mci', name: 'weather-sunset-up' },
  '🗺': { lib: 'ion', name: 'map' },
  '🗺️': { lib: 'ion', name: 'map' },
  '🏛': { lib: 'mci', name: 'bank' },
  '🏛️': { lib: 'mci', name: 'bank' },
  '💎': { lib: 'ion', name: 'diamond' },
  '🏊': { lib: 'mci', name: 'swim' },
  '🥇': { lib: 'mci', name: 'medal' },
  '🏅': { lib: 'ion', name: 'medal' },
  '🎖': { lib: 'mci', name: 'medal-outline' },
  '🎖️': { lib: 'mci', name: 'medal-outline' },
  '💥': { lib: 'mci', name: 'flash-alert' },
  '🎗': { lib: 'mci', name: 'ribbon' },
  '🎗️': { lib: 'mci', name: 'ribbon' },
};

// Optional semantic aliases (clearer than emoji at call sites if you prefer)
export const SEMANTIC: Record<string, IconDef> = {
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

export type ResolvedIcon = ({ kind: 'icon' } & IconDef) | { kind: 'text'; text: string };

const has = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o, k);

/**
 * Decide how to draw `name`: a mapped emoji/semantic key → its vector icon; a raw
 * Ionicons glyph name ("eye", "arrow-back") → that glyph; anything else (an emoji or
 * symbol we have no vector for) → the character itself as text. It must never be
 * handed to the icon font as a glyph name: react-native-vector-icons draws a
 * literal "?" for unknown names, which is the bug this guards against.
 */
export function resolveIcon(name: string, isIonGlyph: (n: string) => boolean): ResolvedIcon {
  if (has(MAP, name)) return { kind: 'icon', ...MAP[name] };
  if (has(SEMANTIC, name)) return { kind: 'icon', ...SEMANTIC[name] };
  // empty/undefined stays an (invisible) Ionicons so layout is unchanged
  if (!name || isIonGlyph(name)) return { kind: 'icon', lib: 'ion', name };
  return { kind: 'text', text: name };
}
