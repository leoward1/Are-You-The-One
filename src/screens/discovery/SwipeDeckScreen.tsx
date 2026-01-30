import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONTS } from '../../utils/constants';
import { SwipeDeck } from '../../components/swipe';

const MOCK_PROFILES = [
  {
    id: '1',
    name: 'Sarah',
    age: 28,
    photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'],
    bio: 'Love hiking, coffee, and good conversations',
    interests: ['Hiking', 'Photography', 'Coffee'],
    distance: 5,
  },
  {
    id: '2',
    name: 'Emma',
    age: 26,
    photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'],
    bio: 'Artist by day, foodie by night',
    interests: ['Art', 'Cooking', 'Travel'],
    distance: 8,
  },
  {
    id: '3',
    name: 'Jessica',
    age: 30,
    photos: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400'],
    bio: 'Yoga instructor looking for my zen partner',
    interests: ['Yoga', 'Meditation', 'Fitness'],
    distance: 3,
  },
];

export default function SwipeDeckScreen() {
  const [profiles, setProfiles] = useState(MOCK_PROFILES);
  const [isLoading, setIsLoading] = useState(false);

  const handleSwipeLeft = (profile: any) => {
    console.log('Passed on:', profile.name);
  };

  const handleSwipeRight = (profile: any) => {
    console.log('Liked:', profile.name);
  };

  const handleSuperLike = (profile: any) => {
    console.log('Super liked:', profile.name);
  };

  const handleRefresh = () => {
    setProfiles(MOCK_PROFILES);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Finding matches...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.logo}>💕</Text>
        <Text style={styles.title}>Discover</Text>
        <View style={styles.headerRight} />
      </View>

      <SwipeDeck
        profiles={profiles}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        onSuperLike={handleSuperLike}
        onEmpty={handleRefresh}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  logo: {
    fontSize: 28,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  headerRight: {
    width: 28,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
});
