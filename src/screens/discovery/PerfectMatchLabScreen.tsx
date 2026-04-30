import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '../../hooks/useColors';
import { FONTS, SPACING, BORDER_RADIUS } from '../../utils/constants';

const QUESTIONS = [
  {
    id: 'pace',
    title: 'Ideal connection pace',
    options: [
      { label: 'Slow and intentional', value: 3 },
      { label: 'Balanced and steady', value: 2 },
      { label: 'Fast and exciting', value: 1 },
    ],
  },
  {
    id: 'weekend',
    title: 'Perfect weekend together',
    options: [
      { label: 'Outdoor adventure', value: 3 },
      { label: 'Brunch + movie', value: 2 },
      { label: 'Party and nightlife', value: 1 },
    ],
  },
  {
    id: 'communication',
    title: 'Communication style',
    options: [
      { label: 'Deep daily talks', value: 3 },
      { label: 'A few meaningful check-ins', value: 2 },
      { label: 'Low-key and flexible', value: 1 },
    ],
  },
];

export default function PerfectMatchLabScreen({ navigation }: any) {
  const COLORS = useColors();
  const styles = useMemo(() => makeStyles(COLORS), [COLORS]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [resultScore, setResultScore] = useState<number | null>(null);

  const totalAnswered = Object.keys(answers).length;

  const calculateResult = () => {
    const raw = Object.values(answers).reduce((acc, v) => acc + v, 0);
    const max = QUESTIONS.length * 3;
    const percent = Math.round((raw / max) * 100);
    setResultScore(percent);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>🧪 Perfect Match Lab</Text>
        <Text style={styles.subtitle}>
          This guided quiz powers your compatibility profile and gives stronger, less-random match suggestions.
        </Text>

        {QUESTIONS.map((q) => (
          <View key={q.id} style={styles.card}>
            <Text style={styles.questionTitle}>{q.title}</Text>
            {q.options.map((opt) => {
              const selected = answers[q.id] === opt.value;
              return (
                <TouchableOpacity
                  key={opt.label}
                  style={[styles.option, selected && styles.optionSelected]}
                  onPress={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.value }))}
                >
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        <TouchableOpacity
          style={[styles.cta, totalAnswered < QUESTIONS.length && styles.ctaDisabled]}
          disabled={totalAnswered < QUESTIONS.length}
          onPress={calculateResult}
        >
          <Text style={styles.ctaText}>Reveal Compatibility Blueprint</Text>
        </TouchableOpacity>

        {resultScore !== null && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Your compatibility blueprint score</Text>
            <Text style={styles.resultScore}>{resultScore}%</Text>
            <Text style={styles.resultHint}>
              {resultScore >= 80
                ? 'High intentional-match profile: prioritize depth, consistency, and value alignment.'
                : resultScore >= 60
                ? 'Balanced profile: flexible matching with high potential for growth.'
                : 'Exploration profile: best with discovery-first conversations and chemistry-led dates.'}
            </Text>
            <TouchableOpacity style={styles.secondaryCta} onPress={() => navigation.goBack()}>
              <Text style={styles.secondaryCtaText}>Back to Discover</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
    title: { fontSize: 28, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SPACING.sm },
    subtitle: { fontSize: 14, fontFamily: FONTS.regular, color: COLORS.textSecondary, marginBottom: SPACING.lg, lineHeight: 20 },
    card: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md },
    questionTitle: { fontSize: 16, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SPACING.sm },
    option: {
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: BORDER_RADIUS.md,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      marginBottom: SPACING.xs,
      backgroundColor: COLORS.background,
    },
    optionSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '15' },
    optionText: { fontSize: 14, fontFamily: FONTS.medium, color: COLORS.text },
    optionTextSelected: { color: COLORS.primary },
    cta: {
      backgroundColor: COLORS.primary,
      borderRadius: BORDER_RADIUS.lg,
      alignItems: 'center',
      paddingVertical: SPACING.md,
      marginTop: SPACING.sm,
    },
    ctaDisabled: { opacity: 0.4 },
    ctaText: { color: COLORS.white, fontSize: 15, fontFamily: FONTS.bold },
    resultCard: {
      marginTop: SPACING.lg,
      backgroundColor: COLORS.surface,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.lg,
      alignItems: 'center',
    },
    resultLabel: { fontSize: 13, fontFamily: FONTS.medium, color: COLORS.textSecondary, marginBottom: SPACING.xs },
    resultScore: { fontSize: 44, fontFamily: FONTS.bold, color: COLORS.primary, marginBottom: SPACING.sm },
    resultHint: { fontSize: 14, fontFamily: FONTS.regular, color: COLORS.text, textAlign: 'center', lineHeight: 20 },
    secondaryCta: {
      marginTop: SPACING.md,
      borderWidth: 1,
      borderColor: COLORS.primary,
      borderRadius: BORDER_RADIUS.md,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
    },
    secondaryCtaText: { color: COLORS.primary, fontFamily: FONTS.bold, fontSize: 14 },
  });
