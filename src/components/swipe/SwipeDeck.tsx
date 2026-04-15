import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SPACING, FONTS, SHADOWS, BORDER_RADIUS } from '../../utils/constants';
import { useColors } from '../../hooks/useColors';
import { SwipeCard } from './SwipeCard';
import type { Gender } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Profile {
  id: string;
  name: string;
  age: number;
  photos: string[];
  bio?: string;
  interests?: string[];
  distance?: number;
}

interface SwipeDeckProps {
  profiles: Profile[];
  onSwipeLeft: (profile: Profile) => void;
  onSwipeRight: (profile: Profile) => void;
  onSuperLike?: (profile: Profile) => void;
  onEmpty?: () => void;
  userGender?: Gender;
}

export const SwipeDeck: React.FC<SwipeDeckProps> = ({
  profiles,
  onSwipeLeft,
  onSwipeRight,
  onSuperLike,
  onEmpty,
  userGender = 'male',
}) => {
  const COLORS = useColors();
  const styles = useMemo(() => makeStyles(COLORS), [COLORS]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipeLeft = useCallback(() => {
    if (currentIndex < profiles.length) {
      onSwipeLeft(profiles[currentIndex]);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, profiles, onSwipeLeft]);

  const handleSwipeRight = useCallback(() => {
    if (currentIndex < profiles.length) {
      onSwipeRight(profiles[currentIndex]);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, profiles, onSwipeRight]);

  const handleSuperLike = useCallback(() => {
    if (currentIndex < profiles.length && onSuperLike) {
      onSuperLike(profiles[currentIndex]);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, profiles, onSuperLike]);

  const handleButtonPress = (action: 'left' | 'right') => {
    switch (action) {
      case 'left':
        handleSwipeLeft();
        break;
      case 'right':
        handleSwipeRight();
        break;
    }
  };

  // Determine right-swipe button label based on user gender
  const rightButtonEmoji = userGender === 'female' ? '💋' : '🌹';
  const rightButtonLabel = userGender === 'female' ? 'Kiss' : 'Rose';
  const rightButtonColor = userGender === 'female' ? COLORS.kiss : COLORS.rose;

  if (currentIndex >= profiles.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>💔</Text>
        <Text style={styles.emptyTitle}>No more profiles</Text>
        <Text style={styles.emptySubtitle}>
          Check back later for new matches in your area
        </Text>
        {onEmpty && (
          <TouchableOpacity style={styles.refreshButton} onPress={onEmpty}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cardsContainer}>
        {profiles
          .slice(currentIndex, currentIndex + 3)
          .reverse()
          .map((profile, index, arr) => {
            const isTop = index === arr.length - 1;
            // Back cards: slightly scaled down and offset upward so they peek behind the top card
            const stackScale = isTop ? 1 : 1 - (arr.length - 1 - index) * 0.04;
            const stackY = isTop ? 0 : (arr.length - 1 - index) * -10;
            return (
              <SwipeCard
                key={profile.id}
                profile={profile}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                onSuperLike={handleSuperLike}
                isFirst={isTop}
                userGender={userGender}
                stackScale={stackScale}
                stackY={stackY}
              />
            );
          })}
      </View>

      <View style={styles.buttonsContainer}>
        {/* Pass button */}
        <TouchableOpacity
          style={[styles.button, styles.passButton]}
          onPress={() => handleButtonPress('left')}
          activeOpacity={0.7}
        >
          <Text style={styles.passIcon}>✕</Text>
        </TouchableOpacity>

        {/* Rose / Kiss button */}
        <TouchableOpacity
          style={[styles.button, styles.likeButton, { backgroundColor: rightButtonColor }]}
          onPress={() => handleButtonPress('right')}
          activeOpacity={0.7}
        >
          <Text style={styles.likeIcon}>{rightButtonEmoji}</Text>
          <Text style={styles.likeLabel}>{rightButtonLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const makeStyles = (COLORS: any) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: SCREEN_WIDTH,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.xl,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  passButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.white,
    borderWidth: 2.5,
    borderColor: COLORS.error,
  },
  passIcon: {
    fontSize: 28,
    color: COLORS.error,
    fontFamily: FONTS.bold,
  },
  likeButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    flexDirection: 'column',
    gap: 2,
  },
  likeIcon: {
    fontSize: 26,
  },
  likeLabel: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  refreshButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.full,
  },
  refreshButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
});

export default SwipeDeck;
