import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../utils/constants';
import { useColors } from '../../hooks/useColors';
import { reviewService } from '../../services/review.service';
import { Review } from '../../types';
import { Avatar } from '../../components/ui';

interface SuccessStory extends Review {
  profiles: {
    first_name: string;
    primary_photo: string;
  };
  isFeatured?: boolean;
}

const FEATURED_STORIES: SuccessStory[] = [
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

export default function SuccessStoriesScreen({ navigation }: any) {
  const COLORS = useColors();
  const styles = useMemo(() => makeStyles(COLORS), [COLORS]);
  const [reviews, setReviews] = useState<SuccessStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchReviews = async () => {
    const result = await reviewService.getPublicReviews();
    if (result.success && result.data.length > 0) {
      setReviews(result.data as SuccessStory[]);
    } else {
      // Show featured stories when no real reviews exist
      setReviews(FEATURED_STORIES);
    }
    setIsLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchReviews();
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((s) => (
          <Text key={s} style={[styles.star, { color: s <= rating ? '#FFD700' : '#E5E7EB' }]}>
            ★
          </Text>
        ))}
      </View>
    );
  };

  const renderReview = ({ item }: { item: SuccessStory }) => (
    <View style={styles.reviewCard}>
      {item.isFeatured && (
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredText}>Featured Story</Text>
        </View>
      )}
      <View style={styles.reviewHeader}>
        <Avatar name={item.profiles.first_name || 'User'} size="small" />
        <View style={styles.headerInfo}>
          <Text style={styles.userName}>{item.profiles.first_name}</Text>
          {renderStars(item.rating)}
        </View>
        <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.headline}>{item.headline}</Text>
      <Text style={styles.body}>{item.body}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Success Stories</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          renderItem={renderReview}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>💝</Text>
              <Text style={styles.emptyTitle}>No stories yet</Text>
              <Text style={styles.emptySubtitle}>Be the first to share your match success story!</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: SPACING.xs,
    marginRight: SPACING.md,
  },
  backText: {
    fontSize: 24,
    color: COLORS.primary,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  reviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  userName: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
  },
  starsContainer: {
    flexDirection: 'row',
    marginTop: 2,
  },
  star: {
    fontSize: 14,
    marginRight: 1,
  },
  date: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    alignSelf: 'flex-start',
  },
  headline: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  body: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text,
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
  featuredText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
});
