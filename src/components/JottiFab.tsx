import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from './AppIcon';
import { shadow } from '../theme';

const SIZE = 54;
const TAB_BAR = 84; // keep in step with the tab bar height in AppNavigator

/** Floating "Ask Jotti" button, as on the webapp. Visibility is decided by shouldShowJottiFab. */
export default function JottiFab({ onPress, aboveTabBar }: { onPress: () => void; aboveTabBar: boolean }) {
  const insets = useSafeAreaInsets();
  const bottom = aboveTabBar ? TAB_BAR + 12 : insets.bottom + 20;
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom }]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Ask Jotti">
        <LinearGradient colors={['#7B61FF', '#3D52C9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fab}>
          <AppIcon name="sparkles" size={24} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', right: 16, zIndex: 50 },
  fab: { width: SIZE, height: SIZE, borderRadius: SIZE / 2, alignItems: 'center', justifyContent: 'center', ...shadow.glow },
});
