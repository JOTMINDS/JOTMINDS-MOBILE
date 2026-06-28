import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, Linking, Platform,
} from 'react-native';
import { useAccessibility } from '../../context/AccessibilityContext';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import { colors, radii, spacing } from '../../theme';

interface ToggleRowProps {
  icon: string;
  iconColor: string;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}

function ToggleRow({ icon, iconColor, title, description, value, onValueChange }: ToggleRowProps) {
  return (
    <GlassCard style={styles.row}>
      <View style={styles.rowInner}>
        <View style={[styles.iconWrap, { backgroundColor: `${iconColor}22` }]}>
          <AppIcon name={icon} size={22} color={iconColor} />
        </View>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>{title}</Text>
          <Text style={styles.rowDesc}>{description}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.bgTertiary, true: colors.purple }}
          thumbColor="#FFFFFF"
          ios_backgroundColor={colors.bgTertiary}
        />
      </View>
    </GlassCard>
  );
}

export default function AccessibilityScreen({ navigation }: any) {
  const { highContrast, reduceMotion, setHighContrast, setReduceMotion } = useAccessibility();

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.back}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <AppIcon name="arrow-back" size={22} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Accessibility</Text>
          <Text style={styles.subtitle}>Make JotMinds easier to see and use</Text>
        </View>

        <Text style={styles.sectionLabel}>DISPLAY</Text>
        <ToggleRow
          icon="👁️"
          iconColor={colors.cyan}
          title="High Contrast"
          description="Pure-black background with solid cards and brighter borders for stronger contrast."
          value={highContrast}
          onValueChange={setHighContrast}
        />
        <ToggleRow
          icon="⚡"
          iconColor={colors.warning}
          title="Reduce Motion"
          description="Turn off animations and transitions that can cause discomfort."
          value={reduceMotion}
          onValueChange={setReduceMotion}
        />

        <Text style={styles.sectionLabel}>TEXT SIZE</Text>
        <GlassCard style={styles.row}>
          <View style={styles.rowInner}>
            <View style={[styles.iconWrap, { backgroundColor: `${colors.purple}22` }]}>
              <AppIcon name="📖" size={22} color={colors.purpleSoft} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Larger Text</Text>
              <Text style={styles.rowDesc}>
                JotMinds follows your device's text-size and bold-text settings. Increase them in your
                {Platform.OS === 'ios' ? ' iOS Settings → Accessibility → Display & Text Size.' : ' Android Settings → Accessibility → Font size.'}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.linkBtn} onPress={() => Linking.openSettings()}>
            <Text style={styles.linkBtnText}>Open Device Settings</Text>
            <AppIcon name="arrow-forward" size={16} color={colors.cyan} />
          </TouchableOpacity>
        </GlassCard>

        <View style={styles.note}>
          <AppIcon name="💡" size={16} color={colors.textSubtle} />
          <Text style={styles.noteText}>
            These settings are saved on this device. If you use VoiceOver or TalkBack, JotMinds works with them too.
          </Text>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 56, paddingHorizontal: spacing.xl, paddingBottom: 120 },
  back: { width: 44, height: 44, justifyContent: 'center', marginBottom: 4 },
  header: { marginBottom: 24 },
  title: { fontSize: 30, fontWeight: '800', color: colors.textPrimary, letterSpacing: -1 },
  subtitle: { fontSize: 15, color: colors.textMuted, marginTop: 4 },
  sectionLabel: {
    fontSize: 12, fontWeight: '700', color: colors.textSubtle,
    letterSpacing: 1.4, marginBottom: 12, marginTop: 8,
  },
  row: { marginBottom: 12 },
  rowInner: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconWrap: { width: 44, height: 44, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 3 },
  rowDesc: { fontSize: 13, color: colors.textMuted, lineHeight: 19 },
  linkBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.borderLight, width: '100%',
  },
  linkBtnText: { fontSize: 14, fontWeight: '700', color: colors.cyan },
  note: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginTop: 16, paddingHorizontal: 4 },
  noteText: { flex: 1, fontSize: 12, color: colors.textSubtle, lineHeight: 18 },
});
