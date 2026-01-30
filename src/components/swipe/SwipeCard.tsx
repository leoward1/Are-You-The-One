import React from 'react';
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
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONTS } from '../../utils/constants';
import { Badge } from '../ui/Badge';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.65;
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
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  profile,
  onSwipeLeft,
  onSwipeRight,
  onSuperLike,
  isFirst = false,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);

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

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolate.CLAMP
    ),
  }));

  const nopeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
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
        
        <Animated.View style={[styles.likeLabel, likeOpacity]}>
          <Text style={styles.likeLabelText}>LIKE</Text>
        </Animated.View>
        
        <Animated.View style={[styles.nopeLabel, nopeOpacity]}>
          <Text style={styles.nopeLabelText}>NOPE</Text>
        </Animated.View>
        
        <View style={styles.gradient} />
        
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.age}>{profile.age}</Text>
          </View>
          
          {profile.distance && (
            <Text style={styles.distance}>{profile.distance} km away</Text>
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

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BORDER_RADIUS.xl,
    position: 'absolute',
    ...SHADOWS.large,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.xl,
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
    backgroundColor: 'rgba(0,0,0,0.4)',
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
    opacity: 0.8,
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
    top: 50,
    left: 20,
    borderWidth: 4,
    borderColor: COLORS.success,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    transform: [{ rotate: '-20deg' }],
  },
  likeLabelText: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: COLORS.success,
  },
  nopeLabel: {
    position: 'absolute',
    top: 50,
    right: 20,
    borderWidth: 4,
    borderColor: COLORS.error,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    transform: [{ rotate: '20deg' }],
  },
  nopeLabelText: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: COLORS.error,
  },
});

export default SwipeCard;
