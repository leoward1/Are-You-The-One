import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '../../hooks/useColors';
import { FONTS, SPACING, BORDER_RADIUS } from '../../utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../config/supabase';

interface Couple {
  id: string;
  userA: { id: string; name: string; photo?: string };
  userB: { id: string; name: string; photo?: string };
  isPerfectMatch: boolean;
}

export default function MatchCeremonyScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const theme = useColors();
  const [currentMatch, setCurrentMatch] = useState<Couple | null>(null);
  const [revealedMatches, setRevealedMatches] = useState<Couple[]>([]);
  const [isRevealing, setIsRevealing] = useState(false);
  const [lightsOn, setLightsOn] = useState(false);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchCeremonyData();
  }, []);

  useEffect(() => {
    if (isRevealing) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(1500),
      ]).start(() => {
        setLightsOn(true);
        setIsRevealing(false);
      });
    }
  }, [isRevealing]);

  const fetchCeremonyData = async () => {
    if (!user?.id) return;

    const { data: matches, error } = await supabase
      .from('matches')
      .select('id, user_a_id, user_b_id')
      .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
      .eq('status', 'matched')
      .limit(10);

    if (error) {
      Alert.alert('Unable to load ceremony', 'Please try again in a moment.');
      return;
    }

    const profileIds = Array.from(
      new Set((matches || []).flatMap((m: any) => [m.user_a_id, m.user_b_id]))
    );

    const { data: profiles } = profileIds.length
      ? await supabase
          .from('profiles')
          .select('id, first_name, last_name, photo_url')
          .in('id', profileIds)
      : { data: [] };

    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
    const formatted = (matches || [])
      .map((m: any, idx: number) => {
        const userA = profileMap.get(m.user_a_id);
        const userB = profileMap.get(m.user_b_id);
        if (!userA || !userB) return null;

        return {
          id: m.id,
          userA: {
            id: userA.id,
            name: `${userA.first_name || ''} ${userA.last_name || ''}`.trim() || 'User A',
            photo: userA.photo_url,
          },
          userB: {
            id: userB.id,
            name: `${userB.first_name || ''} ${userB.last_name || ''}`.trim() || 'User B',
            photo: userB.photo_url,
          },
          isPerfectMatch: idx % 3 === 0,
        } as Couple;
      })
      .filter(Boolean) as Couple[];

    setRevealedMatches(formatted);
  };

  const getCurrentWeek = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.floor(diff / oneWeek) + 1;
  };

  const startCeremony = () => {
    if (revealedMatches.length === 0) return;
    setCurrentMatch(revealedMatches[0]);
    setIsRevealing(true);
    setLightsOn(false);
    pulseAnim.setValue(0);
  };

  const getNextMatch = () => {
    const currentIndex = revealedMatches.findIndex(m => m.id === currentMatch?.id);
    if (currentIndex < revealedMatches.length - 1) {
      setCurrentMatch(revealedMatches[currentIndex + 1]);
      setLightsOn(false);
      pulseAnim.setValue(0);
      setTimeout(() => setIsRevealing(true), 500);
    }
  };

  const isUsersMatch = currentMatch && 
    (currentMatch.userA.id === user?.id || currentMatch.userB.id === user?.id);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Match Ceremony
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Ceremony Title */}
        <View style={styles.ceremonyHeader}>
          <Text style={[styles.ceremonyEmoji, { color: theme.primary }]}>💡</Text>
          <Text style={[styles.ceremonyTitle, { color: theme.text }]}>
            Week {getCurrentWeek()} Ceremony
          </Text>
          <Text style={[styles.ceremonySubtitle, { color: theme.textSecondary }]}>
            Find out if you're a Perfect Match
          </Text>
        </View>

        {/* Match Reveal Stage */}
        {currentMatch ? (
          <View style={styles.stageContainer}>
            {/* Ceremony Lights */}
            <View style={styles.lightsContainer}>
              {[...Array(5)].map((_, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.ceremonyLight,
                    {
                      backgroundColor: lightsOn
                        ? currentMatch.isPerfectMatch
                          ? '#00ff00'
                          : '#ff0000'
                        : '#333',
                      opacity: pulseAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.3, 1, 0.3],
                      }),
                    },
                  ]}
                />
              ))}
            </View>

            {/* Couple Display */}
            <View style={styles.coupleContainer}>
              <View style={styles.personCard}>
                <View style={[styles.avatar, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.avatarText, { color: theme.text }]}>
                    {currentMatch.userA.name.charAt(0)}
                  </Text>
                </View>
                <Text style={[styles.personName, { color: theme.text }]}>
                  {currentMatch.userA.name}
                </Text>
              </View>

              <Animated.View
                style={[
                  styles.heartContainer,
                  {
                    transform: [
                      {
                        scale: pulseAnim.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [1, 1.3, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.heartEmoji}>
                  {lightsOn
                    ? currentMatch.isPerfectMatch
                      ? '💚'
                      : '❌'
                    : '💜'}
                </Text>
              </Animated.View>

              <View style={styles.personCard}>
                <View style={[styles.avatar, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.avatarText, { color: theme.text }]}>
                    {currentMatch.userB.name.charAt(0)}
                  </Text>
                </View>
                <Text style={[styles.personName, { color: theme.text }]}>
                  {currentMatch.userB.name}
                </Text>
              </View>
            </View>

            {/* Result */}
            {lightsOn && (
              <View style={styles.resultContainer}>
                <Text
                  style={[
                    styles.resultText,
                    {
                      color: currentMatch.isPerfectMatch ? '#00ff00' : '#ff4444',
                    },
                  ]}
                >
                  {currentMatch.isPerfectMatch
                    ? 'PERFECT MATCH!'
                    : 'NOT A MATCH'}
                </Text>
                {currentMatch.isPerfectMatch && isUsersMatch && (
                  <Text style={[styles.congratsText, { color: theme.textSecondary }]}>
                    Congratulations! You found your perfect match!
                  </Text>
                )}
              </View>
            )}

            {/* Next Button */}
            {lightsOn && (
              <TouchableOpacity
                style={[styles.nextButton, { backgroundColor: theme.primary }]}
                onPress={getNextMatch}
              >
                <Text style={styles.nextButtonText}>Next Couple</Text>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          /* Start Ceremony Button */
          <View style={styles.startContainer}>
            <Text style={[styles.startTitle, { color: theme.text }]}>
              Ready for the Ceremony?
            </Text>
            <Text style={[styles.startDescription, { color: theme.textSecondary }]}>
              This week's couples will be revealed one by one. Watch the lights to see if they're a Perfect Match!
            </Text>

            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: theme.primary }]}
              onPress={startCeremony}
            >
              <Ionicons name="flashlight" size={24} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.startButtonText}>Start Ceremony</Text>
            </TouchableOpacity>

            {/* Previous Matches */}
            {revealedMatches.length > 0 && (
              <View style={styles.previousMatchesContainer}>
                <Text style={[styles.previousTitle, { color: theme.text }]}>
                  This Week's Matches
                </Text>
                {revealedMatches.map((match, index) => (
                  <View key={match.id} style={[styles.matchRow, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.matchNumber, { color: theme.textSecondary }]}>
                      {index + 1}
                    </Text>
                    <View style={styles.matchNames}>
                      <Text style={[styles.matchName, { color: theme.text }]}>
                        {match.userA.name}
                      </Text>
                      <Text style={[styles.matchName, { color: theme.text }]}>
                        {match.userB.name}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.matchIndicator,
                        {
                          backgroundColor: match.isPerfectMatch ? '#00ff00' : '#ff4444',
                        },
                      ]}
                    >
                      <Text style={styles.matchIndicatorText}>
                        {match.isPerfectMatch ? '✓' : '✗'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
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
  ceremonyHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  ceremonyEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  ceremonyTitle: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  ceremonySubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
  stageContainer: {
    alignItems: 'center',
  },
  lightsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  ceremonyLight: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  coupleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  personCard: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  avatarText: {
    fontSize: 32,
    fontFamily: FONTS.bold,
  },
  personName: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    maxWidth: 100,
    textAlign: 'center',
  },
  heartContainer: {
    marginHorizontal: SPACING.lg,
  },
  heartEmoji: {
    fontSize: 48,
  },
  resultContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  resultText: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.sm,
  },
  congratsText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FONTS.bold,
    marginRight: SPACING.xs,
  },
  startContainer: {
    alignItems: 'center',
  },
  startTitle: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  startDescription: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xl,
  },
  buttonIcon: {
    marginRight: SPACING.sm,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  previousMatchesContainer: {
    width: '100%',
  },
  previousTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.md,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  matchNumber: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    width: 30,
  },
  matchNames: {
    flex: 1,
  },
  matchName: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    marginBottom: 2,
  },
  matchIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchIndicatorText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
});
