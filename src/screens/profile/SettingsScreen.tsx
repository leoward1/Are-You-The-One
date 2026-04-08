import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SPACING, FONTS, BORDER_RADIUS } from '../../utils/constants';
import { Card } from '../../components/ui';
import { useAuthStore } from '../../store';
import { supabase } from '../../config/supabase';
import { useColors } from '../../hooks/useColors';
import { useThemeStore } from '../../store/useThemeStore';
import { useAppSettingsStore } from '../../store/useAppSettingsStore';
import type { ThemeMode } from '../../utils/theme';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/ProfileNavigator';

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'Settings'>;
};

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const COLORS = useColors();
  const styles = useMemo(() => makeStyles(COLORS), [COLORS]);
  const { logout, user } = useAuthStore();
  const { mode: themeMode, setMode: setThemeMode } = useThemeStore();
  const { soundEnabled, setSoundEnabled } = useAppSettingsStore();

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
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('user_settings')
      .select('notify_new_matches,notify_messages,notify_roses,notify_kisses,notify_safety,show_online,show_distance,incognito_mode,show_in_discovery')
      .eq('user_id', user.id)
      .maybeSingle();
    if (data) {
      setSettings({
        notifications: {
          newMatches: data.notify_new_matches ?? true,
          messages: data.notify_messages ?? true,
          roses: data.notify_roses ?? true,
          kisses: data.notify_kisses ?? true,
          safetyAlerts: data.notify_safety ?? true,
        },
        privacy: {
          showOnline: data.show_online ?? true,
          showDistance: data.show_distance ?? true,
          incognito: data.incognito_mode ?? false,
        },
        discovery: {
          showMe: data.show_in_discovery ?? true,
        },
      });
    }
  };

  const saveSettings = async (updated: typeof settings) => {
    if (!user?.id) return;
    await supabase.from('user_settings').upsert({
      user_id: user.id,
      notify_new_matches: updated.notifications.newMatches,
      notify_messages: updated.notifications.messages,
      notify_roses: updated.notifications.roses,
      notify_kisses: updated.notifications.kisses,
      notify_safety: updated.notifications.safetyAlerts,
      show_online: updated.privacy.showOnline,
      show_distance: updated.privacy.showDistance,
      incognito_mode: updated.privacy.incognito,
      show_in_discovery: updated.discovery.showMe,
    }, { onConflict: 'user_id' });
  };

  const toggleSetting = (category: keyof typeof settings, key: string) => {
    const updated = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: !settings[category][key as keyof typeof settings[typeof category]],
      },
    };
    setSettings(updated);
    saveSettings(updated);
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

  const THEME_OPTIONS: { label: string; value: ThemeMode; icon: string }[] = [
    { label: 'Light', value: 'light', icon: '☀️' },
    { label: 'Dark', value: 'dark', icon: '🌙' },
    { label: 'System', value: 'system', icon: '📱' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* ─── Appearance ─── */}
        <Text style={styles.sectionTitle}>Appearance</Text>
        <Card variant="elevated" padding="none">
          <View style={styles.themeSection}>
            <Text style={styles.settingLabel}>App Theme</Text>
            <Text style={styles.settingDescription}>Choose how the app looks</Text>
            <View style={styles.themeButtons}>
              {THEME_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.themeButton,
                    themeMode === opt.value && styles.themeButtonActive,
                  ]}
                  onPress={() => setThemeMode(opt.value)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.themeIcon}>{opt.icon}</Text>
                  <Text style={[
                    styles.themeLabel,
                    themeMode === opt.value && styles.themeLabelActive,
                  ]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>

        {/* ─── Sounds ─── */}
        <Text style={styles.sectionTitle}>Sounds</Text>
        <Card variant="elevated" padding="none">
          <SettingRow
            label="Animation Sounds"
            description="Play sounds when sending a Rose or Kiss"
            value={soundEnabled}
            onToggle={() => setSoundEnabled(!soundEnabled)}
            COLORS={COLORS}
            styles={styles}
          />
        </Card>

        {/* ─── Notifications ─── */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Card variant="elevated" padding="none">
          <SettingRow
            label="New Matches"
            description="Get notified when you have a new match"
            value={settings.notifications.newMatches}
            onToggle={() => toggleSetting('notifications', 'newMatches')}
            COLORS={COLORS}
            styles={styles}
          />
          <SettingRow
            label="Messages"
            description="Get notified about new messages"
            value={settings.notifications.messages}
            onToggle={() => toggleSetting('notifications', 'messages')}
            COLORS={COLORS}
            styles={styles}
          />
          <SettingRow
            label="Roses"
            description="Get notified when someone sends you a rose"
            value={settings.notifications.roses}
            onToggle={() => toggleSetting('notifications', 'roses')}
            COLORS={COLORS}
            styles={styles}
          />
          <SettingRow
            label="Kisses"
            description="Get notified about kisses"
            value={settings.notifications.kisses}
            onToggle={() => toggleSetting('notifications', 'kisses')}
            COLORS={COLORS}
            styles={styles}
          />
          <SettingRow
            label="Safety Alerts"
            description="Important safety notifications"
            value={settings.notifications.safetyAlerts}
            onToggle={() => toggleSetting('notifications', 'safetyAlerts')}
            COLORS={COLORS}
            styles={styles}
            isLast
          />
        </Card>

        {/* ─── Privacy ─── */}
        <Text style={styles.sectionTitle}>Privacy</Text>
        <Card variant="elevated" padding="none">
          <SettingRow
            label="Show Online Status"
            description="Let others see when you're online"
            value={settings.privacy.showOnline}
            onToggle={() => toggleSetting('privacy', 'showOnline')}
            COLORS={COLORS}
            styles={styles}
          />
          <SettingRow
            label="Show Distance"
            description="Display your distance to other users"
            value={settings.privacy.showDistance}
            onToggle={() => toggleSetting('privacy', 'showDistance')}
            COLORS={COLORS}
            styles={styles}
          />
          <SettingRow
            label="Incognito Mode"
            description="Only people you like can see you"
            value={settings.privacy.incognito}
            onToggle={() => toggleSetting('privacy', 'incognito')}
            COLORS={COLORS}
            styles={styles}
            isLast
          />
        </Card>

        {/* ─── Discovery ─── */}
        <Text style={styles.sectionTitle}>Discovery</Text>
        <Card variant="elevated" padding="none">
          <SettingRow
            label="Show Me in Discovery"
            description="Appear in other users' discovery feed"
            value={settings.discovery.showMe}
            onToggle={() => toggleSetting('discovery', 'showMe')}
            COLORS={COLORS}
            styles={styles}
            isLast
          />
        </Card>

        {/* ─── Account ─── */}
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

        <Text style={styles.version}>Version 1.0.9</Text>
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
  COLORS: any;
  styles: any;
}

const SettingRow: React.FC<SettingRowProps> = ({ label, description, value, onToggle, isLast, COLORS, styles }) => (
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
        thumbColor={COLORS.textLight}
      />
    </View>
    {!isLast && <View style={styles.divider} />}
  </>
);

const makeStyles = (COLORS: any) => StyleSheet.create({
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

  // Theme section
  themeSection: {
    padding: SPACING.md,
  },
  themeButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  themeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    gap: 4,
  },
  themeButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
  },
  themeIcon: {
    fontSize: 22,
  },
  themeLabel: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  themeLabelActive: {
    color: COLORS.primary,
    fontFamily: FONTS.semiBold,
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
