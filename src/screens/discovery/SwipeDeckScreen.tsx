import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONTS } from '../../utils/constants';
import { SwipeDeck, SwipeAnimationOverlay } from '../../components/swipe';
import type { SwipeAnimationType } from '../../components/swipe';
import { useAuthStore } from '../../store/useAuthStore';
import { matchService } from '../../services/match.service';
import type { Gender, Profile } from '../../types';

export default function SwipeDeckScreen() {
  const user = useAuthStore((state) => state.user);
  const userGender: Gender = user?.gender || 'male';
  const likeAnimationType: SwipeAnimationType = userGender === 'female' ? 'kiss' : 'rose';

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [animation, setAnimation] = useState<{
    type: SwipeAnimationType;
    visible: boolean;
    matchedName?: string;
  }>({ type: null, visible: false });

  // FIX: Load real profiles from Supabase
  const loadProfiles = useCallback(async (reset = false) => {
    if (!hasMore && !reset) return;
    try {
      setIsLoading(true);
      const currentOffset = reset ? 0 : offset;
      const response = await matchService.getDiscoveryProfiles(10, currentOffset);
      const newProfiles = response.profiles || [];

      if (reset) {
        setProfiles(newProfiles);
        setOffset(newProfiles.length);
      } else {
        setProfiles(prev => [...prev, ...newProfiles]);
        setOffset(prev => prev + newProfiles.length);
      }
      setHasMore(response.has_more);
    } catch (error) {
      console.error('Error loading profiles:', error);
      setProfiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [offset, hasMore]);

  useEffect(() => {
    loadProfiles(true);
  }, []);

  // FIX: Real like written to Supabase likes table
  const handleSwipeLeft = useCallback(async (profile: Profile) => {
    setAnimation({ type: 'pass', visible: true });
    try {
      await matchService.sendPass(profile.id);
    } catch (error) {
      console.error('Error sending pass:', error);
    }
  }, []);

  // FIX: Real rose/kiss written to Supabase, real mutual match detection
  const handleSwipeRight = useCallback(async (profile: Profile) => {
    setAnimation({ type: likeAnimationType, visible: true });
    try {
      const likeType = userGender === 'female' ? 'kiss' : 'rose';
      const result = await matchService.sendLike(profile.id, likeType);

      // Real mutual match detected from Supabase
      if (result.is_mutual_match) {
        setTimeout(() => {
          setAnimation({
            type: 'match',
            visible: true,
            matchedName: profile.first_name || 'User',
          });
        }, 2600);
      }
    } catch (error) {
      console.error('Error sending like:', error);
    }
  }, [userGender, likeAnimationType]);

  const handleAnimationFinish = () => {
    setAnimation({ type: null, visible: false });
  };

  // FIX: Reset currentIndex by reloading fresh profiles from Supabase
  const handleEmpty = () => {
    loadProfiles(true);
  };

  // FIX: Load more profiles when deck is running low
  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      loadProfiles(false);
    }
  };

  if (isLoading && profiles.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.logo}>💕</Text>
          <Text style={styles.title}>Discover</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Finding people near you...</Text>
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

      {/* FIX: Pass formatted profiles — handle both real DB shape and legacy shape */}
      <SwipeDeck
        profiles={profiles.map(p => ({
          id: p.id,
          name: p.first_name || 'User',
          age: p.age || 25,
          photos: p.photos?.map((ph: any) => typeof ph === 'string' ? ph : ph.url).filter(Boolean) || [],
          bio: p.bio || '',
          interests: p.interests || [],
          distance: p.distance_miles || 0,
        }))}
        onSwipeLeft={(p) => handleSwipeLeft(profiles.find(orig => orig.id === p.id)!)}
        onSwipeRight={(p) => handleSwipeRight(profiles.find(orig => orig.id === p.id)!)}
        onEmpty={handleEmpty}
        userGender={userGender}
      />

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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
});

