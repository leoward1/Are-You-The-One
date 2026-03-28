import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../utils/constants';
import { Card } from '../../components/ui';
import { useAuthStore } from '../../store';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/ProfileNavigator';

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'Settings'>;
};

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { logout } = useAuthStore();
  const [settings, setSettings] = useState({
    notifications: {
      newMatches: true,
      messages: true,
      roses: true,
      kisses: true,
      safetyAlerts: true,
    },
    privacy: {
      showOnline: true,
      showDistance: true,
      incognito: false,
    },
    discovery: {
      showMe: true,
      ageRange: { min: 18, max: 35 },
      distance: 50,
    },
  });

  const toggleSetting = (category: keyof typeof settings, key: string) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [key]: !settings[category][key as keyof typeof settings[typeof category]],
      },
    });
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await useAuthStore.getState().deleteAccount();
              Alert.alert('Account Deleted', 'Your account and data have been removed.');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Card variant="elevated" padding="none">
          <SettingRow
            label="New Matches"
            description="Get notified when you have a new match"
            value={settings.notifications.newMatches}
            onToggle={() => toggleSetting('notifications', 'newMatches')}
          />
          <SettingRow
            label="Messages"
            description="Get notified about new messages"
            value={settings.notifications.messages}
            onToggle={() => toggleSetting('notifications', 'messages')}
          />
          <SettingRow
            label="Roses"
            description="Get notified when someone sends you a rose"
            value={settings.notifications.roses}
            onToggle={() => toggleSetting('notifications', 'roses')}
          />
          <SettingRow
            label="Kisses"
            description="Get notified about kisses"
            value={settings.notifications.kisses}
            onToggle={() => toggleSetting('notifications', 'kisses')}
          />
          <SettingRow
            label="Safety Alerts"
            description="Important safety notifications"
            value={settings.notifications.safetyAlerts}
            onToggle={() => toggleSetting('notifications', 'safetyAlerts')}
            isLast
          />
        </Card>

        <Text style={styles.sectionTitle}>Privacy</Text>
        <Card variant="elevated" padding="none">
          <SettingRow
            label="Show Online Status"
            description="Let others see when you're online"
            value={settings.privacy.showOnline}
            onToggle={() => toggleSetting('privacy', 'showOnline')}
          />
          <SettingRow
            label="Show Distance"
            description="Display your distance to other users"
            value={settings.privacy.showDistance}
            onToggle={() => toggleSetting('privacy', 'showDistance')}
          />
          <SettingRow
            label="Incognito Mode"
            description="Only people you like can see you"
            value={settings.privacy.incognito}
            onToggle={() => toggleSetting('privacy', 'incognito')}
            isLast
          />
        </Card>

        <Text style={styles.sectionTitle}>Discovery</Text>
        <Card variant="elevated" padding="none">
          <SettingRow
            label="Show Me in Discovery"
            description="Appear in other users' discovery feed"
            value={settings.discovery.showMe}
            onToggle={() => toggleSetting('discovery', 'showMe')}
            isLast
          />
        </Card>

        <Text style={styles.sectionTitle}>Account</Text>
        <Card variant="elevated" padding="none">
          <TouchableOpacity
            style={styles.settingButton}
            onPress={() => navigation.navigate('BlockedUsers')}
          >
            <Text style={styles.settingButtonText}>Blocked Users</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.settingButton}
            onPress={() => navigation.navigate('HelpSupport')}
          >
            <Text style={styles.settingButtonText}>Help & Support</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.settingButton}
            onPress={() => navigation.navigate('TermsOfService')}
          >
            <Text style={styles.settingButtonText}>Terms of Service</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.settingButton}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <Text style={styles.settingButtonText}>Privacy Policy</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </Card>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

interface SettingRowProps {
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  isLast?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({ label, description, value, onToggle, isLast }) => (
  <>
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.border, true: COLORS.primary }}
        thumbColor={COLORS.white}
      />
    </View>
    {!isLast && <View style={styles.divider} />}
  </>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  settingButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  chevron: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: SPACING.md,
  },
  logoutButton: {
    marginTop: SPACING.xl,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
  deleteButton: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.error,
  },
  version: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});
