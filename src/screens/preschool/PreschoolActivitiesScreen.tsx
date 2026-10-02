import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import { MASTER_PRESCHOOL_ACTIVITIES } from '../../data/preschoolActivities';
import { INDICATORS_BY_ID } from '../../data/preschoolIndicators';
import { DEVELOPMENTAL_BANDS, DevelopmentalBand } from '../../types/preschoolDevelopmental';
import { useThemedStyles } from '../../context/ThemeContext';
import type { ScreenProps } from '../../navigation/types';
import { makeStyles } from './shared';

const BANDS = Object.keys(DEVELOPMENTAL_BANDS) as DevelopmentalBand[];
const CATEGORIES = Array.from(new Set(MASTER_PRESCHOOL_ACTIVITIES.map((a) => a.category)));

/** Browse cross-domain activities by age band and category; each maps to indicators you can record straight away. */
export default function PreschoolActivitiesScreen({ navigation }: ScreenProps<'PreschoolActivities'>) {
  const styles = useThemedStyles(makeStyles);
  const [band, setBand] = useState<DevelopmentalBand | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const list = MASTER_PRESCHOOL_ACTIVITIES.filter(
    (a) => (!band || a.ageBands.includes(band)) && (!category || a.category === category),
  );

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>Activities</Text>
        <Text style={styles.meta}>Each activity lets you observe several developmental domains at once.</Text>

        <Text style={styles.label}>AGE BAND</Text>
        <View style={styles.chipWrap}>
          <TouchableOpacity style={[styles.chip, !band && styles.chipOn]} onPress={() => setBand(null)}><Text style={[styles.chipText, !band && styles.chipTextOn]}>All</Text></TouchableOpacity>
          {BANDS.map((b) => (
            <TouchableOpacity key={b} style={[styles.chip, band === b && styles.chipOn]} onPress={() => setBand(band === b ? null : b)}>
              <Text style={[styles.chipText, band === b && styles.chipTextOn]}>{b} · {DEVELOPMENTAL_BANDS[b].ageRange}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>CATEGORY</Text>
        <View style={styles.chipWrap}>
          <TouchableOpacity style={[styles.chip, !category && styles.chipOn]} onPress={() => setCategory(null)}><Text style={[styles.chipText, !category && styles.chipTextOn]}>All</Text></TouchableOpacity>
          {CATEGORIES.map((c) => (
            <TouchableOpacity key={c} style={[styles.chip, category === c && styles.chipOn]} onPress={() => setCategory(category === c ? null : c)}>
              <Text style={[styles.chipText, category === c && styles.chipTextOn]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{list.length} ACTIVIT{list.length === 1 ? 'Y' : 'IES'}</Text>
        {list.map((a) => {
          const expanded = open === a.id;
          return (
            <GlassCard key={a.id} padding={14} style={styles.card} onPress={() => setOpen(expanded ? null : a.id)}>
              <View style={styles.spread}>
                <Text style={[styles.cardTitle, { flex: 1 }]}>{a.title}</Text>
                <Text style={styles.muted}>{a.durationMinutes} min</Text>
              </View>
              <Text style={styles.muted}>{a.category} · {a.ageBands.join(', ')}</Text>
              <Text style={[styles.text, { marginTop: 6 }]}>{a.description}</Text>

              {expanded && (
                <View>
                  {a.materialsNeeded.length > 0 && (<><Text style={styles.label}>MATERIALS</Text><Text style={styles.text}>{a.materialsNeeded.join(', ')}</Text></>)}
                  {a.teacherInstructions.length > 0 && (
                    <>
                      <Text style={styles.label}>HOW TO RUN IT</Text>
                      {a.teacherInstructions.map((s, i) => <Text key={i} style={styles.text}>{i + 1}. {s}</Text>)}
                    </>
                  )}
                  {!!a.behaviourToObserve && (<><Text style={styles.label}>WHAT TO OBSERVE</Text><Text style={styles.text}>{a.behaviourToObserve}</Text></>)}
                  {!!a.culturalAdaptationNotes && (<><Text style={styles.label}>LOCAL ADAPTATION</Text><Text style={styles.text}>{a.culturalAdaptationNotes}</Text></>)}
                  <Text style={styles.label}>RECORD EVIDENCE FOR</Text>
                  {a.mappedIndicatorIds.map((id) => INDICATORS_BY_ID[id] && (
                    <TouchableOpacity key={id} style={[styles.chip, { marginBottom: 6 }]} onPress={() => navigation.navigate('PreschoolAssess', { indicatorId: id })}>
                      <Text style={styles.chipText}>＋ {INDICATORS_BY_ID[id].title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </GlassCard>
          );
        })}
      </ScrollView>
    </ScreenBackground>
  );
}
