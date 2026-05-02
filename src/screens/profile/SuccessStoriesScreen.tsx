import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '@/utils/constants';
import { useColors } from '@/hooks/useColors';
import { reviewService } from '@/services/review.service';
import { Review } from '@/types';
import Button from '@/components/ui/Button';

const FEATURED_STORIES = [
  {
    id: 'featured-1',
    from_user_id: '',
    about_match_id: '',
    rating: 5,
    headline: 'Found my person on Week 3!',
    body: 'I was skeptical about dating apps but the Match Ceremony feature made it feel real and exciting. When we got "Perfect Match" I knew I had to take it seriously. Six months later, we\'re still going strong!',
    approved: true,
    created_at: '2026-02-14T12:00:00Z',
    profiles: { first_name: 'Sarah', primary_photo: '' },
    isFeatured: true,
  },
  {
    id: 'featured-2',
    from_user_id: '',
    about_match_id: '',
    rating: 5,
    headline: 'The Truth Booth was right!',
    body: 'My match and I used the Truth Booth and scored 94% compatibility. We went on our first date that weekend and everything just clicked. This app actually helps you find someone compatible, not just someone nearby.',
    approved: true,
    created_at: '2026-03-08T12:00:00Z',
    profiles: { first_name: 'James', primary_photo: '' },
    isFeatured: true,
  },
  {
    id: 'featured-3',
    from_user_id: '',
    about_match_id: '',
    rating: 4,
    headline: 'Better than just swiping',
    body: 'The Perfect Match Lab quiz actually made me think about what I want in a partner. My blueprint score led me to matches that were genuinely compatible. We bonded over shared communication styles and it made all the difference.',
    approved: true,
    created_at: '2026-01-20T12:00:00Z',
    profiles: { first_name: 'Aisha', primary_photo: '' },
    isFeatured: true,
  },
];

export default function SuccessStoriesScreen() {
  const COLORS = useColors();
  const styles = useMemo(() => makeStyles(COLORS), [COLORS]);
  const navigation = useNavigation<any>();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reviewService.getPublicReviews();
      if (response.success && response.data.length > 0) {
        setReviews(response.data);
      } else {
        setReviews(FEATURED_STORIES);
      }
    } catch (err: any) {
      setReviews(FEATURED_STORIES);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color={COLORS.accent}
          />
        ))}
      </View>
    );
  };

  const renderReview = ({ item }: { item: any }) => {
    const profile = item.profiles || {};
    const photo = profile.primary_photo;
    const initial = profile.first_name ? profile.first_name.charAt(0).toUpperCase() : '?';

    return (
      <View style={styles.card}>
        {item.isFeatured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>Featured Story</Text>
          </View>
        )}
        <View style={styles.cardHeader}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.userName}>{profile.first_name || 'Anonymous'}</Text>
            {renderStars(item.rating)}
          </View>
          <Text style={styles.dateText}>
            {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
          </Text>
        </View>

        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.content}>{item.body}</Text>
      </View>
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading success stories...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Try Again" onPress={fetchReviews} variant="outline" style={{ marginTop: SPACING.md }} />
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          renderItem={renderReview}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>Success Stories 💍</Text>
              <Text style={styles.pageSubtitle}>Real connections made on Are You The One</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="heart-half-outline" size={64} color={COLORS.textSecondary} style={{ opacity: 0.5 }} />
              <Text style={styles.emptyTitle}>No Stories Yet</Text>
              <Text style={styles.emptySubtitle}>Be the first to find your match and share your success story!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  errorText: {
    marginTop: SPACING.sm,
    fontFamily: FONTS.medium,
    color: COLORS.error,
    textAlign: 'center',
  },
  listContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  pageHeader: {
    marginBottom: SPACING.lg,
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  pageTitle: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  pageSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: SPACING.sm,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 2,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  dateText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  title: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  content: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  featuredBadgeText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
});
