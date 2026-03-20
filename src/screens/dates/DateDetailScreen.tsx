import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
  Linking,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { DatesStackParamList } from '../../navigation/DatesNavigator';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../utils/constants';
import { dateService } from '../../services';
import { DateSuggestion } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORY_META: Record<string, { icon: string; color: string; label: string }> = {
  coffee:  { icon: '☕', color: '#8B5E3C', label: 'Coffee & Café' },
  museum:  { icon: '🏛️', color: '#4A6FA5', label: 'Museum & Culture' },
  park:    { icon: '🌳', color: '#3A8D5C', label: 'Parks & Outdoors' },
  dinner:  { icon: '🍽️', color: '#C0392B', label: 'Dinner & Dining' },
  all:     { icon: '📍', color: COLORS.primary, label: 'Venue' },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={starStyles.row}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={[starStyles.star, i <= rating && starStyles.filled]}>★</Text>
      ))}
      <Text style={starStyles.label}>{rating.toFixed(1)}</Text>
    </View>
  );
}

const starStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  star: { fontSize: 18, color: '#DDD' },
  filled: { color: '#FFC107' },
  label: { fontSize: 14, fontFamily: FONTS.semiBold, color: COLORS.text, marginLeft: 4 },
});

type DateDetailScreenProps = {
  route: RouteProp<DatesStackParamList, 'DateDetail'>;
  navigation: NativeStackNavigationProp<DatesStackParamList, 'DateDetail'>;
};

export default function DateDetailScreen({ route, navigation }: DateDetailScreenProps) {
  const { suggestionId } = route.params;
  const [suggestion, setSuggestion] = useState<DateSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSuggestion();
  }, [suggestionId]);

  const loadSuggestion = async () => {
    setIsLoading(true);
    try {
      const found = await dateService.getSuggestionById(suggestionId);
      setSuggestion(found);
    } catch {
      // Fallback mock when not in DB yet
      setSuggestion(getMockSuggestion(suggestionId));
    } finally {
      setIsLoading(false);
    }
  };

  const getMockSuggestion = (id: string): DateSuggestion => ({
    id,
    city: 'New York',
    category: 'coffee',
    name: 'The Little Owl Café',
    address: '90 Bedford St, New York, NY 10014',
    avg_cost: '$15–25 per person',
    safety_rating: 5,
    google_maps_url: 'https://maps.google.com/?q=The+Little+Owl+Cafe+New+York',
    image_url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800',
    description: 'A cozy corner café in the West Village with excellent espresso, avocado toast, and a vibrant atmosphere perfect for a relaxed first date. Outdoor seating available in summer.',
  });

  const handleDirections = () => {
    if (!suggestion) return;
    const url = suggestion.google_maps_url
      || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(suggestion.address)}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open Maps'));
  };

  const handleShare = async () => {
    if (!suggestion) return;
    try {
      await Share.share({
        message: `🗓️ Date idea: ${suggestion.name}\n📍 ${suggestion.address}\n💰 ${suggestion.avg_cost || 'N/A'}\n\nShared via Are You The One`,
        title: `Date Idea: ${suggestion.name}`,
      });
    } catch {
      Alert.alert('Error', 'Could not share this venue');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!suggestion) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>Venue not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const meta = CATEGORY_META[suggestion.category] || CATEGORY_META.all;

  return (
    <View style={styles.container}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* ─── Hero Image ─── */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: suggestion.image_url || 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.heroGradient}
          />
          {/* Back button */}
          <SafeAreaView style={styles.topBar} edges={['top']}>
            <TouchableOpacity style={styles.backCircle} onPress={() => navigation.goBack()}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
          </SafeAreaView>

          {/* Category badge */}
          <View style={[styles.categoryBadge, { backgroundColor: meta.color }]}>
            <Text style={styles.categoryIcon}>{meta.icon}</Text>
            <Text style={styles.categoryLabel}>{meta.label}</Text>
          </View>
        </View>

        {/* ─── Main Content ─── */}
        <View style={styles.content}>
          {/* Name */}
          <Text style={styles.venueName}>{suggestion.name}</Text>

          {/* Rating */}
          {suggestion.safety_rating != null && (
            <View style={styles.ratingRow}>
              <StarRating rating={suggestion.safety_rating} />
              <Text style={styles.ratingNote}>Safety & comfort rating</Text>
            </View>
          )}

          {/* Info chips */}
          <View style={styles.infoChips}>
            <View style={styles.infoChip}>
              <Text style={styles.infoChipIcon}>📍</Text>
              <Text style={styles.infoChipText} numberOfLines={2}>{suggestion.address}</Text>
            </View>
            {suggestion.avg_cost && (
              <View style={styles.infoChip}>
                <Text style={styles.infoChipIcon}>💰</Text>
                <Text style={styles.infoChipText}>{suggestion.avg_cost}</Text>
              </View>
            )}
            <View style={styles.infoChip}>
              <Text style={styles.infoChipIcon}>🏙️</Text>
              <Text style={styles.infoChipText}>{suggestion.city}</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description */}
          {suggestion.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About this place</Text>
              <Text style={styles.description}>{suggestion.description}</Text>
            </View>
          ) : null}

          {/* Date tips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 Date Tips</Text>
            <View style={styles.tipsCard}>
              {[
                'Suggest this spot in chat to make it official',
                'Let your date know the area is safe and well-lit',
                'Arrive 5 minutes early to grab a good table',
                'Keep your first date to 1–2 hours — leave them wanting more!',
              ].map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <Text style={styles.tipBullet}>✓</Text>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Bottom spacer */}
          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* ─── Sticky Action Buttons ─── */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={[styles.actionButton, styles.directionsButton]} onPress={handleDirections}>
          <Text style={styles.actionButtonIcon}>🗺️</Text>
          <Text style={styles.directionsLabel}>Directions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.shareButton]} onPress={handleShare}>
          <Text style={styles.actionButtonIcon}>💬</Text>
          <Text style={styles.shareLabel}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  errorText: { fontSize: 18, fontFamily: FONTS.medium, color: COLORS.textSecondary, marginBottom: SPACING.md },
  backBtn: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.lg },
  backBtnText: { color: COLORS.white, fontFamily: FONTS.semiBold, fontSize: 16 },

  // Hero
  heroContainer: { height: 280, position: 'relative' },
  heroImage: { width: SCREEN_WIDTH, height: 280 },
  heroGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: SPACING.md, paddingTop: SPACING.sm },
  backCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { fontSize: 20, color: COLORS.white },
  categoryBadge: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  categoryIcon: { fontSize: 16 },
  categoryLabel: { fontSize: 13, fontFamily: FONTS.semiBold, color: COLORS.white },

  // Content
  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl },
  venueName: { fontSize: 26, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SPACING.sm },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.lg },
  ratingNote: { fontSize: 12, fontFamily: FONTS.regular, color: COLORS.textSecondary },

  // Info chips
  infoChips: { gap: SPACING.sm, marginBottom: SPACING.md },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoChipIcon: { fontSize: 18, marginTop: 1 },
  infoChipText: { flex: 1, fontSize: 14, fontFamily: FONTS.regular, color: COLORS.text, lineHeight: 20 },

  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.lg },

  // Section
  section: { marginBottom: SPACING.xl },
  sectionTitle: { fontSize: 18, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SPACING.md },
  description: { fontSize: 15, fontFamily: FONTS.regular, color: COLORS.text, lineHeight: 24 },

  // Tips
  tipsCard: {
    backgroundColor: COLORS.primary + '0D',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    gap: SPACING.sm,
  },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  tipBullet: { fontSize: 14, fontFamily: FONTS.bold, color: COLORS.primary, marginTop: 1 },
  tipText: { flex: 1, fontSize: 14, fontFamily: FONTS.regular, color: COLORS.text, lineHeight: 20 },

  // Action bar
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.lg,
    paddingBottom: 32,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: 8,
  },
  directionsButton: { backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.primary },
  shareButton: { backgroundColor: COLORS.primary },
  actionButtonIcon: { fontSize: 20 },
  directionsLabel: { fontSize: 15, fontFamily: FONTS.semiBold, color: COLORS.primary },
  shareLabel: { fontSize: 15, fontFamily: FONTS.semiBold, color: COLORS.white },
});
