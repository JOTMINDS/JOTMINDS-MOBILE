import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import * as Speech from 'expo-speech';
import { radii, spacing } from '../../theme';

/** A speaker button that reads `text` aloud, slowly, and stops when tapped again or the screen closes. */
export default function ListenButton({ text, style }: { text: string; style?: StyleProp<ViewStyle> }) {
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => () => { Speech.stop(); }, []);
  // A new question means the old reading is stale.
  useEffect(() => { Speech.stop(); setSpeaking(false); }, [text]);

  const toggle = () => {
    if (speaking) { Speech.stop(); setSpeaking(false); return; }
    setSpeaking(true);
    Speech.speak(text, {
      rate: 0.85,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  return (
    <TouchableOpacity
      style={[styles.btn, speaking && styles.btnOn, style]}
      onPress={toggle}
      accessibilityRole="button"
      accessibilityLabel={speaking ? 'Stop reading' : 'Read it to me'}
    >
      <Text style={styles.text}>{speaking ? '⏹ Stop' : '🔊 Read it to me'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignSelf: 'center', minHeight: 48, paddingHorizontal: spacing.xl, borderRadius: radii.xl,
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.14)',
  },
  btnOn: { backgroundColor: 'rgba(255,255,255,0.28)' },
  text: { fontSize: 17, fontWeight: '800', color: '#FFFFFF' },
});
