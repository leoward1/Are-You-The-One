import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '@/utils/constants';
import { reviewService } from '@/services/review.service';
import { Review } from '@/types';
import Button from '@/components/ui/Button';

export default function SuccessStoriesScreen() {
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
      if (response.success) {
        setReviews(response.data);
      } else {
        setError(response.message || 'Failed to load success stories');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
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

const styles = StyleSheet.create({
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
});
