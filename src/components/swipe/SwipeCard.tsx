import React, { useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, BORDER_RADIUS, SHADOWS, FONTS } from '../../utils/constants';
import { useColors } from '../../hooks/useColors';
import { Badge } from '../ui/Badge';
import type { Gender } from '../../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.62;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface SwipeCardProps {
  profile: {
    id: string;
    name: string;
    age: number;
    photos: string[];
    bio?: string;
    interests?: string[];
    distance?: number;
  };
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSuperLike?: () => void;
  isFirst?: boolean;
  userGender?: Gender;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  profile,
  onSwipeLeft,
  onSwipeRight,
  onSuperLike,
  isFirst = false,
  userGender = 'male',
}) => {
  const COLORS = useColors();
  const styles = useMemo(() => makeStyles(COLORS), [COLORS]);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);

  // Determine label based on user gender
  const likeEmoji = userGender === 'female' ? '💋' : '🌹';
  const likeLabel = userGender === 'female' ? 'KISS' : 'ROSE';
  const likeColor = userGender === 'female' ? COLORS.kiss : COLORS.rose;

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (!isFirst) return;
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotation.value = interpolate(
        event.translationX,
        [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        [-15, 0, 15],
        Extrapolate.CLAMP
      );
    })
    .onEnd((event) => {
      if (!isFirst) return;

      if (translateX.value > SWIPE_THRESHOLD) {
        translateX.value = withSpring(SCREEN_WIDTH * 1.5);
        onSwipeRight();
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5);
        onSwipeLeft();
      } else if (translateY.value < -100 && onSuperLike) {
        translateY.value = withSpring(-SCREEN_HEIGHT);
        onSuperLike();
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotation.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  // Right swipe: Rose / Kiss label
  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolate.CLAMP
    ),
  }));

  // Left swipe: Pass label
  const nopeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolate.CLAMP
    ),
  }));

  // Right swipe overlay tint
  const rightOverlay = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 0.25],
      Extrapolate.CLAMP
    ),
  }));

  // Left swipe overlay tint
  const leftOverlay = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [0.25, 0],
      Extrapolate.CLAMP
    ),
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, cardStyle]}>
        <Image
          source={{ uri: profile.photos[0] || 'https://via.placeholder.com/400x600' }}
          style={styles.image}
        />

        {/* Right swipe green tint overlay */}
        <Animated.View
          style={[styles.tintOverlay, { backgroundColor: COLORS.success }, rightOverlay]}
        />

        {/* Left swipe red tint overlay */}
        <Animated.View
          style={[styles.tintOverlay, { backgroundColor: COLORS.error }, leftOverlay]}
        />

        {/* Rose / Kiss label (right swipe) */}
        <Animated.View style={[styles.likeLabel, { borderColor: likeColor }, likeOpacity]}>
          <Text style={styles.likeLabelEmoji}>{likeEmoji}</Text>
          <Text style={[styles.likeLabelText, { color: likeColor }]}>{likeLabel}</Text>
        </Animated.View>

        {/* Pass label (left swipe) */}
        <Animated.View style={[styles.nopeLabel, nopeOpacity]}>
          <Text style={styles.nopeLabelEmoji}>❌</Text>
          <Text style={styles.nopeLabelText}>PASS</Text>
        </Animated.View>

        {/* Bottom gradient */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.75)']}
          locations={[0, 0.4, 1]}
          style={styles.gradient}
        />

        {/* Photo dots */}
        {profile.photos.length > 1 && (
          <View style={styles.dotsContainer}>
            {profile.photos.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, index === 0 && styles.dotActive]}
              />
            ))}
          </View>
        )}

        {/* Profile info */}
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.age}>{profile.age}</Text>
          </View>

          {profile.distance !== undefined && (
            <Text style={styles.distance}>📍 {profile.distance} km away</Text>
          )}

          {profile.bio && (
            <Text style={styles.bio} numberOfLines={2}>
              {profile.bio}
            </Text>
          )}

          {profile.interests && profile.interests.length > 0 && (
            <View style={styles.interestsContainer}>
              {profile.interests.slice(0, 3).map((interest, index) => (
                <Badge key={index} label={interest} variant="secondary" size="small" />
              ))}
            </View>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const makeStyles = (COLORS: any) => StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BORDER_RADIUS.xl,
    position: 'absolute',
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.xl,
    resizeMode: 'cover',
  },
  tintOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BORDER_RADIUS.xl,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
  },
  dotsContainer: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    zIndex: 5,
  },
  dot: {
    width: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    width: 20,
    backgroundColor: COLORS.white,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.sm,
  },
  name: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  age: {
    fontSize: 24,
    fontFamily: FONTS.regular,
    color: COLORS.white,
  },
  distance: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.white,
    marginTop: SPACING.xs,
    opacity: 0.85,
  },
  bio: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.white,
    marginTop: SPACING.sm,
    opacity: 0.9,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.md,
  },
  likeLabel: {
    position: 'absolute',
    top: 45,
    left: 20,
    borderWidth: 4,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    transform: [{ rotate: '-18deg' }],
    backgroundColor: 'rgba(255,255,255,0.15)',
    zIndex: 10,
  },
  likeLabelEmoji: {
    fontSize: 28,
  },
  likeLabelText: {
    fontSize: 30,
    fontFamily: FONTS.bold,
    letterSpacing: 2,
  },
  nopeLabel: {
    position: 'absolute',
    top: 45,
    right: 20,
    borderWidth: 4,
    borderColor: COLORS.error,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    transform: [{ rotate: '18deg' }],
    backgroundColor: 'rgba(255,59,48,0.15)',
    zIndex: 10,
  },
  nopeLabelEmoji: {
    fontSize: 24,
  },
  nopeLabelText: {
    fontSize: 30,
    fontFamily: FONTS.bold,
    color: COLORS.error,
    letterSpacing: 2,
  },
});

export default SwipeCard;
