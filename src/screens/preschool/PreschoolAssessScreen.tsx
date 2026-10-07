import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { resolveChildBand } from '../../utils/preschoolEngine';
import { getPreschoolStore, buildEvidenceEvent } from '../../utils/preschoolStore';
import { getIndicatorsByBandAndDomain, INDICATORS_BY_ID } from '../../data/preschoolIndicators';
import {
  DEVELOPMENTAL_DOMAINS, DEVELOPMENTAL_RATINGS, ASSESSMENT_METHODS, SUPPORTED_LANGUAGES,
  DevelopmentalDomainCode, DevelopmentalRating, AssessmentMethodCode, LanguageOfEvidence,
} from '../../types/preschoolDevelopmental';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';
import type { ScreenProps } from '../../navigation/types';
import { makeStyles, usePreschoolData, RATING_COLORS, PreschoolChild } from './shared';

const DOMAIN_CODES = Object.keys(DEVELOPMENTAL_DOMAINS) as DevelopmentalDomainCode[];

/** Record one piece of evidence: child → domain → indicator → rating (0–4), method, optional note/language. */
export default function PreschoolAssessScreen({ route, navigation }: ScreenProps<'PreschoolAssess'>) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const toast = useToast();
  const { loading, children } = usePreschoolData();

  const preIndicator = route.params?.indicatorId ? INDICATORS_BY_ID[route.params.indicatorId] : undefined;
  const [child, setChild] = useState<PreschoolChild | undefined>(route.params?.child);
  const [domain, setDomain] = useState<DevelopmentalDomainCode>(preIndicator?.domainCode ?? 'JM-CD');
  const [indicatorId, setIndicatorId] = useState<string | undefined>(preIndicator?.id);
  const [rating, setRating] = useState<DevelopmentalRating | null>(null);
  const [method, setMethod] = useState<AssessmentMethodCode | null>(null);
  const [language, setLanguage] = useState<LanguageOfEvidence | undefined>();
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const indicators = useMemo(
    () => (child ? getIndicatorsByBandAndDomain(resolveChildBand(child), domain) : []),
    [child, domain],
  );
  const indicator = indicatorId ? INDICATORS_BY_ID[indicatorId] : undefined;

  // Default the method to the indicator's recommended one until the teacher picks.
  useEffect(() => { if (indicator && !method) setMethod(indicator.defaultMethod); }, [indicator, method]);

  const pickIndicator = (id: string) => {
    setIndicatorId(id);
    setMethod(INDICATORS_BY_ID[id].defaultMethod);
  };

  const canSave = !!child && !!indicator && rating !== null && !!method && !saving;

  const save = async () => {
    if (!child || !indicator || rating === null || !method) return;
    setSaving(true);
    try {
      await getPreschoolStore().save(buildEvidenceEvent({
        child, indicator, rating, method, language, notes,
        observer: { id: user?.id ?? 'teacher', name: user?.name ?? 'Teacher' },
      }));
      toast.success('Observation saved');
      navigation.goBack();
    } catch {
      toast.error('Could not save the observation. Please try again.');
      setSaving(false);
    }
  };

  if (!route.params?.child && loading) {
    return <ScreenBackground><View style={styles.centered}><ActivityIndicator color={colors.purple} /></View></ScreenBackground>;
  }

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>Record an observation</Text>

        {!route.params?.child && (
          <>
            <Text style={styles.label}>CHILD</Text>
            {children.length === 0 ? (
              <Text style={styles.text}>No Pre-school children found in your classes yet.</Text>
            ) : (
              <View style={styles.chipWrap}>
                {children.map((c) => (
                  <TouchableOpacity key={c.id} style={[styles.chip, child?.id === c.id && styles.chipOn]} onPress={() => { setChild(c); setIndicatorId(preIndicator?.id); }}>
                    <Text style={[styles.chipText, child?.id === c.id && styles.chipTextOn]}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
        {route.params?.child && <Text style={styles.meta}>For {route.params.child.name}</Text>}

        {child && (
          <>
            <Text style={styles.label}>DOMAIN</Text>
            <View style={styles.chipWrap}>
              {DOMAIN_CODES.map((d) => (
                <TouchableOpacity key={d} style={[styles.chip, domain === d && styles.chipOn]} onPress={() => { setDomain(d); setIndicatorId(undefined); }}>
                  <Text style={[styles.chipText, domain === d && styles.chipTextOn]}>{DEVELOPMENTAL_DOMAINS[d].shortName}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>WHAT DID YOU SEE? (INDICATOR)</Text>
            {indicators.length === 0 ? (
              <Text style={styles.text}>No indicators for this domain at this age band.</Text>
            ) : (
              indicators.map((ind) => (
                <GlassCard key={ind.id} padding={12} style={styles.card} onPress={() => pickIndicator(ind.id)}>
                  <Text style={[styles.cardTitle, indicatorId === ind.id && { color: colors.purple }]}>{ind.title}</Text>
                  <Text style={styles.muted}>{ind.clusterName}</Text>
                  {indicatorId === ind.id && !!ind.behaviourToObserve && (
                    <Text style={[styles.text, { marginTop: 6 }]}>Look for: {ind.behaviourToObserve}</Text>
                  )}
                </GlassCard>
              ))
            )}

            {indicator && (
              <>
                <Text style={styles.label}>RATING</Text>
                {([0, 1, 2, 3, 4] as DevelopmentalRating[]).map((r) => {
                  const info = DEVELOPMENTAL_RATINGS[r];
                  const on = rating === r;
                  return (
                    <TouchableOpacity
                      key={r}
                      style={[styles.chip, { marginBottom: 8 }, on && { borderColor: RATING_COLORS[r], backgroundColor: `${RATING_COLORS[r]}22` }]}
                      onPress={() => setRating(r)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: on }}
                    >
                      <Text style={[styles.chipText, on && styles.chipTextOn]}>{r} · {info.stage}</Text>
                      <Text style={styles.muted}>{info.interpretation}</Text>
                    </TouchableOpacity>
                  );
                })}

                <Text style={styles.label}>HOW WAS IT OBSERVED?</Text>
                <View style={styles.chipWrap}>
                  {(Object.keys(ASSESSMENT_METHODS) as AssessmentMethodCode[]).map((m) => (
                    <TouchableOpacity key={m} style={[styles.chip, method === m && styles.chipOn]} onPress={() => setMethod(m)}>
                      <Text style={[styles.chipText, method === m && styles.chipTextOn]}>{ASSESSMENT_METHODS[m].label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>LANGUAGE (OPTIONAL)</Text>
                <View style={styles.chipWrap}>
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <TouchableOpacity key={l} style={[styles.chip, language === l && styles.chipOn]} onPress={() => setLanguage(language === l ? undefined : l)}>
                      <Text style={[styles.chipText, language === l && styles.chipTextOn]}>{l}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>NOTE (OPTIONAL)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="What exactly did the child do or say?"
                  placeholderTextColor={colors.textSubtle}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                />
              </>
            )}

            <TouchableOpacity style={[styles.primaryBtn, !canSave && styles.primaryBtnOff]} disabled={!canSave} onPress={save} accessibilityRole="button">
              <Text style={styles.primaryBtnText}>{saving ? 'Saving…' : 'Save observation'}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}
