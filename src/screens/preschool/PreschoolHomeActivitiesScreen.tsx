import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import { resolveChildBand } from '../../utils/preschoolEngine';
import { getIndicatorsByBandAndDomain } from '../../data/preschoolIndicators';
import { DEVELOPMENTAL_BANDS, DEVELOPMENTAL_DOMAINS, DevelopmentalDomainCode } from '../../types/preschoolDevelopmental';
import { useThemedStyles } from '../../context/ThemeContext';
import type { ScreenProps } from '../../navigation/types';
import { makeStyles, toPreschoolChild } from './shared';

const DOMAIN_CODES = Object.keys(DEVELOPMENTAL_DOMAINS) as DevelopmentalDomainCode[];
const PER_DOMAIN = 3;

/**
 * Parent view: simple things to do at home for a child's age band, from the framework's
 * home-activity suggestions. Independent of teacher evidence (which lives on the teacher's device for now).
 */
export default function PreschoolHomeActivitiesScreen({ route }: ScreenProps<'PreschoolHomeActivities'>) {
  const styles = useThemedStyles(makeStyles);
  const child = toPreschoolChild(route.params.child);
  const band = DEVELOPMENTAL_BANDS[resolveChildBand(child)];

  const groups = useMemo(
    () => DOMAIN_CODES.map((d) => ({
      domain: DEVELOPMENTAL_DOMAINS[d],
      items: getIndicatorsByBandAndDomain(band.band, d).filter((i) => !!i.homeActivity).slice(0, PER_DOMAIN),
    })).filter((g) => g.items.length > 0),
    [band.band],
  );

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>Play at home with {child.name}</Text>
        <Text style={styles.meta}>{band.band} · {band.ageRange} · {band.title}. Short, everyday activities that build each area of development.</Text>

        {groups.map((g) => (
          <View key={g.domain.code}>
            <Text style={styles.label}>{g.domain.name.toUpperCase()}</Text>
            {g.items.map((i) => (
              <GlassCard key={i.id} padding={14} style={styles.card}>
                <Text style={styles.cardTitle}>{i.title}</Text>
                <Text style={[styles.text, { marginTop: 6 }]}>{i.homeActivity}</Text>
              </GlassCard>
            ))}
          </View>
        ))}
        <Text style={styles.notice}>Your child’s teacher observations will appear here once sharing between devices is available.</Text>
      </ScrollView>
    </ScreenBackground>
  );
}
