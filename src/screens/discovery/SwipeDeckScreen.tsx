import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONTS } from '../../utils/constants';
import { SwipeDeck, SwipeAnimationOverlay } from '../../components/swipe';
import type { SwipeAnimationType } from '../../components/swipe';
import { useAuthStore } from '../../store/useAuthStore';
import type { Gender } from '../../types';

const MOCK_PROFILES = [
  {
    id: '1',
    name: 'Sarah',
    age: 28,
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    ],
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
  {
    id: '4',
    name: 'Sophia',
    age: 27,
    photos: ['https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400'],
    bio: 'Music lover. Let\'s go to a concert together!',
    interests: ['Music', 'Dancing', 'Movies'],
    distance: 12,
  },
];

export default function SwipeDeckScreen() {
  const [profiles, setProfiles] = useState(MOCK_PROFILES);
  const [animation, setAnimation] = useState<{
    type: SwipeAnimationType;
    visible: boolean;
    matchedName?: string;
  }>({ type: null, visible: false });

  // Get user gender from auth store (fallback to 'male' for mock)
  const user = useAuthStore((state) => state.user);
  const userGender: Gender = user?.gender || 'male';

  // Determine the like animation based on user's gender
  const likeAnimationType: SwipeAnimationType = userGender === 'female' ? 'kiss' : 'rose';

  const handleSwipeLeft = (profile: any) => {
    console.log('Passed on:', profile.name);
    // Show brief pass animation
    setAnimation({ type: 'pass', visible: true });
  };

  const handleSwipeRight = (profile: any) => {
    console.log(
      userGender === 'female' ? 'Kissed:' : 'Sent rose to:',
      profile.name
    );

    // Show rose or kiss animation
    setAnimation({ type: likeAnimationType, visible: true });

    // Mock match logic — 30% chance of mutual match
    if (Math.random() > 0.7) {
      // Delay the match popup until after the like animation finishes
      setTimeout(() => {
        setAnimation({
          type: 'match',
          visible: true,
          matchedName: profile.name,
        });
      }, 2600);
    }
  };

  const handleAnimationFinish = () => {
    setAnimation({ type: null, visible: false });
  };

  const handleRefresh = () => {
    setProfiles(MOCK_PROFILES);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>💕</Text>
        <Text style={styles.title}>Discover</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Swipe Deck */}
      <SwipeDeck
        profiles={profiles}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        onEmpty={handleRefresh}
        userGender={userGender}
      />

      {/* Animation Overlay */}
      <SwipeAnimationOverlay
        type={animation.type}
        visible={animation.visible}
        onFinish={handleAnimationFinish}
        matchedUserName={animation.matchedName}
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
    paddingVertical: SPACING.sm,
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
});
