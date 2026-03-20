import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/ProfileNavigator';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../utils/constants';
import { subscriptionService } from '../../services';
import { useAuthStore, useSubscriptionStore } from '../../store';
import { SubscriptionPlan } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type SubscriptionScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'Subscription'>;
};

// Tier visual config
const TIER_CONFIG: Record<string, {
  gradient: [string, string, ...string[]];
  accent: string;
  emoji: string;
  tagline: string;
}> = {
  free:  { gradient: ['#6B7280', '#4B5563'], accent: '#9CA3AF', emoji: '✨', tagline: 'Get started for free' },
  plus:  { gradient: ['#7C3AED', '#A855F7'], accent: '#C084FC', emoji: '💎', tagline: 'Most popular choice' },
  pro:   { gradient: ['#B91C1C', '#FF6B9D'], accent: '#FCA5A5', emoji: '👑', tagline: 'Best experience' },
};

// Feature row with check / cross / value
function FeatureRow({
  label,
  free,
  plus,
  pro,
}: {
  label: string;
  free: string;
  plus: string;
  pro: string;
}) {
  const cell = (val: string) => {
    const color =
      val === '✗' ? '#9CA3AF' :
      val === '✓' ? '#10B981' :
      COLORS.text;
    return (
      <View style={tableStyles.cell}>
        <Text style={[tableStyles.cellText, { color }]}>{val}</Text>
      </View>
    );
  };
  return (
    <View style={tableStyles.row}>
      <View style={tableStyles.labelCell}>
        <Text style={tableStyles.label}>{label}</Text>
      </View>
      {cell(free)}
      {cell(plus)}
      {cell(pro)}
    </View>
  );
}

const tableStyles = StyleSheet.create({
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  labelCell: { flex: 2, paddingVertical: 12, paddingHorizontal: SPACING.md },
  cell: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  label: { fontSize: 13, fontFamily: FONTS.regular, color: COLORS.text },
  cellText: { fontSize: 13, fontFamily: FONTS.semiBold },
});

export default function SubscriptionScreen({ navigation }: SubscriptionScreenProps) {
  const { user } = useAuthStore();
  const { currentTier, loadPlans } = useSubscriptionStore();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>(currentTier || 'plus');
  const [isLoading, setIsLoading] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Subtle pulse for the CTA
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchPlans();
    startPulse();
  }, []);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const data = await subscriptionService.getPlans();
      setPlans(data);
    } catch {
      // Fallback to inline plans
      setPlans([
        { id: 'free', name: 'Free', price: 0, price_id: 'free', interval: 'month', features: { daily_reveals: 10, voice_unlock: 'activity_based', video_unlock: 'activity_based', daily_roses_kisses: 10 } },
        { id: 'plus', name: 'Plus', price: 9.99, price_id: 'price_plus', interval: 'month', features: { daily_reveals: 50, voice_unlock: 'immediate', video_unlock: 'activity_based', daily_roses_kisses: 50 } },
        { id: 'pro',  name: 'Pro',  price: 19.99, price_id: 'price_pro', interval: 'month', features: { daily_reveals: 'unlimited', voice_unlock: 'immediate', video_unlock: 'immediate', daily_roses_kisses: 'unlimited', profile_boost: true, advanced_filters: true } },
      ] as SubscriptionPlan[]);
    } finally {
      setIsLoading(false);
    }
  };

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  };

  const handleUpgrade = async () => {
    if (selectedPlan === currentTier) {
      Alert.alert('Already subscribed', `You're already on the ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} plan.`);
      return;
    }
    if (selectedPlan === 'free') {
      Alert.alert('Downgrade', 'To downgrade to Free, please cancel your current subscription from Settings.');
      return;
    }

    setIsUpgrading(true);
    try {
      // In production: open Stripe checkout. Here we simulate a successful upgrade.
      await new Promise((r) => setTimeout(r, 1500));
      await loadPlans();
      Alert.alert(
        '🎉 Welcome to ' + selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1) + '!',
        'Your new features are now unlocked.',
        [{ text: 'Awesome!', onPress: () => navigation.goBack() }]
      );
    } catch {
      Alert.alert('Payment failed', 'Please try again or use a different payment method.');
    } finally {
      setIsUpgrading(false);
    }
  };

  const selectedConfig = TIER_CONFIG[selectedPlan] || TIER_CONFIG.plus;

  const formatReveal = (v: number | 'unlimited') => (v === 'unlimited' ? '∞' : String(v));
  const formatUnlock = (v: 'immediate' | 'activity_based') => (v === 'immediate' ? '✓ Instant' : 'Activity');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ─── Header ─── */}
        <LinearGradient
          colors={selectedConfig.gradient}
          style={styles.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity style={styles.backCircle} onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.heroEmoji}>{selectedConfig.emoji}</Text>
          <Text style={styles.heroTitle}>Upgrade Your Experience</Text>
          <Text style={styles.heroSubtitle}>More connections. Richer conversations.</Text>
        </LinearGradient>

        {/* ─── Current Plan badge ─── */}
        <View style={styles.currentBadge}>
          <Text style={styles.currentBadgeText}>Current plan: <Text style={{ color: COLORS.primary }}>{(currentTier || 'free').toUpperCase()}</Text></Text>
        </View>

        {/* ─── Plan Cards ─── */}
        <View style={styles.plansRow}>
          {plans.map((plan) => {
            const cfg = TIER_CONFIG[plan.id] || TIER_CONFIG.free;
            const isSelected = selectedPlan === plan.id;
            const isCurrent = currentTier === plan.id;
            return (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  isSelected && { borderColor: cfg.accent, borderWidth: 2 },
                ]}
                onPress={() => setSelectedPlan(plan.id)}
                activeOpacity={0.85}
              >
                {/* Popular / Current badges */}
                {plan.id === 'plus' && !isCurrent && (
                  <View style={[styles.planBadge, { backgroundColor: cfg.accent }]}>
                    <Text style={styles.planBadgeText}>POPULAR</Text>
                  </View>
                )}
                {isCurrent && (
                  <View style={[styles.planBadge, { backgroundColor: COLORS.success }]}>
                    <Text style={styles.planBadgeText}>ACTIVE</Text>
                  </View>
                )}

                <LinearGradient
                  colors={isSelected ? cfg.gradient : ['#F9FAFB', '#F3F4F6']}
                  style={styles.planCardInner}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.planEmoji}>{cfg.emoji}</Text>
                  <Text style={[styles.planName, { color: isSelected ? COLORS.white : COLORS.text }]}>
                    {plan.name}
                  </Text>
                  <Text style={[styles.planPrice, { color: isSelected ? COLORS.white : COLORS.primary }]}>
                    {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  </Text>
                  {plan.price > 0 && (
                    <Text style={[styles.planInterval, { color: isSelected ? 'rgba(255,255,255,0.8)' : COLORS.textSecondary }]}>
                      /month
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ─── Selected plan tagline ─── */}
        <Text style={styles.tagline}>{selectedConfig.tagline}</Text>

        {/* ─── Comparison Table ─── */}
        <View style={styles.tableCard}>
          {/* Header row */}
          <View style={[tableStyles.row, styles.tableHeader]}>
            <View style={tableStyles.labelCell}><Text style={styles.tableHeaderLabel}>Feature</Text></View>
            {plans.map((p) => (
              <View key={p.id} style={tableStyles.cell}>
                <Text style={[styles.tableHeaderLabel, selectedPlan === p.id && { color: COLORS.primary }]}>
                  {p.name}
                </Text>
              </View>
            ))}
          </View>

          <FeatureRow
            label="Daily Profiles"
            free={formatReveal(plans[0]?.features.daily_reveals ?? 10)}
            plus={formatReveal(plans[1]?.features.daily_reveals ?? 50)}
            pro={formatReveal(plans[2]?.features.daily_reveals ?? 'unlimited')}
          />
          <FeatureRow
            label="🌹/💋 Per Day"
            free={formatReveal(plans[0]?.features.daily_roses_kisses ?? 10)}
            plus={formatReveal(plans[1]?.features.daily_roses_kisses ?? 50)}
            pro={'∞'}
          />
          <FeatureRow
            label="Voice Calls"
            free="After 10 msgs"
            plus="✓ Instant"
            pro="✓ Instant"
          />
          <FeatureRow
            label="Video Calls"
            free="After call"
            plus="After call"
            pro="✓ Instant"
          />
          <FeatureRow
            label="Profile Boost"
            free="✗"
            plus="✗"
            pro="✓"
          />
          <FeatureRow
            label="Advanced Filters"
            free="✗"
            plus="✗"
            pro="✓"
          />
        </View>

        {/* ─── Perks highlight (only for Plus/Pro) ─── */}
        {selectedPlan !== 'free' && (
          <View style={styles.perksCard}>
            <Text style={styles.perksTitle}>What you get with {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}</Text>
            {selectedPlan === 'plus' && (
              <>
                <PerkRow emoji="👁️" text="See 50 profiles per day" />
                <PerkRow emoji="🎙️" text="Instant voice call unlock" />
                <PerkRow emoji="🌹" text="Send 50 Roses / Kisses daily" />
                <PerkRow emoji="🔍" text="See who liked you first" />
              </>
            )}
            {selectedPlan === 'pro' && (
              <>
                <PerkRow emoji="♾️" text="Unlimited daily profile reveals" />
                <PerkRow emoji="📹" text="Instant video call unlock" />
                <PerkRow emoji="🌹" text="Unlimited Roses & Kisses" />
                <PerkRow emoji="🚀" text="Weekly Profile Boost" />
                <PerkRow emoji="🔭" text="Advanced match filters" />
                <PerkRow emoji="⭐" text="Priority support" />
              </>
            )}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ─── Sticky CTA ─── */}
      <View style={styles.ctaContainer}>
        {selectedPlan !== currentTier ? (
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={handleUpgrade}
              disabled={isUpgrading}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={selectedConfig.gradient}
                style={styles.ctaGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isUpgrading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <Text style={styles.ctaEmoji}>{selectedConfig.emoji}</Text>
                    <Text style={styles.ctaText}>
                      {selectedPlan === 'free' ? 'Stay on Free' : `Get ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} — $${plans.find(p => p.id === selectedPlan)?.price}/mo`}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={styles.currentPlanCta}>
            <Text style={styles.currentPlanCtaText}>✓ You're on {(currentTier || 'free').charAt(0).toUpperCase() + (currentTier || 'free').slice(1)}</Text>
          </View>
        )}
        <Text style={styles.legalNote}>Billed monthly · Cancel anytime · Powered by Stripe</Text>
      </View>
    </SafeAreaView>
  );
}

function PerkRow({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={perkStyles.row}>
      <Text style={perkStyles.emoji}>{emoji}</Text>
      <Text style={perkStyles.text}>{text}</Text>
    </View>
  );
}

const perkStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  emoji: { fontSize: 20, width: 28 },
  text: { flex: 1, fontSize: 14, fontFamily: FONTS.regular, color: COLORS.text, lineHeight: 20 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  scroll: { paddingBottom: 20 },

  // Hero
  heroGradient: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  backCircle: {
    alignSelf: 'flex-start',
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  backArrow: { fontSize: 20, color: COLORS.white },
  heroEmoji: { fontSize: 52 },
  heroTitle: { fontSize: 26, fontFamily: FONTS.bold, color: COLORS.white, textAlign: 'center' },
  heroSubtitle: { fontSize: 15, fontFamily: FONTS.regular, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },

  // Badge
  currentBadge: { alignItems: 'center', paddingVertical: SPACING.md },
  currentBadgeText: { fontSize: 13, fontFamily: FONTS.regular, color: COLORS.textSecondary },

  // Plan cards
  plansRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  planCard: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    position: 'relative',
  },
  planCardInner: { padding: SPACING.md, alignItems: 'center', gap: 2 },
  planBadge: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    paddingVertical: 3,
    alignItems: 'center',
    zIndex: 1,
  },
  planBadgeText: { fontSize: 9, fontFamily: FONTS.bold, color: COLORS.white, letterSpacing: 1 },
  planEmoji: { fontSize: 24, marginTop: 12 },
  planName: { fontSize: 16, fontFamily: FONTS.bold, marginTop: 4 },
  planPrice: { fontSize: 22, fontFamily: FONTS.bold },
  planInterval: { fontSize: 11, fontFamily: FONTS.regular },

  // Tagline
  tagline: {
    textAlign: 'center',
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },

  // Comparison table
  tableCard: {
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.white,
  },
  tableHeader: { backgroundColor: COLORS.surface },
  tableHeaderLabel: { fontSize: 12, fontFamily: FONTS.bold, color: COLORS.text, textTransform: 'uppercase', letterSpacing: 0.5 },

  // Perks card
  perksCard: {
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary + '0D',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  perksTitle: { fontSize: 16, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SPACING.md },

  // CTA
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: 34,
    gap: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  ctaButton: { borderRadius: BORDER_RADIUS.xl, overflow: 'hidden' },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md + 2,
    gap: SPACING.sm,
  },
  ctaEmoji: { fontSize: 20 },
  ctaText: { fontSize: 17, fontFamily: FONTS.bold, color: COLORS.white },
  currentPlanCta: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.success + '18',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.success + '40',
  },
  currentPlanCtaText: { fontSize: 16, fontFamily: FONTS.semiBold, color: COLORS.success },
  legalNote: { fontSize: 12, fontFamily: FONTS.regular, color: COLORS.textSecondary, textAlign: 'center' },
});
