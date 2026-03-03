import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONTS } from '../../utils/constants';
import { SwipeDeck } from '../../components/swipe';
import LottieAnimation from '../../components/ui/LottieAnimation';

const LOTTIE_URLS = {
  ROSE: 'https://assets3.lottiefiles.com/packages/lf20_96bovdur.json',
  KISS: 'https://assets10.lottiefiles.com/packages/lf20_p8qofpda.json',
  MATCH: 'https://assets1.lottiefiles.com/packages/lf20_u4y39v9m.json',
};

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
  const [showAnimation, setShowAnimation] = useState<{
    type: 'rose' | 'kiss' | 'match' | null;
    visible: boolean;
  }>({ type: null, visible: false });

  const handleSwipeLeft = (profile: any) => {
    console.log('Passed on:', profile.name);
  };

  const handleSwipeRight = (profile: any) => {
    console.log('Liked:', profile.name);
    // Determine animation based on gender (mocked logic for now)
    // Men send Roses, Women send Kisses
    const animType = Math.random() > 0.5 ? 'rose' : 'kiss';
    setShowAnimation({ type: animType, visible: true });

    // Mock match logic
    if (Math.random() > 0.7) {
      setTimeout(() => {
        setShowAnimation({ type: 'match', visible: true });
      }, 1500);
    }
  };

  const handleAnimationFinish = () => {
    setShowAnimation({ type: null, visible: false });
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

      {showAnimation.visible && showAnimation.type && (
        <View style={styles.animationOverlay}>
          <LottieAnimation
            source={{ uri: LOTTIE_URLS[showAnimation.type.toUpperCase() as keyof typeof LOTTIE_URLS] }}
            style={showAnimation.type === 'match' ? styles.matchAnimation : styles.swipeAnimation}
            onAnimationFinish={handleAnimationFinish}
            loop={showAnimation.type === 'match'}
          />
          {showAnimation.type === 'match' && (
            <View style={styles.matchTextContainer}>
              <Text style={styles.matchText}>It's a Match! 🎉</Text>
              <TouchableOpacity
                onPress={handleAnimationFinish}
                style={styles.closeMatchButton}
              >
                <Text style={styles.closeMatchText}>Keep Swiping</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
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
    zIndex: 10,
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
  animationOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  swipeAnimation: {
    width: 300,
    height: 300,
  },
  matchAnimation: {
    width: '100%',
    height: '100%',
  },
  matchTextContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
  },
  matchText: {
    fontSize: 40,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginBottom: SPACING.xl,
  },
  closeMatchButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 30,
  },
  closeMatchText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: 18,
  },
});
