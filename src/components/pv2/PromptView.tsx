import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import GlassCard from '../GlassCard';
import { rs } from '../../utils/responsive';
import { radii, spacing, Palette } from '../../theme';
import { useThemedStyles, useTheme } from '../../context/ThemeContext';
import {
  PV2Prompt, PV2Answer, initialAnswer, isAnswerComplete, buildResponse,
  sliderBounds, allocationTotal, allocated, ALLOCATION_STEP,
  moveInRanking, stepAllocation, toggleMulti,
} from '../../utils/professionalV2Logic';
import type { PV2EventType } from '../../utils/professionalV2Api';

interface Props {
  prompt: PV2Prompt;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (response: Record<string, any>) => void;
  onEvent: (type: PV2EventType, value?: Record<string, any>) => void;
}

/**
 * Renders one assessment prompt (a top-level item or a simulation stage) and
 * reports the user's answer as the JSON the server expects. Mount it with a
 * `key` per prompt so local state resets between prompts.
 *
 * Construct labels, signals and scoring hints never reach the client (the
 * server strips them), so this only ever shows prompt text + option text.
 */
export default function PromptView({ prompt, submitting, submitLabel, onSubmit, onEvent }: Props) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [answer, setAnswer] = useState<PV2Answer>(() => initialAnswer(prompt));
  const [remaining, setRemaining] = useState<number | null>(prompt.timeLimitSeconds ?? null);
  const [timedOut, setTimedOut] = useState(false);
  const hasSelectedOnce = useRef(false);
  const autoSubmitted = useRef(false);

  // Countdown for time-limited prompts. Running out never blocks the user: a
  // timed_task auto-submits whatever they have so far.
  useEffect(() => {
    if (remaining === null) return;
    if (remaining <= 0) { setTimedOut(true); return; }
    const t = setTimeout(() => setRemaining((r) => (r === null ? r : r - 1)), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  const complete = isAnswerComplete(prompt, answer, { timedOut });

  useEffect(() => {
    if (timedOut && prompt.type === 'timed_task' && !autoSubmitted.current && !submitting) {
      autoSubmitted.current = true;
      onSubmit(buildResponse(prompt, answer));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timedOut]);

  const pickSingle = (code: string) => {
    if (answer.choice === code) return;
    onEvent(hasSelectedOnce.current ? 'changed' : 'selected', { code, from: answer.choice ?? null });
    hasSelectedOnce.current = true;
    setAnswer((a) => ({ ...a, choice: code }));
  };

  const toggleOption = (code: string, opensInfo: boolean) => {
    const max = Number.isFinite(prompt.config?.maxSelections) ? Number(prompt.config!.maxSelections) : undefined;
    const already = answer.multi?.includes(code);
    onEvent(opensInfo && !already ? 'opened' : already ? 'changed' : 'selected', { code });
    setAnswer((a) => ({ ...a, multi: toggleMulti(a.multi, code, max) }));
  };

  const renderOptions = () => {
    switch (prompt.type) {
      case 'multi_select':
      case 'information_selection': {
        const info = prompt.type === 'information_selection';
        return prompt.options.map((o) => {
          const on = !!answer.multi?.includes(o.code);
          return (
            <OptionRow key={o.optionId} text={o.text} selected={on} multi
              onPress={() => toggleOption(o.code, info)} styles={styles} />
          );
        });
      }
      case 'ranking':
        return (answer.ranking ?? []).map((code, i, arr) => {
          const o = prompt.options.find((x) => x.code === code);
          if (!o) return null;
          return (
            <View key={code} style={styles.rankRow}>
              <Text style={styles.rankNum}>{i + 1}</Text>
              <Text style={styles.rankText}>{o.text}</Text>
              <View style={styles.rankBtns}>
                <TouchableOpacity
                  disabled={i === 0}
                  onPress={() => {
                    onEvent('ranked', { code, from: i, to: i - 1 });
                    setAnswer((a) => ({ ...a, ranking: moveInRanking(a.ranking ?? [], i, -1) }));
                  }}
                  style={[styles.stepBtn, i === 0 && styles.stepBtnOff]}
                  accessibilityRole="button" accessibilityLabel={`Move ${o.text} up`}
                >
                  <Text style={styles.stepBtnText}>▲</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={i === arr.length - 1}
                  onPress={() => {
                    onEvent('ranked', { code, from: i, to: i + 1 });
                    setAnswer((a) => ({ ...a, ranking: moveInRanking(a.ranking ?? [], i, 1) }));
                  }}
                  style={[styles.stepBtn, i === arr.length - 1 && styles.stepBtnOff]}
                  accessibilityRole="button" accessibilityLabel={`Move ${o.text} down`}
                >
                  <Text style={styles.stepBtnText}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        });
      case 'resource_allocation': {
        const total = allocationTotal(prompt.config);
        const left = total - allocated(answer);
        return (
          <>
            <Text style={styles.allocHint}>
              {left === 0 ? 'All points allocated' : `${left} of ${total} points left to allocate`}
            </Text>
            {prompt.options.map((o) => {
              const n = answer.allocation?.[o.code] ?? 0;
              const change = (delta: number) => {
                onEvent('reallocated', { code: o.code, delta });
                setAnswer((a) => stepAllocation(a, o.code, delta, total));
              };
              return (
                <View key={o.optionId} style={styles.rankRow}>
                  <Text style={styles.rankText}>{o.text}</Text>
                  <View style={styles.rankBtns}>
                    <TouchableOpacity onPress={() => change(-ALLOCATION_STEP)} disabled={n === 0}
                      style={[styles.stepBtn, n === 0 && styles.stepBtnOff]}
                      accessibilityRole="button" accessibilityLabel={`Decrease ${o.text}`}>
                      <Text style={styles.stepBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.allocValue}>{n}</Text>
                    <TouchableOpacity onPress={() => change(ALLOCATION_STEP)} disabled={left === 0}
                      style={[styles.stepBtn, left === 0 && styles.stepBtnOff]}
                      accessibilityRole="button" accessibilityLabel={`Increase ${o.text}`}>
                      <Text style={styles.stepBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </>
        );
      }
      case 'confidence_slider': {
        const { min, max, step } = sliderBounds(prompt.config);
        const points: number[] = [];
        for (let v = min; v <= max; v += step) points.push(v);
        return (
          <View>
            <Text style={styles.sliderValue}>{answer.value}</Text>
            <View style={styles.sliderRow}>
              {points.map((v) => {
                const on = v === answer.value;
                return (
                  <TouchableOpacity
                    key={v}
                    onPress={() => {
                      onEvent(hasSelectedOnce.current ? 'changed' : 'selected', { value: v });
                      hasSelectedOnce.current = true;
                      setAnswer((a) => ({ ...a, value: v }));
                    }}
                    style={[styles.sliderDot, on && styles.sliderDotOn]}
                    accessibilityRole="button" accessibilityLabel={`Confidence ${v}`}
                    accessibilityState={{ selected: on }}
                  >
                    <Text style={[styles.sliderDotText, on && styles.sliderDotTextOn]}>{v}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>{prompt.config?.minLabel ?? 'Not confident'}</Text>
              <Text style={styles.sliderLabel}>{prompt.config?.maxLabel ?? 'Very confident'}</Text>
            </View>
          </View>
        );
      }
      case 'open_response':
        return (
          <TextInput
            style={styles.textArea}
            multiline
            value={answer.text ?? ''}
            onChangeText={(t) => setAnswer((a) => ({ ...a, text: t }))}
            placeholder="Type your response…"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Your response"
          />
        );
      default:
        // forced_choice, situational_judgment, timed_task (with options) and any future choice-like type
        if (prompt.options.length === 0) {
          return (
            <TextInput
              style={styles.textArea}
              multiline
              value={answer.text ?? ''}
              onChangeText={(t) => setAnswer((a) => ({ ...a, text: t }))}
              placeholder="Type your response…"
              placeholderTextColor={colors.textMuted}
              accessibilityLabel="Your response"
            />
          );
        }
        return prompt.options.map((o) => (
          <OptionRow key={o.optionId} text={o.text} selected={answer.choice === o.code}
            onPress={() => pickSingle(o.code)} styles={styles} />
        ));
    }
  };

  return (
    <View>
      {remaining !== null && (
        <Text style={[styles.timer, remaining <= 10 && { color: colors.error }]}>
          ⏱ {Math.floor(Math.max(remaining, 0) / 60)}:{String(Math.max(remaining, 0) % 60).padStart(2, '0')}
        </Text>
      )}
      <GlassCard variant="dark" padding={18} style={styles.promptCard}>
        <Text style={styles.promptText}>{prompt.promptText}</Text>
        {prompt.type === 'ranking' && <Text style={styles.helper}>Order from most to least important.</Text>}
        {prompt.type === 'multi_select' && <Text style={styles.helper}>Select all that apply.</Text>}
        {prompt.type === 'information_selection' && <Text style={styles.helper}>Choose the information you would look at.</Text>}
      </GlassCard>

      <View style={styles.options}>{renderOptions()}</View>

      <TouchableOpacity
        style={[styles.submit, (!complete || submitting) && styles.submitOff]}
        disabled={!complete || submitting}
        onPress={() => onSubmit(buildResponse(prompt, answer))}
        accessibilityRole="button"
        accessibilityState={{ disabled: !complete || submitting }}
      >
        <Text style={styles.submitText}>{submitting ? 'Saving…' : submitLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

function OptionRow({
  text, selected, multi, onPress, styles,
}: { text: string; selected: boolean; multi?: boolean; onPress: () => void; styles: ReturnType<typeof makeStyles> }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.option, selected && styles.optionOn]}
      accessibilityRole={multi ? 'checkbox' : 'radio'}
      accessibilityState={{ selected, checked: selected }}
    >
      <View style={[styles.mark, multi && styles.markSquare, selected && styles.markOn]}>
        {selected && <Text style={styles.markTick}>✓</Text>}
      </View>
      <Text style={styles.optionText}>{text}</Text>
    </TouchableOpacity>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  timer: { alignSelf: 'flex-end', fontSize: rs(14), fontWeight: '800', color: colors.textSecondary, marginBottom: 8 },
  promptCard: { marginBottom: spacing.lg },
  promptText: { fontSize: rs(16), lineHeight: rs(23), fontWeight: '700', color: colors.text },
  helper: { fontSize: rs(12), color: colors.textMuted, marginTop: 8 },
  options: { gap: 10, marginBottom: spacing.xl },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
    borderRadius: radii.lg, borderWidth: 1, borderColor: colors.borderSoft, backgroundColor: colors.glassLight,
  },
  optionOn: { borderColor: colors.success, backgroundColor: colors.successSoft },
  optionText: { flex: 1, fontSize: rs(14), lineHeight: rs(20), color: colors.text },
  mark: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.textMuted,
    alignItems: 'center', justifyContent: 'center',
  },
  markSquare: { borderRadius: 6 },
  markOn: { borderColor: colors.success, backgroundColor: colors.success },
  markTick: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  rankRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12,
    borderRadius: radii.lg, borderWidth: 1, borderColor: colors.borderSoft, backgroundColor: colors.glassLight,
  },
  rankNum: { width: 22, fontSize: rs(14), fontWeight: '800', color: colors.purpleSoft, textAlign: 'center' },
  rankText: { flex: 1, fontSize: rs(14), lineHeight: rs(20), color: colors.text },
  rankBtns: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepBtn: {
    width: 38, height: 38, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.bgTertiary,
  },
  stepBtnOff: { opacity: 0.35 },
  stepBtnText: { color: colors.text, fontSize: 16, fontWeight: '800' },
  allocHint: { fontSize: rs(13), fontWeight: '700', color: colors.textSecondary, marginBottom: 2 },
  allocValue: { minWidth: 34, textAlign: 'center', fontSize: rs(15), fontWeight: '800', color: colors.text },
  sliderValue: { fontSize: rs(34), fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 12 },
  sliderRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  sliderDot: {
    minWidth: 44, height: 44, borderRadius: 22, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.borderSoft, backgroundColor: colors.glassLight,
  },
  sliderDotOn: { backgroundColor: colors.success, borderColor: colors.success },
  sliderDotText: { color: colors.textSecondary, fontWeight: '700', fontSize: rs(13) },
  sliderDotTextOn: { color: '#FFFFFF' },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  sliderLabel: { fontSize: rs(11), color: colors.textMuted },
  textArea: {
    minHeight: 140, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.borderSoft,
    backgroundColor: colors.glassLight, color: colors.text, padding: 14, fontSize: rs(14),
    textAlignVertical: 'top',
  },
  submit: { backgroundColor: colors.success, borderRadius: radii.xl, paddingVertical: 16, alignItems: 'center' },
  submitOff: { opacity: 0.4 },
  submitText: { color: '#FFFFFF', fontSize: rs(15), fontWeight: '800' },
});
