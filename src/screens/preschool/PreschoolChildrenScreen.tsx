import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import { resolveChildBand } from '../../utils/preschoolEngine';
import { DEVELOPMENTAL_BANDS } from '../../types/preschoolDevelopmental';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';
import type { ScreenProps } from '../../navigation/types';
import { makeStyles, usePreschoolData } from './shared';

/** Hub for the Early Years flow: the teacher's Pre-school children, with quick routes to assess and browse activities. */
export default function PreschoolChildrenScreen({ navigation }: ScreenProps<'PreschoolChildren'>) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { loading, error, children, events, reload } = usePreschoolData();

  const stats = useMemo(() => {
    const m = new Map<string, { count: number; last: string | null }>();
    events.forEach((e) => {
      const cur = m.get(e.childId) ?? { count: 0, last: null };
      cur.count += 1;
      if (!cur.last || e.date > cur.last) cur.last = e.date;
      m.set(e.childId, cur);
    });
    return m;
  }, [events]);

  if (loading) return <ScreenBackground><View style={styles.centered}><ActivityIndicator color={colors.purple} /></View></ScreenBackground>;

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>Early Years</Text>
        <Text style={styles.meta}>
          Record what you see children do, then watch their development build up across 8 domains. Ages 2–6.
        </Text>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('PreschoolActivities')} accessibilityRole="button">
          <Text style={styles.secondaryBtnText}>🎨 Browse developmental activities</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('PreschoolClassInsights')} accessibilityRole="button">
          <Text style={styles.secondaryBtnText}>📊 Class insights</Text>
        </TouchableOpacity>

        {error ? (
          <GlassCard padding={20} style={styles.card}>
            <Text style={styles.text}>{error}</Text>
            <TouchableOpacity style={styles.secondaryBtn} onPress={reload}><Text style={styles.secondaryBtnText}>Try again</Text></TouchableOpacity>
          </GlassCard>
        ) : children.length === 0 ? (
          <GlassCard padding={20} style={styles.card}>
            <Text style={styles.cardTitle}>No Pre-school children yet</Text>
            <Text style={styles.text}>
              Children appear here once they are in one of your classes with the level “Pre-school” (or a Nursery / KG class name, or an age of 6½ or under).
            </Text>
          </GlassCard>
        ) : (
          <>
            <Text style={styles.label}>YOUR CHILDREN ({children.length})</Text>
            {children.map((c) => {
              const band = DEVELOPMENTAL_BANDS[resolveChildBand(c)];
              const st = stats.get(c.id);
              return (
                <GlassCard key={c.id} padding={16} style={styles.card} onPress={() => navigation.navigate('PreschoolChildProgress', { child: c })}>
                  <View style={styles.spread}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{c.name}</Text>
                      <Text style={styles.muted}>
                        {[c.className, typeof c.age === 'number' && `${c.age} yrs`].filter(Boolean).join(' · ') || 'Class not set'}
                      </Text>
                    </View>
                    <View style={[styles.pill, { backgroundColor: `${band.color}33` }]}>
                      <Text style={[styles.pillText, { color: band.color }]}>{band.band} · {band.ageRange}</Text>
                    </View>
                  </View>
                  <Text style={[styles.text, { marginTop: 8 }]}>
                    {st ? `${st.count} observation${st.count === 1 ? '' : 's'} · last ${st.last}` : 'No observations yet'}
                  </Text>
                  <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('PreschoolAssess', { child: c })} accessibilityRole="button">
                    <Text style={styles.secondaryBtnText}>＋ Record an observation</Text>
                  </TouchableOpacity>
                </GlassCard>
              );
            })}
          </>
        )}

        <Text style={styles.notice}>Observations are saved on this device only for now. They are not yet shared with the web app or other devices.</Text>
      </ScrollView>
    </ScreenBackground>
  );
}
