import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import AppIcon from './AppIcon';
import { useAuth } from '../context/AuthContext';
import { useAppNavigation } from '../navigation/types';
import { loadActiveNudges } from '../utils/nudgeLoader';
import { Palette } from '../theme';
import { useTheme, useThemedStyles } from '../context/ThemeContext';

/** Header bell for the home screens: opens Notifications, with a count of open nudges. */
export default function NotificationBell({ style }: { style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const navigation = useAppNavigation();
  const [count, setCount] = useState(0);

  const load = useCallback(() => {
    if (!user?.id) return;
    loadActiveNudges(user.id).then((list) => setCount(list.length)).catch(() => {});
  }, [user?.id]);

  useEffect(() => {
    load();
    // Dismissing nudges on the Notifications screen should clear the badge on return.
    const unsub = navigation?.addListener?.('focus', load);
    return unsub;
  }, [load, navigation]);

  return (
    <TouchableOpacity
      style={[styles.btn, style]}
      onPress={() => navigation.navigate('Notifications')}
      accessibilityRole="button"
      accessibilityLabel={count > 0 ? `Notifications, ${count} new` : 'Notifications'}
    >
      <AppIcon name={count > 0 ? 'notifications' : 'notifications-outline'} size={22} color={t.textPrimary} />
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const makeStyles = (c: Palette) => StyleSheet.create({
  btn: {
    width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
    backgroundColor: c.glassMedium, borderWidth: 1, borderColor: c.borderLight,
  },
  badge: {
    position: 'absolute', top: 2, right: 2, minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4,
    alignItems: 'center', justifyContent: 'center', backgroundColor: c.error, borderWidth: 2, borderColor: c.bgPrimary,
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
});
