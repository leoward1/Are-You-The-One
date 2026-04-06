import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { ProfileStackParamList } from '../../navigation/ProfileNavigator';
import { useAuthStore } from '../../store';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../utils/constants';
import { Avatar, Card, Badge } from '../../components/ui';

type MyProfileScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'MyProfile'>;
};

export default function MyProfileScreen({ navigation }: MyProfileScreenProps) {
  const { user } = useAuthStore();

  const stats = [
    { label: 'Matches', value: '24' },
    { label: 'Roses Sent', value: '12' },
    { label: 'Kisses', value: '8' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={['#8B1538', '#FF6B9D']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <Avatar
              name={user?.first_name || 'User'}
              size="large"
              source={user?.photo_url}
              showPhotoBadge
            />
            <Text style={styles.name}>
              {user?.first_name} {user?.last_name}
            </Text>
            <Text style={styles.email}>{user?.email}</Text>
            <Badge
              label={user?.tier?.toUpperCase() || 'FREE'}
              variant="secondary"
              size="small"
              style={styles.tierBadge}
            />
          </View>
        </LinearGradient>

        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.menuSection}>
          <Card variant="elevated" padding="none">
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <View style={styles.menuIcon}>
                <Text style={styles.menuEmoji}>✏️</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Edit Profile</Text>
                <Text style={styles.menuSubtitle}>Update your photos and info</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Settings')}
            >
              <View style={styles.menuIcon}>
                <Text style={styles.menuEmoji}>⚙️</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Settings</Text>
                <Text style={styles.menuSubtitle}>Privacy and notifications</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Subscription')}
            >
              <View style={styles.menuIcon}>
                <Text style={styles.menuEmoji}>👑</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Subscription</Text>
                <Text style={styles.menuSubtitle}>Upgrade to unlock features</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </Card>

          <Card variant="elevated" padding="none" style={styles.extraMenu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('SuccessStories')}
            >
              <View style={styles.menuIcon}>
                <Text style={styles.menuEmoji}>💍</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Success Stories</Text>
                <Text style={styles.menuSubtitle}>Real connections made here</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('HelpSupport')}
            >
              <View style={styles.menuIcon}>
                <Text style={styles.menuEmoji}>❓</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Help & Support</Text>
                <Text style={styles.menuSubtitle}>Get help when you need it</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  header: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginTop: SPACING.md,
  },
  email: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  tierBadge: {
    marginTop: SPACING.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: -SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  statValue: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  menuSection: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  menuEmoji: {
    fontSize: 20,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
  },
  menuSubtitle: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: SPACING.md + 40 + SPACING.md,
  },
  extraMenu: {
    marginTop: SPACING.sm,
  },
});
