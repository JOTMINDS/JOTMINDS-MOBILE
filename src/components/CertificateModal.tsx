import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Share } from 'react-native';
import CertificateCard, { CertificateCardProps } from './CertificateCard';
import { radii, spacing } from '../theme';
import { useTheme, useThemedStyles } from '../context/ThemeContext';
import { Palette } from '../theme';

interface Props extends CertificateCardProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Shows the certificate as a visual preview, then shares a text summary via
 * React Native's built-in Share API — no new native dependency, works
 * immediately in Expo Go, no rebuild needed. (Was a captured image via
 * react-native-view-shot + expo-sharing; swapped back per the user's call
 * after flagging that path needs a native rebuild to actually test.)
 */
export default function CertificateModal({ visible, onClose, icon, headline, subtitle, name, date }: Props) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [error, setError] = useState(false);

  const handleShare = async () => {
    setError(false);
    try {
      await Share.share({
        message: `${icon} I just earned "${headline}" on JotMinds!\n${subtitle}\n\n— ${name}, ${date}`,
      });
    } catch {
      setError(true);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close">
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <CertificateCard icon={icon} headline={headline} subtitle={subtitle} name={name} date={date} />

          {error && <Text style={styles.errorText}>Couldn't share right now. Try again.</Text>}

          <TouchableOpacity style={styles.shareBtn} onPress={handleShare} accessibilityRole="button" accessibilityLabel="Share certificate">
            <Text style={styles.shareBtnText}>Share →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.bgSecondary, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: spacing.xl, paddingBottom: 40 },
  closeBtn: { alignSelf: 'flex-end', width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  closeText: { fontSize: 16, color: colors.textMuted },
  errorText: { color: colors.error, fontSize: 13, textAlign: 'center', marginTop: spacing.md },
  shareBtn: { backgroundColor: colors.purple, borderRadius: radii.md, paddingVertical: 16, alignItems: 'center', marginTop: spacing.xl },
  shareBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
