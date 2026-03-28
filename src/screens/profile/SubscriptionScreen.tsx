/**
 * SubscriptionScreen — Credits & In-App Purchase
 *
 * Native App Store IAP flow with credit packs.
 * Matches the exact "screen method" purchase pattern:
 *   • Balance header with credits count
 *   • Feature highlights
 *   • Horizontal credit pack cards with savings badges
 *   • Tapping a pack triggers native App Store purchase sheet
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/ProfileNavigator';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../utils/constants';
import { useCreditsStore } from '../../store/useCreditsStore';
import { CreditPack, CREDIT_COSTS, CreditAction } from '../../services/iap.service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.sm * 2) / 2.5;

type SubscriptionScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'Subscription'>;
};

// ─── Feature highlight data ──────────────────────────────────────────────
const FEATURES = [
  {
    emoji: '🌹',
    title: 'Send Roses & Kisses',
    desc: 'Stand out from the crowd',
    cost: 1,
  },
  {
    emoji: '🚀',
    title: 'Profile Boost',
    desc: 'Be seen by 10x more people',
    cost: 5,
  },
  {
    emoji: '👀',
    title: 'See Who Liked You',
    desc: 'Skip the guessing game',
    cost: 3,
  },
  {
    emoji: '🎙️',
    title: 'Instant Voice Unlock',
    desc: 'Call matches immediately',
    cost: 3,
  },
  {
    emoji: '📹',
    title: 'Instant Video Unlock',
    desc: 'Jump to video calls',
    cost: 5,
  },
  {
    emoji: '✨',
    title: 'Extra Daily Reveals',
    desc: '+10 extra profiles per use',
    cost: 2,
  },
];

// ─── Credit Pack Card ────────────────────────────────────────────────────
function CreditPackCard({
  pack,
  isPurchasing,
  purchasingProductId,
  onPurchase,
  index,
}: {
  pack: CreditPack;
  isPurchasing: boolean;
  purchasingProductId: string | null;
  onPurchase: (productId: string) => void;
  index: number;
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const isThisPurchasing = isPurchasing && purchasingProductId === pack.productId;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 100,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePress = () => {
    if (isPurchasing) return;
    onPurchase(pack.productId);
  };

  const getBorderColor = () => {
    if (pack.bestValue) return '#FFD700';
    if (pack.popular) return '#C084FC';
    return 'rgba(255,255,255,0.15)';
  };

  const getGradient = (): [string, string, ...string[]] => {
    if (pack.bestValue) return ['#1a1a2e', '#16213e', '#0f3460'];
    if (pack.popular) return ['#1a1a2e', '#2d1b69', '#1a1a2e'];
    return ['#1a1a2e', '#1f2937', '#1a1a2e'];
  };

  return (
    <Animated.View
      style={[
        packStyles.cardWrapper,
        {
          transform: [{ scale: scaleAnim }],
          opacity: scaleAnim,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handlePress}
        disabled={isPurchasing}
        style={[
          packStyles.card,
          { borderColor: getBorderColor() },
          pack.bestValue && packStyles.bestValueCard,
          pack.popular && packStyles.popularCard,
        ]}
      >
        <LinearGradient
          colors={getGradient()}
          style={packStyles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          {/* Badge */}
          {(pack.savings || pack.popular || pack.bestValue) && (
            <View style={[
              packStyles.badge,
              pack.bestValue && packStyles.bestValueBadge,
              pack.popular && packStyles.popularBadge,
            ]}>
              <Text style={packStyles.badgeText}>
                {pack.bestValue ? '🔥 BEST VALUE' : pack.popular ? '⭐ POPULAR' : pack.savings}
              </Text>
            </View>
          )}

          {/* Credits amount */}
          <Text style={packStyles.credits}>{pack.credits}</Text>
          <View style={packStyles.creditsIconRow}>
            <Text style={packStyles.heartIcon}>💎</Text>
          </View>
          <Text style={packStyles.creditsLabel}>Credits</Text>

          {/* Price */}
          <View style={packStyles.priceContainer}>
            {isThisPurchasing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={packStyles.price}>{pack.price}</Text>
                {pack.savings && (
                  <Text style={packStyles.savingsText}>{pack.savings}</Text>
                )}
              </>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const packStyles = StyleSheet.create({
  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: SPACING.sm,
  },
  card: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  bestValueCard: {
    borderWidth: 2,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  popularCard: {
    borderWidth: 2,
    shadowColor: '#C084FC',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  cardGradient: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#10B981',
    paddingVertical: 4,
    alignItems: 'center',
  },
  bestValueBadge: {
    backgroundColor: '#FFD700',
  },
  popularBadge: {
    backgroundColor: '#8B5CF6',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  credits: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 8,
  },
  creditsIconRow: {
    marginTop: 2,
  },
  heartIcon: {
    fontSize: 22,
  },
  creditsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  priceContainer: {
    marginTop: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    minWidth: 80,
    alignItems: 'center',
  },
  price: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  savingsText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#34D399',
    marginTop: 2,
  },
});

// ─── Feature Row ─────────────────────────────────────────────────────────
function FeatureItem({
  emoji,
  title,
  desc,
  cost,
  index,
}: {
  emoji: string;
  title: string;
  desc: string;
  cost: number;
  index: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: 200 + index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: 200 + index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        featureStyles.row,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={featureStyles.emojiContainer}>
        <Text style={featureStyles.emoji}>{emoji}</Text>
      </View>
      <View style={featureStyles.textContainer}>
        <Text style={featureStyles.title}>{title}</Text>
        <Text style={featureStyles.desc}>{desc}</Text>
      </View>
      <View style={featureStyles.costBadge}>
        <Text style={featureStyles.costText}>{cost} 💎</Text>
      </View>
    </Animated.View>
  );
}

const featureStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  emojiContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  emoji: {
    fontSize: 22,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  desc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  costBadge: {
    backgroundColor: 'rgba(139,21,56,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139,21,56,0.5)',
  },
  costText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF6B9D',
  },
});

// ─── Main Screen ─────────────────────────────────────────────────────────
export default function SubscriptionScreen({ navigation }: SubscriptionScreenProps) {
  const {
    balance,
    packs,
    isLoading,
    isPurchasing,
    purchasingProductId,
    error,
    initialize,
    refreshBalance,
    loadPacks,
    purchasePack,
    restorePurchases,
    clearError,
  } = useCreditsStore();

  const [refreshing, setRefreshing] = useState(false);
  const balanceAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const prevBalance = useRef(balance);

  useEffect(() => {
    initialize();
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Animate balance changes
  useEffect(() => {
    if (balance !== prevBalance.current) {
      Animated.sequence([
        Animated.timing(balanceAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
        Animated.spring(balanceAnim, { toValue: 1, tension: 100, friction: 5, useNativeDriver: true }),
      ]).start();
      prevBalance.current = balance;
    }
  }, [balance]);

  const handlePurchase = useCallback((productId: string) => {
    const pack = packs.find((p) => p.productId === productId);
    if (!pack) return;

    // Purchase directly — this triggers the native App Store sheet
    purchasePack(productId);
  }, [packs, purchasePack]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshBalance(), loadPacks()]);
    setRefreshing(false);
  };

  const handleRestore = () => {
    Alert.alert(
      'Restore Purchases',
      'We will check for any pending purchases.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Restore', onPress: () => restorePurchases() },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
          />
        }
      >
        {/* ─── Header with Balance ─── */}
        <LinearGradient
          colors={['#0A0A1A', '#1a1a2e', '#16213e']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
            {/* Top bar */}
            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
              >
                <Text style={styles.backText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Credits</Text>
              <TouchableOpacity
                style={styles.historyButton}
                onPress={handleRestore}
                activeOpacity={0.7}
              >
                <Text style={styles.historyIcon}>↻</Text>
              </TouchableOpacity>
            </View>

            {/* Balance display */}
            <Animated.View style={[
              styles.balanceContainer,
              {
                opacity: headerAnim,
                transform: [{
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                }],
              },
            ]}>
              <Text style={styles.balanceLabel}>BALANCE</Text>
              <View style={styles.balanceRow}>
                <Animated.Text style={[
                  styles.balanceValue,
                  { transform: [{ scale: balanceAnim.interpolate({ inputRange: [0, 1, 1.2], outputRange: [1, 1, 1.3] }) }] },
                ]}>
                  {balance}
                </Animated.Text>
                <Text style={styles.balanceCurrency}>💎</Text>
              </View>
            </Animated.View>

            {/* Quick feature highlights */}
            <View style={styles.quickFeatures}>
              <View style={styles.quickFeatureItem}>
                <Text style={styles.quickFeatureIcon}>🌹</Text>
                <Text style={styles.quickFeatureLabel}>Send Roses{'\n'}& Kisses</Text>
              </View>
              <View style={styles.quickFeatureItem}>
                <Text style={styles.quickFeatureIcon}>🚀</Text>
                <Text style={styles.quickFeatureLabel}>Profile{'\n'}Boost</Text>
              </View>
              <View style={styles.quickFeatureItem}>
                <Text style={styles.quickFeatureIcon}>👀</Text>
                <Text style={styles.quickFeatureLabel}>See Who{'\n'}Liked You</Text>
              </View>
              <View style={styles.quickFeatureItem}>
                <Text style={styles.quickFeatureIcon}>🎙️</Text>
                <Text style={styles.quickFeatureLabel}>Instant{'\n'}Unlocks</Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* ─── Credit Packs ─── */}
        <View style={styles.packsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Get Credits</Text>
            <Text style={styles.sectionSubtitle}>Tap a pack to purchase</Text>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.packsScroll}
              decelerationRate="fast"
              snapToInterval={CARD_WIDTH + SPACING.sm}
            >
              {packs.map((pack, index) => (
                <CreditPackCard
                  key={pack.productId}
                  pack={pack}
                  isPurchasing={isPurchasing}
                  purchasingProductId={purchasingProductId}
                  onPurchase={handlePurchase}
                  index={index}
                />
              ))}
            </ScrollView>
          )}

          {/* Payment method note */}
          <View style={styles.paymentNote}>
            <Text style={styles.paymentIcon}>
              {Platform.OS === 'ios' ? '' : '🏪'}
            </Text>
            <View>
              <Text style={styles.paymentLabel}>PAYMENT METHOD</Text>
              <Text style={styles.paymentValue}>
                {Platform.OS === 'ios' ? 'App Store' : 'Google Play'}
              </Text>
            </View>
          </View>
        </View>

        {/* ─── What Credits Do ─── */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresSectionTitle}>What can you do with credits?</Text>
          {FEATURES.map((feature, index) => (
            <FeatureItem
              key={feature.title}
              emoji={feature.emoji}
              title={feature.title}
              desc={feature.desc}
              cost={feature.cost}
              index={index}
            />
          ))}
        </View>

        {/* ─── FAQ / Legal ─── */}
        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>How it works</Text>
          <View style={styles.faqItem}>
            <Text style={styles.faqQ}>What are credits?</Text>
            <Text style={styles.faqA}>
              Credits are the in-app currency used to access premium features like sending Roses,
              boosting your profile, and unlocking calls instantly.
            </Text>
          </View>
          <View style={styles.faqItem}>
            <Text style={styles.faqQ}>Do credits expire?</Text>
            <Text style={styles.faqA}>
              No! Your credits never expire. Use them whenever you want.
            </Text>
          </View>
          <View style={styles.faqItem}>
            <Text style={styles.faqQ}>Can I get a refund?</Text>
            <Text style={styles.faqA}>
              Refunds are handled by the {Platform.OS === 'ios' ? 'App Store' : 'Google Play Store'}.
              Please contact their support for refund requests.
            </Text>
          </View>
        </View>

        {/* Restore & legal */}
        <View style={styles.legalSection}>
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
            activeOpacity={0.7}
          >
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </TouchableOpacity>
          <Text style={styles.legalText}>
            Payment will be charged to your {Platform.OS === 'ios' ? 'Apple ID' : 'Google'} account.
            {'\n'}By purchasing you agree to our Terms of Service.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Error toast */}
      {error && (
        <TouchableOpacity style={styles.errorToast} onPress={clearError}>
          <Text style={styles.errorToastText}>⚠️ {error}</Text>
          <Text style={styles.errorDismiss}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1A',
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Header
  headerGradient: {
    paddingBottom: SPACING.xl,
  },
  headerSafeArea: {},
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  historyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },

  // Balance
  balanceContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
    marginBottom: SPACING.xs,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceValue: {
    fontSize: 64,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -2,
  },
  balanceCurrency: {
    fontSize: 36,
    marginTop: -8,
  },

  // Quick features
  quickFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  quickFeatureItem: {
    alignItems: 'center',
    gap: 6,
  },
  quickFeatureIcon: {
    fontSize: 24,
  },
  quickFeatureLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 14,
  },

  // Packs section
  packsSection: {
    paddingTop: SPACING.xl,
  },
  sectionHeader: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
  },
  packsScroll: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  loadingContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Payment note
  paymentNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  paymentIcon: {
    fontSize: 28,
  },
  paymentLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
  },
  paymentValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 2,
  },

  // Features section
  featuresSection: {
    marginTop: SPACING.xl + SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  featuresSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },

  // FAQ
  faqSection: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  faqTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: SPACING.md,
  },
  faqItem: {
    marginBottom: SPACING.lg,
  },
  faqQ: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  faqA: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 20,
  },

  // Legal
  legalSection: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  restoreButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    marginBottom: SPACING.md,
  },
  restoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
  },
  legalText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.25)',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Error toast
  errorToast: {
    position: 'absolute',
    bottom: 40,
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: 'rgba(239,68,68,0.95)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  errorToastText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  errorDismiss: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.7,
    paddingLeft: 12,
  },
});
