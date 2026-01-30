import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSubscriptionStore } from '@/store';
import { COLORS, FONT_SIZES, SIZES } from '@/utils/constants';

export default function SubscriptionScreen() {
  const { plans, currentTier, loadPlans } = useSubscriptionStore();

  useEffect(() => {
    loadPlans();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Subscription</Text>
      <Text style={styles.currentTier}>Current: {currentTier}</Text>

      <View style={styles.plans}>
        {plans.map((plan) => (
          <View key={plan.id} style={styles.planCard}>
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planPrice}>
              ${plan.price}/{plan.interval}
            </Text>
            <TouchableOpacity style={styles.selectButton}>
              <Text style={styles.selectButtonText}>
                {currentTier === plan.id ? 'Current Plan' : 'Select'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  currentTier: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SIZES.xl,
  },
  plans: {
    gap: SIZES.md,
  },
  planCard: {
    backgroundColor: COLORS.surface,
    padding: SIZES.lg,
    borderRadius: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  planName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  planPrice: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginBottom: SIZES.md,
  },
  selectButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.md,
    borderRadius: SIZES.md,
    alignItems: 'center',
  },
  selectButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
