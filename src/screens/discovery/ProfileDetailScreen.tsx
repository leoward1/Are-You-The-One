import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
  FlatList,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { DiscoveryStackParamList } from '../../navigation/DiscoveryNavigator';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../utils/constants';
import { matchService } from '../../services';
import { useAuthStore } from '../../store';
import type { Profile, Gender } from '../../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type ProfileDetailScreenProps = {
  route: RouteProp<DiscoveryStackParamList, 'ProfileDetail'>;
  navigation: NativeStackNavigationProp<DiscoveryStackParamList, 'ProfileDetail'>;
};

// Small dot indicator for photo gallery
function PhotoDots({ count, active }: { count: number; active: number }) {
  return (
    <View style={dotStyles.row}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[dotStyles.dot, i === active && dotStyles.activeDot]} />
      ))}
    </View>
  );
}

const dotStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  activeDot: { backgroundColor: COLORS.white, width: 20 },
});

// Lifestyle / interest pill
function Pill({ label }: { label: string }) {
  return (
    <View style={pillStyles.pill}>
      <Text style={pillStyles.text}>{label}</Text>
    </View>
  );
}

const pillStyles = StyleSheet.create({
  pill: {
    backgroundColor: COLORS.primary + '18',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  text: { fontSize: 13, fontFamily: FONTS.medium, color: COLORS.primary },
});

export default function ProfileDetailScreen({ route, navigation }: ProfileDetailScreenProps) {
  const { userId } = route.params;
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [isActing, setIsActing] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const userGender: Gender = currentUser?.gender || 'male';
  const likeEmoji = userGender === 'female' ? '💋' : '🌹';
  const likeLabel = userGender === 'female' ? 'Kiss' : 'Rose';

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const { supabase } = await import('../../config/supabase');
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileData) {
        const { data: photos } = await supabase
          .from('photos')
          .select('*')
          .eq('user_id', userId)
          .order('position');
        setProfile({ ...profileData, photos: photos || [] });
      } else {
        setProfile(null);
      }
    } catch {
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!profile || isActing) return;
    setIsActing(true);
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.15, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
    try {
      const likeType = userGender === 'female' ? 'kiss' : 'rose';
      const result = await matchService.sendLike(profile.user_id, likeType);
      if (result.is_mutual_match) {
        Alert.alert('🎉 It\'s a Match!', `You and ${profile.first_name} matched!`, [
          { text: 'Keep Swiping', onPress: () => navigation.goBack() },
          { text: 'Say Hello', onPress: () => navigation.goBack() },
        ]);
      } else {
        navigation.goBack();
      }
    } catch (e) {
      Alert.alert('Oops', 'Could not send like. Try again.');
    } finally {
      setIsActing(false);
    }
  };

  const handlePass = async () => {
    if (!profile || isActing) return;
    setIsActing(true);
    try {
      await matchService.sendPass(profile.user_id);
      navigation.goBack();
    } catch {
      navigation.goBack();
    } finally {
      setIsActing(false);
    }
  };

  const handleReport = () => {
    if (!profile) return;
    Alert.alert(
      'Report or Block',
      `Are you sure you want to report or block ${profile.first_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Block User', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('User Blocked', `${profile.first_name} has been blocked and will no longer appear.`);
            navigation.goBack();
          }
        },
        { 
          text: 'Report Profile', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Profile Reported', `Thank you. Our moderation team will review this profile within 24 hours.`);
            navigation.goBack();
          }
        }
      ]
    );
  };

  const heightLabel = (inches?: number) => {
    if (!inches) return null;
    const ft = Math.floor(inches / 12);
    const inRem = inches % 12;
    return `${ft}'${inRem}"`;
  };

  const photos = profile?.photos?.length ? profile.photos : profile?.primary_photo
    ? [{ id: '0', url: profile.primary_photo, user_id: '', is_primary: true, created_at: '' }]
    : [];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>Profile not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* ─── Photo Gallery ─── */}
        <View style={styles.galleryContainer}>
          <FlatList
            data={photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActivePhoto(index);
            }}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item.url }}
                style={styles.photo}
                resizeMode="cover"
              />
            )}
          />

          {/* Gradient overlay at bottom of photo */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.75)']}
            style={styles.photoGradient}
          >
            {/* Dots */}
            {photos.length > 1 && (
              <PhotoDots count={photos.length} active={activePhoto} />
            )}

            {/* Name / age / city / distance */}
            <View style={styles.photoInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{profile.first_name}, {profile.age}</Text>
                {profile.compatibility_pct !== undefined && (
                  <View style={styles.compatBadge}>
                    <Text style={styles.compatText}>❤️ {profile.compatibility_pct}%</Text>
                  </View>
                )}
              </View>
              <Text style={styles.location}>📍 {profile.city} · {profile.distance_miles ?? '?'} mi away</Text>
              {profile.headline ? <Text style={styles.headline}>{profile.headline}</Text> : null}
            </View>
          </LinearGradient>

          {/* Top Bar with actions */}
          <SafeAreaView style={styles.topBar} edges={['top']}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backCircle}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleReport} style={styles.reportCircle}>
              <Text style={styles.reportIcon}>⋮</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* ─── Quick Stats ─── */}
        <View style={styles.statsRow}>
          {heightLabel(profile.height_in) && (
            <View style={styles.statChip}>
              <Text style={styles.statIcon}>📏</Text>
              <Text style={styles.statText}>{heightLabel(profile.height_in)}</Text>
            </View>
          )}
          {profile.city && (
            <View style={styles.statChip}>
              <Text style={styles.statIcon}>🏙️</Text>
              <Text style={styles.statText}>{profile.city}</Text>
            </View>
          )}
        </View>

        {/* ─── Bio ─── */}
        {profile.bio ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>{profile.bio}</Text>
          </View>
        ) : null}

        {/* ─── Interests ─── */}
        {profile.interests?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.pillsRow}>
              {profile.interests.map((tag, i) => <Pill key={i} label={tag} />)}
            </View>
          </View>
        )}

        {/* ─── Lifestyle ─── */}
        {profile.lifestyle_tags?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lifestyle</Text>
            <View style={styles.pillsRow}>
              {profile.lifestyle_tags.map((tag, i) => <Pill key={i} label={tag} />)}
            </View>
          </View>
        )}

        {/* Bottom spacer for action buttons */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ─── Sticky Action Bar ─── */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton]}
          onPress={handlePass}
          disabled={isActing}
          activeOpacity={0.85}
        >
          <Text style={styles.actionButtonIconLarge}>❌</Text>
          <Text style={styles.passLabel}>Pass</Text>
        </TouchableOpacity>

        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[styles.actionButton, styles.likeButton]}
            onPress={handleLike}
            disabled={isActing}
            activeOpacity={0.85}
          >
            <Text style={styles.actionButtonIconLarge}>{likeEmoji}</Text>
            <Text style={styles.likeLabel}>{likeLabel}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const PHOTO_HEIGHT = SCREEN_HEIGHT * 0.55;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  errorText: { fontSize: 18, fontFamily: FONTS.medium, color: COLORS.textSecondary, marginBottom: SPACING.md },
  backBtn: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.lg },
  backBtnText: { color: COLORS.white, fontFamily: FONTS.semiBold, fontSize: 16 },

  // Gallery
  galleryContainer: { height: PHOTO_HEIGHT, position: 'relative' },
  photo: { width: SCREEN_WIDTH, height: PHOTO_HEIGHT },
  photoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: PHOTO_HEIGHT * 0.55,
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { fontSize: 20, color: COLORS.white },
  reportCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportIcon: { fontSize: 24, color: COLORS.white, fontWeight: 'bold' },

  // Photo info
  photoInfo: { gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  name: { fontSize: 30, fontFamily: FONTS.bold, color: COLORS.white, flexShrink: 1 },
  compatBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  compatText: { fontSize: 13, fontFamily: FONTS.bold, color: COLORS.white },
  location: { fontSize: 15, fontFamily: FONTS.regular, color: 'rgba(255,255,255,0.85)' },
  headline: { fontSize: 14, fontFamily: FONTS.medium, color: 'rgba(255,255,255,0.75)', fontStyle: 'italic' },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIcon: { fontSize: 16 },
  statText: { fontSize: 14, fontFamily: FONTS.medium, color: COLORS.text },

  // Sections
  section: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl },
  sectionTitle: { fontSize: 18, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SPACING.md },
  bio: { fontSize: 15, fontFamily: FONTS.regular, color: COLORS.text, lineHeight: 23 },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },

  // Action bar
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xl,
    paddingVertical: SPACING.lg,
    paddingBottom: 36,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  actionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  passButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    shadowColor: '#FF6B6B',
  },
  likeButton: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
  },
  actionButtonIconLarge: { fontSize: 30 },
  passLabel: { fontSize: 11, fontFamily: FONTS.semiBold, color: '#FF6B6B', marginTop: 2 },
  likeLabel: { fontSize: 11, fontFamily: FONTS.semiBold, color: COLORS.white, marginTop: 2 },
});
