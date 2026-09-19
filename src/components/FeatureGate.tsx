import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ScreenBackground from './ScreenBackground';
import { useAuth } from '../context/AuthContext';
import { useFeatureFlag, FeatureKey } from '../utils/featureFlags';
import { rs } from '../utils/responsive';
import { spacing, Palette } from '../theme';
import { useThemedStyles } from '../context/ThemeContext';

function DisabledNotice({ name, navigation }: { name: string; navigation?: any }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <ScreenBackground>
      <View style={styles.wrap}>
        <Text style={styles.title}>{name} is unavailable</Text>
        <Text style={styles.text}>
          This feature has been switched off for your account right now. Please check back later.
        </Text>
        {navigation?.canGoBack?.() && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btn} accessibilityRole="button">
            <Text style={styles.btnText}>Go back</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScreenBackground>
  );
}

/** Wrap a screen so it renders a notice instead when its feature flag is off. */
export function withFeature<P extends object>(
  key: FeatureKey,
  name: string,
  Screen: React.ComponentType<P>,
): React.ComponentType<P> {
  const Gated = (props: P) => {
    const { user } = useAuth();
    const enabled = useFeatureFlag(key, user?.id);
    if (!enabled) return <DisabledNotice name={name} navigation={(props as any).navigation} />;
    return <Screen {...props} />;
  };
  Gated.displayName = `withFeature(${key})`;
  return Gated;
}

/** Hide entry-point cards when their feature is off. */
export function FeatureVisible({ flag, children }: { flag: FeatureKey; children: React.ReactNode }) {
  const { user } = useAuth();
  const enabled = useFeatureFlag(flag, user?.id);
  return enabled ? <>{children}</> : null;
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  title: { fontSize: rs(18), fontWeight: '800', color: colors.text, marginBottom: 8, textAlign: 'center' },
  text: { fontSize: rs(13), color: colors.textSecondary, textAlign: 'center', lineHeight: rs(19) },
  btn: { marginTop: spacing.lg },
  btnText: { color: colors.success, fontWeight: '700' },
});
