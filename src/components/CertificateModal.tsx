import React, { useRef, useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import CertificateCard, { CertificateCardProps } from './CertificateCard';
import { radii, spacing } from '../theme';
import { useTheme, useThemedStyles } from '../context/ThemeContext';
import { Palette } from '../theme';

interface Props extends CertificateCardProps {
  visible: boolean;
  onClose: () => void;
  /** Extra lines for the text fallback — e.g. top strengths or domain scores. */
  highlights?: string[];
}

/**
 * Shows the certificate, then shares it as a rendered PNG (react-native-view-shot
 * + expo-sharing). Falls back to a branded text summary via the RN Share API if
 * the capture or the share sheet is unavailable.
 */
export default function CertificateModal({ visible, onClose, icon, headline, subtitle, name, date, highlights }: Props) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const cardRef = useRef<View>(null);

  const shareText = async () => {
    const lines = [
      `${icon}  MY JOTMINDS COGNITIVE RESULT`,
      '━━━━━━━━━━━━━━━━━━━━━━',
      headline,
      subtitle,
      ...(highlights && highlights.length ? ['', ...highlights.map((h) => `• ${h}`)] : []),
      '',
      `${name} · ${date}`,
      'Discover how you think → jotminds.com',
    ];
    await Share.share({ message: lines.join('\n') });
  };

  const handleShare = async () => {
    setError(false);
    setBusy(true);
    try {
      const uri = await captureRef(cardRef, { format: 'png', quality: 1, result: 'tmpfile' });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share your JotMinds result' });
      } else {
        await shareText();
      }
    } catch {
      try {
        await shareText();
      } catch {
        setError(true);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close">
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <View ref={cardRef} collapsable={false} style={styles.captureWrap}>
            <CertificateCard icon={icon} headline={headline} subtitle={subtitle} name={name} date={date} />
          </View>

          {error && <Text style={styles.errorText}>Couldn't share right now. Try again.</Text>}

          <TouchableOpacity
            style={[styles.shareBtn, busy && { opacity: 0.6 }]}
            onPress={handleShare}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Share certificate"
          >
            <Text style={styles.shareBtnText}>{busy ? 'Preparing…' : 'Share →'}</Text>
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
  captureWrap: { backgroundColor: colors.bgSecondary },
  errorText: { color: colors.error, fontSize: 13, textAlign: 'center', marginTop: spacing.md },
  shareBtn: { backgroundColor: colors.purple, borderRadius: radii.md, paddingVertical: 16, alignItems: 'center', marginTop: spacing.xl },
  shareBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
