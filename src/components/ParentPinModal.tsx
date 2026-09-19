import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { rs } from '../utils/responsive';
import { radii, spacing, Palette } from '../theme';
import { useThemedStyles, useTheme } from '../context/ThemeContext';
import { PinAttempts, isValidPin, isWeakPin } from '../utils/kidsMode';

interface Props {
  visible: boolean;
  mode: 'verify' | 'setup';
  title: string;
  description?: string;
  /** stored PIN (verify mode) */
  pin?: string;
  onSuccess: (pin: string) => void;
  onCancel: () => void;
}

/** Four-digit parent PIN entry: verify against the stored PIN, or set a new one (enter + confirm). */
export default function ParentPinModal({ visible, mode, title, description, pin, onSuccess, onCancel }: Props) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [value, setValue] = useState('');
  const [first, setFirst] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const attempts = useRef(new PinAttempts()).current;

  useEffect(() => { if (visible) { setValue(''); setFirst(null); setError(null); } }, [visible]);

  const submit = (v: string) => {
    if (!isValidPin(v)) return;
    if (mode === 'verify') {
      const locked = attempts.lockedForMs;
      if (locked > 0) { setError(`Too many tries. Wait ${Math.ceil(locked / 1000)}s.`); setValue(''); return; }
      if (attempts.attempt(v, pin)) { onSuccess(v); return; }
      setError(attempts.lockedForMs > 0 ? 'Too many tries. Locked for a minute.' : 'Incorrect PIN');
      setValue('');
      return;
    }
    if (first === null) {
      if (isWeakPin(v)) { setError('Choose a PIN that’s harder to guess (not 1234 or repeated digits).'); setValue(''); return; }
      setFirst(v); setValue(''); setError(null);
      return;
    }
    if (v !== first) { setError('PINs didn’t match. Start again.'); setFirst(null); setValue(''); return; }
    onSuccess(v);
  };

  const onChange = (t: string) => {
    const digits = t.replace(/\D/g, '').slice(0, 4);
    setValue(digits);
    setError(null);
    if (digits.length === 4) submit(digits);
  };

  const heading = mode === 'setup' && first !== null ? 'Confirm PIN' : title;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.sheet} accessibilityViewIsModal>
          <Text style={styles.title}>{heading}</Text>
          {!!description && <Text style={styles.desc}>{description}</Text>}
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChange}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
            autoFocus
            placeholder="••••"
            placeholderTextColor={colors.textSubtle}
            accessibilityLabel="Parent PIN"
          />
          {!!error && <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text>}
          <TouchableOpacity onPress={onCancel} accessibilityRole="button" style={styles.cancel}>
            <Text style={styles.cancelText}>{mode === 'setup' ? 'Set up later' : 'Cancel'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  sheet: { width: '100%', maxWidth: 360, backgroundColor: colors.bgSecondary, borderRadius: radii.xl, padding: spacing.xl },
  title: { fontSize: rs(18), fontWeight: '800', color: colors.text, textAlign: 'center' },
  desc: { fontSize: rs(13), color: colors.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: rs(19) },
  input: {
    marginTop: 18, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.borderSoft, backgroundColor: colors.glassLight,
    color: colors.text, fontSize: rs(28), letterSpacing: 12, textAlign: 'center', paddingVertical: 12,
  },
  error: { color: colors.error, fontSize: rs(12), textAlign: 'center', marginTop: 10 },
  cancel: { alignItems: 'center', paddingTop: 16 },
  cancelText: { color: colors.purpleSoft, fontWeight: '700', fontSize: rs(13) },
});
