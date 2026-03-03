import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MatchesStackParamList } from '@/navigation/MatchesNavigator';
import { useMatchStore } from '@/store';
import { COLORS, FONT_SIZES, SIZES } from '@/utils/constants';

type MatchListScreenProps = {
  navigation: NativeStackNavigationProp<MatchesStackParamList, 'MatchList'>;
};

export default function MatchListScreen({ navigation }: MatchListScreenProps) {
  const { matches, loadMatches, isLoading } = useMatchStore();

  useEffect(() => {
    loadMatches();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Matches</Text>
      {matches.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No matches yet</Text>
          <Text style={styles.emptySubtext}>Start swiping to find your match!</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.matchCard}
              onPress={() => navigation.navigate('Chat', { matchId: item.id })}
            >
              <View style={styles.matchInfo}>
                <Text style={styles.matchName}>
                  {item.matched_user?.first_name || 'Match'}
                </Text>
                <View style={styles.badgeContainer}>
                  <View style={[styles.badge, styles[`badge_${item.unlocked_stage}` as keyof typeof styles] as any]}>
                    <Text style={styles.badgeText}>{item.unlocked_stage?.toUpperCase()}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.lg,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.textSecondary,
    marginBottom: SIZES.sm,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  matchCard: {
    backgroundColor: COLORS.surface,
    padding: SIZES.lg,
    borderRadius: SIZES.md,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  matchName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  matchInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
  },
  badge: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    borderRadius: SIZES.sm,
    backgroundColor: COLORS.border,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  badge_text: {
    backgroundColor: COLORS.textSecondary,
  },
  badge_voice: {
    backgroundColor: COLORS.primary,
  },
  badge_video: {
    backgroundColor: COLORS.success,
  },
});
