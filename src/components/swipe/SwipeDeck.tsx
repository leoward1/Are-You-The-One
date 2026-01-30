import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { COLORS, SPACING, FONTS, SHADOWS, BORDER_RADIUS } from '../../utils/constants';
import { SwipeCard } from './SwipeCard';

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
}

export const SwipeDeck: React.FC<SwipeDeckProps> = ({
  profiles,
  onSwipeLeft,
  onSwipeRight,
  onSuperLike,
  onEmpty,
}) => {
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

  const handleButtonPress = (action: 'left' | 'right' | 'super') => {
    switch (action) {
      case 'left':
        handleSwipeLeft();
        break;
      case 'right':
        handleSwipeRight();
        break;
      case 'super':
        handleSuperLike();
        break;
    }
  };

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
          .map((profile, index, arr) => (
            <SwipeCard
              key={profile.id}
              profile={profile}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              onSuperLike={handleSuperLike}
              isFirst={index === arr.length - 1}
            />
          ))}
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.passButton]}
          onPress={() => handleButtonPress('left')}
        >
          <Text style={styles.buttonIcon}>✕</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.superLikeButton]}
          onPress={() => handleButtonPress('super')}
        >
          <Text style={styles.buttonIcon}>⭐</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.likeButton]}
          onPress={() => handleButtonPress('right')}
        >
          <Text style={styles.buttonIcon}>❤️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    gap: SPACING.lg,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  passButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.error,
  },
  superLikeButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.info,
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  likeButton: {
    backgroundColor: COLORS.primary,
  },
  buttonIcon: {
    fontSize: 24,
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
    borderRadius: BORDER_RADIUS.lg,
  },
  refreshButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
});

export default SwipeDeck;
