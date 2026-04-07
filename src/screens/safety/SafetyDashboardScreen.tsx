import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafetyStackParamList } from '../../navigation/SafetyNavigator';
import { SPACING, FONTS, BORDER_RADIUS } from '../../utils/constants';
import { useColors } from '../../hooks/useColors';
import { Button, Card } from '../../components/ui';
import { safetyService } from '../../services/safety.service';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../config/supabase';

type SafetyDashboardScreenProps = {
  navigation: NativeStackNavigationProp<SafetyStackParamList, 'SafetyDashboard'>;
};

export default function SafetyDashboardScreen({ navigation }: SafetyDashboardScreenProps) {
  const COLORS = useColors();
  const styles = useMemo(() => makeStyles(COLORS), [COLORS]);
  const { user } = useAuthStore();
  const [hasActiveCheckin, setHasActiveCheckin] = useState(false);
  const [activeCheckinId, setActiveCheckinId] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState<{
    email: string; phone: string;
  }>({ email: '', phone: '' });

  useEffect(() => {
    loadEmergencyContact();
  }, []);

  const loadEmergencyContact = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('user_settings')
      .select('emergency_contact_email, emergency_contact_phone')
      .eq('user_id', user.id)
      .maybeSingle();
    if (data) {
      setEmergencyContact({
        email: data.emergency_contact_email || '',
        phone: data.emergency_contact_phone || '',
      });
    }
  };

  // FIX: Real 911 emergency call using Linking
  const handleEmergency = () => {
    Alert.alert(
      '🚨 Emergency',
      'This will call 911 immediately. Only use in a real emergency.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'CALL 911',
          style: 'destructive',
          onPress: () => {
            Linking.openURL('tel:911').catch(() => {
              Alert.alert('Error', 'Unable to make the call. Please dial 911 manually.');
            });
          },
        },
      ]
    );
  };

  // FIX: Real Supabase checkin creation
  const handleStartCheckin = async () => {
    setIsStarting(true);
    try {
      const expectedEnd = new Date();
      expectedEnd.setHours(expectedEnd.getHours() + 1);

      const checkin = await safetyService.startCheckin({
        meeting_with: user?.first_name || 'Me',
        expected_end: expectedEnd.toISOString(),
        auto_alert_minutes: 15,
        emergency_contact_email: emergencyContact.email,
        emergency_contact_phone: emergencyContact.phone,
      });

      setActiveCheckinId(checkin.id);
      setHasActiveCheckin(true);
      navigation.navigate('ActiveCheckin', { checkinId: checkin.id });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not start check-in');
    } finally {
      setIsStarting(false);
    }
  };

  // FIX: Real Date Mode with real Supabase checkin
  const handleStartDateMode = async () => {
    Alert.alert(
      'Start Date Mode',
      'This enables intensive safety monitoring for your in-person date.',
      [
        { text: 'Cancel' },
        {
          text: 'Start',
          onPress: async () => {
            setIsStarting(true);
            try {
              const checkin = await safetyService.startDateMode(null as any, 'Your Date');
              setActiveCheckinId(checkin.id);
              setHasActiveCheckin(true);
              navigation.navigate('DateMode', {
                checkinId: checkin.id,
                partnerName: 'Your Date',
              });
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Could not start date mode');
            } finally {
              setIsStarting(false);
            }
          },
        },
      ]
    );
  };

  const safetyFeatures = [
    { icon: '📍', title: 'Live Location Sharing', description: 'Share your real-time location with trusted contacts' },
    { icon: '⏰', title: 'Timed Check-ins', description: 'Set automatic check-in reminders during dates' },
    { icon: '🚨', title: 'Emergency SOS', description: 'Quick access to emergency services' },
    { icon: '👥', title: 'Trusted Contacts', description: 'Designate friends and family as emergency contacts' },
  ];

  const safetyTips = [
    'Always meet in a public place for first dates',
    "Tell a friend where you're going and when",
    'Trust your instincts — if something feels off, leave',
    'Keep your phone charged and accessible',
    "Don't share personal information too quickly",
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>🛡️</Text>
          <Text style={styles.title}>Safety Center</Text>
          <Text style={styles.subtitle}>Your safety is our priority</Text>
        </View>

        {hasActiveCheckin ? (
          <Card variant="elevated" style={styles.activeCheckinCard}>
            <View style={styles.activeCheckinHeader}>
              <View style={styles.pulseContainer}>
                <View style={styles.pulse} />
                <Text style={styles.activeIcon}>🛡️</Text>
              </View>
              <View style={styles.activeCheckinInfo}>
                <Text style={styles.activeCheckinTitle}>Monitoring Active</Text>
                <Text style={styles.activeCheckinTime}>Your location is being shared</Text>
              </View>
            </View>
            <Button
              title="Return to Active Date"
              onPress={() => navigation.navigate('DateMode', {
                checkinId: activeCheckinId || '',
                partnerName: 'Your Date',
              })}
              variant="secondary"
              size="medium"
              fullWidth
            />
          </Card>
        ) : (
          <View style={styles.cardRow}>
            <Card variant="elevated" style={styles.halfCard}>
              <Text style={styles.cardEmoji}>🤝</Text>
              <Text style={styles.cardTitle}>In-Person Date</Text>
              <Button
                title={isStarting ? 'Starting...' : 'Start Date Mode'}
                onPress={handleStartDateMode}
                variant="primary"
                size="small"
                disabled={isStarting}
              />
            </Card>
            <Card variant="elevated" style={styles.halfCard}>
              <Text style={styles.cardEmoji}>⏰</Text>
              <Text style={styles.cardTitle}>Solo Check-in</Text>
              <Button
                title={isStarting ? 'Starting...' : 'Start Timer'}
                onPress={handleStartCheckin}
                variant="secondary"
                size="small"
                disabled={isStarting}
              />
            </Card>
          </View>
        )}

        <Text style={styles.sectionTitle}>Safety Features</Text>
        <Card variant="elevated" padding="none">
          {safetyFeatures.map((feature, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                style={styles.featureItem}
                onPress={() => {
                  if (feature.title === 'Trusted Contacts') {
                    navigation.navigate('TrustedContacts');
                  } else {
                    Alert.alert(feature.title, feature.description);
                  }
                }}
              >
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
                {feature.title === 'Trusted Contacts' && (
                  <Text style={styles.chevron}>›</Text>
                )}
              </TouchableOpacity>
              {index < safetyFeatures.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </Card>

        <Text style={styles.sectionTitle}>Safety Tips</Text>
        <Card variant="elevated">
          {safetyTips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </Card>

        {/* FIX: Real 911 call */}
        <Card variant="outlined" style={styles.emergencyCard}>
          <Text style={styles.emergencyIcon}>🚨</Text>
          <Text style={styles.emergencyTitle}>In an Emergency</Text>
          <Text style={styles.emergencyText}>
            If you feel unsafe, leave immediately and call emergency services
          </Text>
          <Button
            title="Emergency: Call 911"
            onPress={handleEmergency}
            variant="primary"
            size="large"
            fullWidth
            style={styles.emergencyButton}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  header: { alignItems: 'center', marginBottom: SPACING.xl },
  headerEmoji: { fontSize: 64, marginBottom: SPACING.md },
  title: { fontSize: 28, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SPACING.xs },
  subtitle: { fontSize: 16, fontFamily: FONTS.regular, color: COLORS.textSecondary, textAlign: 'center' },
  activeCheckinCard: { marginBottom: SPACING.lg, backgroundColor: COLORS.success + '10', borderColor: COLORS.success },
  activeCheckinHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  pulseContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.success, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md, position: 'relative' },
  pulse: { position: 'absolute', width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.success, opacity: 0.3 },
  activeIcon: { fontSize: 24, color: COLORS.white },
  activeCheckinInfo: { flex: 1 },
  activeCheckinTitle: { fontSize: 18, fontFamily: FONTS.bold, color: COLORS.success },
  activeCheckinTime: { fontSize: 14, fontFamily: FONTS.regular, color: COLORS.textSecondary, marginTop: 2 },
  cardRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg },
  halfCard: { flex: 1, alignItems: 'center', padding: SPACING.md },
  cardEmoji: { fontSize: 32, marginBottom: SPACING.sm },
  cardTitle: { fontSize: 16, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SPACING.md, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontFamily: FONTS.bold, color: COLORS.text, marginTop: SPACING.lg, marginBottom: SPACING.md },
  featureItem: { flexDirection: 'row', padding: SPACING.md, alignItems: 'center' },
  featureIcon: { fontSize: 32, marginRight: SPACING.md },
  featureContent: { flex: 1 },
  featureTitle: { fontSize: 16, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: 2 },
  featureDescription: { fontSize: 13, fontFamily: FONTS.regular, color: COLORS.textSecondary },
  divider: { height: 1, backgroundColor: COLORS.border, marginLeft: SPACING.md + 32 + SPACING.md },
  tipItem: { flexDirection: 'row', marginBottom: SPACING.sm },
  tipBullet: { fontSize: 16, color: COLORS.primary, marginRight: SPACING.sm, fontFamily: FONTS.bold },
  tipText: { flex: 1, fontSize: 14, fontFamily: FONTS.regular, color: COLORS.text, lineHeight: 20 },
  emergencyCard: { marginTop: SPACING.lg, alignItems: 'center', borderColor: COLORS.error, backgroundColor: COLORS.error + '05' },
  emergencyIcon: { fontSize: 48, marginBottom: SPACING.sm },
  emergencyTitle: { fontSize: 18, fontFamily: FONTS.bold, color: COLORS.error, marginBottom: SPACING.xs },
  emergencyText: { fontSize: 14, fontFamily: FONTS.regular, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.md },
  emergencyButton: { backgroundColor: COLORS.error },
  chevron: { fontSize: 24, color: COLORS.textSecondary, fontFamily: FONTS.regular },
});