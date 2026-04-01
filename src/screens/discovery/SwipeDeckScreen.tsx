import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONTS } from '../../utils/constants';
import { SwipeDeck, SwipeAnimationOverlay } from '../../components/swipe';
import type { SwipeAnimationType } from '../../components/swipe';
import { useAuthStore } from '../../store/useAuthStore';
import { matchService } from '../../services/match.service';
import { analyticsService } from '../../services/analytics.service';
import type { Gender, Profile } from '../../types';

export default function SwipeDeckScreen({ navigation }: any) {
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

  // SECURITY: Throttle swipe actions to prevent spam
  const swipeLockRef = useRef(false);

  const handleSwipeLeft = useCallback(async (profile: Profile) => {
    if (swipeLockRef.current) return;
    swipeLockRef.current = true;
    setAnimation({ type: 'pass', visible: true });
    try {
      await matchService.sendPass(profile.id);
      analyticsService.track('swipe_left', { user_id: profile.id });
    } catch (error) {
      console.error('Error sending pass:', error);
    } finally {
      setTimeout(() => { swipeLockRef.current = false; }, 800);
    }
  }, []);

  const handleSwipeRight = useCallback(async (profile: Profile) => {
    if (swipeLockRef.current) return;
    swipeLockRef.current = true;
    setAnimation({ type: likeAnimationType, visible: true });
    try {
      const likeType = userGender === 'female' ? 'kiss' : 'rose';
      const result = await matchService.sendLike(profile.id, likeType);

      // Real mutual match detected from Supabase
      if (result.is_mutual_match) {
        analyticsService.track('mutual_match_created', { match_id: profile.id });
        setTimeout(() => {
          setAnimation({
            type: 'match',
            visible: true,
            matchedName: profile.first_name || 'User',
          });
        }, 2600);
      } else {
        analyticsService.track(likeType === 'rose' ? 'swipe_right_rose' : 'swipe_right_kiss', { user_id: profile.id });
      }
    } catch (error) {
      console.error('Error sending like:', error);
    } finally {
      setTimeout(() => { swipeLockRef.current = false; }, 800);
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
          <TouchableOpacity onPress={() => navigation.navigate('SuccessStories')}>
            <Text style={styles.headerEmoji}>💝</Text>
          </TouchableOpacity>
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
        <TouchableOpacity onPress={() => navigation.navigate('SuccessStories')}>
          <Text style={styles.headerEmoji}>💝</Text>
        </TouchableOpacity>
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
  headerEmoji: {
    fontSize: 24,
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

