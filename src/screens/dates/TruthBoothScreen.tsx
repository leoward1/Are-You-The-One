import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '../../hooks/useColors';
import { FONTS, SPACING, BORDER_RADIUS } from '../../utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../config/supabase';

interface PotentialMatch {
  id: string;
  name: string;
  photo?: string;
  compatibility: number;
  usedTruthBooth: boolean;
}

export default function TruthBoothScreen({ navigation }: any) {
  const theme = useColors();
  const { user } = useAuthStore();
  const [potentialMatches, setPotentialMatches] = useState<PotentialMatch[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<PotentialMatch | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [weeklyUsesLeft, setWeeklyUsesLeft] = useState(1);
  const pulseAnim = new Animated.Value(0);

  useEffect(() => {
    fetchPotentialMatches();
    checkWeeklyUsesLeft();
  }, []);

  useEffect(() => {
    if (isRevealing) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsRevealing(false);
        setRevealed(true);
      });
    }
  }, [isRevealing]);

  const fetchPotentialMatches = async () => {
    // Fetch user's matches who haven't used Truth Booth this week
    const { data: matches } = await supabase
      .from('matches')
      .select(`
        id,
        user_a_id,
        user_b_id,
        user_a:profiles!user_a_id(id, first_name, last_name, photo_url),
        user_b:profiles!user_b_id(id, first_name, last_name, photo_url)
      `)
      .or(`user_a_id.eq.${user?.id},user_b_id.eq.${user?.id}`)
      .eq('status', 'matched');

    if (matches) {
      const formatted = matches.map((m: any) => {
        const isUserA = m.user_a_id === user?.id;
        const otherUser = isUserA ? m.user_b : m.user_a;
        return {
          id: m.id,
          name: `${otherUser.first_name} ${otherUser.last_name}`,
          photo: otherUser.photo_url,
          compatibility: Math.floor(Math.random() * 40) + 60, // 60-100% simulated
          usedTruthBooth: false, // Would check from truth_booth_uses table
        };
      });
      setPotentialMatches(formatted);
    }
  };

  const checkWeeklyUsesLeft = async () => {
    if (!user?.id) return;
    const { data: uses, error } = await supabase
      .from('truth_booth_uses')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', getWeekStartDate())
      .limit(1);

    if (error) {
      setWeeklyUsesLeft(1);
      return;
    }

    setWeeklyUsesLeft(Math.max(0, 1 - (uses?.length || 0)));
  };

  const getWeekStartDate = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff)).toISOString();
  };

  const enterTruthBooth = () => {
    if (!selectedMatch || weeklyUsesLeft <= 0) return;
    setIsRevealing(true);
    setRevealed(false);
    pulseAnim.setValue(0);
  };

  const getCompatibilityMessage = (score: number) => {
    if (score >= 95) return "You're soulmates! 💯";
    if (score >= 85) return "Strong connection! 💕";
    if (score >= 75) return "Good chemistry! 💜";
    if (score >= 65) return "Possible match! 🤔";
    return "Maybe not a perfect match... 💔";
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 85) return '#00ff00';
    if (score >= 70) return '#9aff00';
    if (score >= 60) return '#ffcc00';
    return '#ff4444';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Truth Booth
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Truth Booth Header */}
        <View style={styles.boothHeader}>
          <Text style={[styles.boothEmoji, { color: theme.primary }]}>🔍</Text>
          <Text style={[styles.boothTitle, { color: theme.text }]}>
            The Truth Booth
          </Text>
          <Text style={[styles.boothSubtitle, { color: theme.textSecondary }]}>
            Find out your true compatibility. Use wisely — only once per week!
          </Text>
        </View>

        {/* Uses Left Indicator */}
        <View style={[styles.usesContainer, { backgroundColor: theme.surface }]}>
          <Text style={[styles.usesLabel, { color: theme.textSecondary }]}>
            Weekly Uses Remaining
          </Text>
          <View style={styles.usesDots}>
            {[...Array(1)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.useDot,
                  {
                    backgroundColor: i < weeklyUsesLeft ? theme.primary : theme.border,
                  },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.usesText, { color: theme.text }]}>
            {weeklyUsesLeft > 0 ? '1 use available this week' : 'No uses left — check back Monday'}
          </Text>
        </View>

        {/* Match Selection */}
        {!selectedMatch ? (
          <View style={styles.selectionContainer}>
            <Text style={[styles.selectionTitle, { color: theme.text }]}>
              Choose a Match to Test
            </Text>
            
            {potentialMatches.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  You don't have any matches yet. Go to Discover and find your potential perfect match!
                </Text>
                <TouchableOpacity
                  style={[styles.discoverButton, { backgroundColor: theme.primary }]}
                  onPress={() => navigation.navigate('DiscoveryTab')}
                >
                  <Text style={styles.discoverButtonText}>Go to Discover</Text>
                </TouchableOpacity>
              </View>
            ) : (
              potentialMatches.map((match) => (
                <TouchableOpacity
                  key={match.id}
                  style={[styles.matchCard, { backgroundColor: theme.surface }]}
                  onPress={() => setSelectedMatch(match)}
                >
                  <View style={styles.matchAvatar}>
                    <Text style={[styles.matchAvatarText, { color: theme.text }]}>
                      {match.name.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.matchInfo}>
                    <Text style={[styles.matchName, { color: theme.text }]}>
                      {match.name}
                    </Text>
                    <Text style={[styles.matchHint, { color: theme.textSecondary }]}>
                      Tap to enter Truth Booth
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : (
          /* Truth Booth Reveal */
          <View style={styles.revealContainer}>
            {!revealed ? (
              <>
                <Text style={[styles.revealTitle, { color: theme.text }]}>
                  Testing compatibility with
                </Text>
                <Text style={[styles.revealName, { color: theme.primary }]}>
                  {selectedMatch.name}
                </Text>

                {/* Animated Booth */}
                <Animated.View
                  style={[
                    styles.boothCircle,
                    {
                      transform: [
                        {
                          scale: pulseAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.2],
                          }),
                        },
                      ],
                      backgroundColor: pulseAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [theme.surface, theme.primary, theme.surface],
                      }),
                    },
                  ]}
                >
                  <Text style={styles.boothIcon}>🔍</Text>
                </Animated.View>

                <Text style={[styles.scanningText, { color: theme.textSecondary }]}>
                  {isRevealing ? 'Analyzing compatibility...' : 'Ready to reveal'}
                </Text>

                {!isRevealing && (
                  <TouchableOpacity
                    style={[
                      styles.revealButton,
                      {
                        backgroundColor: weeklyUsesLeft > 0 ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={enterTruthBooth}
                    disabled={weeklyUsesLeft <= 0}
                  >
                    <Text style={styles.revealButtonText}>
                      {weeklyUsesLeft > 0 ? 'Enter Truth Booth' : 'No Uses Left'}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.backLink}
                  onPress={() => {
                    setSelectedMatch(null);
                    setRevealed(false);
                  }}
                >
                  <Text style={[styles.backLinkText, { color: theme.textSecondary }]}>
                    Choose a different match
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              /* Result */
              <>
                <Text style={[styles.resultTitle, { color: theme.text }]}>
                  Compatibility Result
                </Text>

                <View style={styles.resultCircle}>
                  <Animated.Text
                    style={[
                      styles.resultPercentage,
                      {
                        color: getCompatibilityColor(selectedMatch.compatibility),
                        transform: [
                          {
                            scale: pulseAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.5, 1],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    {selectedMatch.compatibility}%
                  </Animated.Text>
                </View>

                <Text
                  style={[
                    styles.resultMessage,
                    { color: getCompatibilityColor(selectedMatch.compatibility) },
                  ]}
                >
                  {getCompatibilityMessage(selectedMatch.compatibility)}
                </Text>

                <View style={[styles.resultCard, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.resultCardTitle, { color: theme.text }]}>
                    What This Means
                  </Text>
                  <Text style={[styles.resultCardText, { color: theme.textSecondary }]}>
                    {selectedMatch.compatibility >= 85
                      ? 'You and ' + selectedMatch.name + ' have excellent compatibility! This could be your perfect match. Consider taking them on a date!'
                      : selectedMatch.compatibility >= 70
                      ? 'There\'s definitely something between you two. Keep exploring your connection.'
                      : 'The compatibility is lower, but don\'t give up! Sometimes the best matches are unexpected.'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.doneButton, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    setSelectedMatch(null);
                    setRevealed(false);
                    setWeeklyUsesLeft(0);
                  }}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* Info Section */}
        <View style={[styles.infoContainer, { backgroundColor: theme.surface }]}>
          <Text style={[styles.infoTitle, { color: theme.text }]}>
            How Truth Booth Works
          </Text>
          <View style={styles.infoItem}>
            <Text style={[styles.infoNumber, { color: theme.primary }]}>1</Text>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              Select one of your matches to test
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoNumber, { color: theme.primary }]}>2</Text>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              Enter the Truth Booth (1 use per week)
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoNumber, { color: theme.primary }]}>3</Text>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              See your true compatibility percentage
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoNumber, { color: theme.primary }]}>4</Text>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              Use wisely to find your Perfect Match!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  boothHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  boothEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  boothTitle: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  boothSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
  usesContainer: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  usesLabel: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    marginBottom: SPACING.sm,
  },
  usesDots: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  useDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  usesText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  selectionContainer: {
    marginBottom: SPACING.xl,
  },
  selectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.md,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  discoverButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
  },
  discoverButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  matchAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  matchAvatarText: {
    fontSize: 20,
    fontFamily: FONTS.bold,
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    marginBottom: 2,
  },
  matchHint: {
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  revealContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  revealTitle: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    marginBottom: SPACING.sm,
  },
  revealName: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.xl,
  },
  boothCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  boothIcon: {
    fontSize: 48,
  },
  scanningText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    marginBottom: SPACING.lg,
  },
  revealButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  revealButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  backLink: {
    padding: SPACING.sm,
  },
  backLinkText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  resultTitle: {
    fontSize: 18,
    fontFamily: FONTS.medium,
    marginBottom: SPACING.lg,
  },
  resultCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 8,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  resultPercentage: {
    fontSize: 48,
    fontFamily: FONTS.bold,
  },
  resultMessage: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  resultCard: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    width: '100%',
  },
  resultCardTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.sm,
  },
  resultCardText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  doneButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  infoContainer: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  infoNumber: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    textAlign: 'center',
    lineHeight: 28,
    marginRight: SPACING.md,
  },
  infoText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    flex: 1,
  },
});
