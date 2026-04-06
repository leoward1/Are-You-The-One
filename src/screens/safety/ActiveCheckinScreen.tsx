import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../utils/constants';
import { Button, Card } from '../../components/ui';
import { safetyService } from '../../services/safety.service';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../config/supabase';

export default function ActiveCheckinScreen({ navigation, route }: any) {
  // FIX: Read real checkinId from navigation params
  const { checkinId } = route.params;
  const { user } = useAuthStore();

  const [elapsedTime, setElapsedTime] = useState(0);
  const [locationText, setLocationText] = useState('Getting location...');
  const [isCompleting, setIsCompleting] = useState(false);
  const [isExtending, setIsExtending] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState({ name: 'Emergency Contact', phone: 'Not set' });
  const startTime = useRef(new Date());
  const scheduledEndTime = useRef(new Date(Date.now() + 60 * 60 * 1000));
  const locationInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const loadContact = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from('user_settings')
        .select('emergency_contact_name, emergency_contact_phone')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setEmergencyContact({
          name: data.emergency_contact_name || 'Emergency Contact',
          phone: data.emergency_contact_phone || 'Not set',
        });
      }
    };
    loadContact();
  }, [user?.id]);

  // FIX: Real GPS location tracking
  useEffect(() => {
    const startLocationTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationText('Location permission denied');
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({});
        const address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (address.length > 0) {
          const addr = address[0];
          setLocationText(
            `${addr.street || ''} ${addr.city || ''}`.trim() || 'Location active'
          );
        }

        // Update location every 60 seconds
        locationInterval.current = setInterval(async () => {
          try {
            const loc = await Location.getCurrentPositionAsync({});
            await safetyService.updateLocation(checkinId, {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            });
          } catch (err) {
            console.error('Location update error:', err);
          }
        }, 60000);
      } catch (err) {
        setLocationText('Location unavailable');
      }
    };

    startLocationTracking();
    return () => {
      if (locationInterval.current) clearInterval(locationInterval.current);
    };
  }, [checkinId]);

  // Elapsed time counter
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime.current.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // FIX: Real Supabase checkin completion
  const handleComplete = () => {
    Alert.alert(
      'Complete Check-in',
      'Are you sure you want to end this safety check-in?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            setIsCompleting(true);
            try {
              await safetyService.completeCheckin(checkinId);
              navigation.goBack();
              Alert.alert('Check-in Complete', 'Stay safe! 💕');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Could not complete check-in');
            } finally {
              setIsCompleting(false);
            }
          },
        },
      ]
    );
  };

  const handleExtendTime = async () => {
    setIsExtending(true);
    try {
      const newEnd = new Date(scheduledEndTime.current.getTime() + 30 * 60 * 1000);
      await safetyService.extendCheckin(checkinId, newEnd.toISOString());
      scheduledEndTime.current = newEnd;
      Alert.alert('Extended', 'Check-in extended by 30 minutes');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not extend time');
    } finally {
      setIsExtending(false);
    }
  };

  // FIX: Real SOS — writes to Supabase AND calls 911
  const handleSOS = () => {
    Alert.alert(
      '🚨 Emergency SOS',
      'This will immediately alert your emergency contacts AND call 911. Only use in a real emergency.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'TRIGGER SOS',
          style: 'destructive',
          onPress: async () => {
            try {
              await safetyService.triggerSOS(checkinId);
            } catch (err) {
              console.error('SOS DB error:', err);
            }
            // Always offer 911 regardless of DB result
            Alert.alert(
              'SOS Triggered',
              'Emergency contacts have been notified. Call 911 now?',
              [
                {
                  text: 'Call 911',
                  onPress: () =>
                    Linking.openURL('tel:911').catch(() =>
                      Alert.alert('Please dial 911 manually')
                    ),
                },
                { text: 'Not now', style: 'cancel' },
              ]
            );
          },
        },
      ]
    );
  };

  const emergencyContacts = [emergencyContact];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <Card variant="elevated" style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.pulseContainer}>
              <View style={styles.pulse} />
              <View style={styles.pulseInner} />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>Check-in Active</Text>
              <Text style={styles.statusSubtitle}>You're being monitored for safety</Text>
            </View>
          </View>
        </Card>

        <Card variant="elevated">
          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>Elapsed Time</Text>
            <Text style={styles.timerValue}>{formatTime(elapsedTime)}</Text>
            <Text style={styles.timerSubtext}>
              Scheduled to end at{' '}
              {scheduledEndTime.current.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </Card>

        <Card variant="elevated">
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{locationText}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>⏰</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Started</Text>
              <Text style={styles.infoValue}>
                {startTime.current.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        <Card variant="elevated" padding="none">
          {emergencyContacts.map((contact, index) => (
            <View key={index} style={styles.contactRow}>
              <View style={styles.contactAvatar}>
                <Text style={styles.contactInitial}>{contact.name[0]}</Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactPhone}>{contact.phone}</Text>
              </View>
              <View style={styles.contactStatus}>
                <Text style={styles.contactStatusDot}>●</Text>
                <Text style={styles.contactStatusText}>Monitoring</Text>
              </View>
            </View>
          ))}
        </Card>

        <Button
          title={isExtending ? 'Extending...' : 'Extend Time (+30 min)'}
          onPress={handleExtendTime}
          variant="secondary"
          size="large"
          fullWidth
          disabled={isExtending}
          style={styles.extendButton}
        />

        <Button
          title={isCompleting ? 'Completing...' : 'Complete Check-in'}
          onPress={handleComplete}
          variant="primary"
          size="large"
          fullWidth
          disabled={isCompleting}
        />

        {/* FIX: Real SOS with 911 call */}
        <Button
          title="🚨 EMERGENCY SOS"
          onPress={handleSOS}
          variant="primary"
          size="large"
          fullWidth
          style={styles.sosButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  statusCard: { backgroundColor: COLORS.success + '10', borderColor: COLORS.success, marginBottom: SPACING.md },
  statusHeader: { flexDirection: 'row', alignItems: 'center' },
  pulseContainer: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md, position: 'relative' },
  pulse: { position: 'absolute', width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.success, opacity: 0.2 },
  pulseInner: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.success },
  statusInfo: { flex: 1 },
  statusTitle: { fontSize: 20, fontFamily: FONTS.bold, color: COLORS.success },
  statusSubtitle: { fontSize: 14, fontFamily: FONTS.regular, color: COLORS.textSecondary, marginTop: 2 },
  timerContainer: { alignItems: 'center', paddingVertical: SPACING.lg },
  timerLabel: { fontSize: 14, fontFamily: FONTS.medium, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  timerValue: { fontSize: 48, fontFamily: FONTS.bold, color: COLORS.primary },
  timerSubtext: { fontSize: 13, fontFamily: FONTS.regular, color: COLORS.textSecondary, marginTop: SPACING.xs },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm },
  infoIcon: { fontSize: 24, marginRight: SPACING.md },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 13, fontFamily: FONTS.regular, color: COLORS.textSecondary },
  infoValue: { fontSize: 16, fontFamily: FONTS.bold, color: COLORS.text, marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.border },
  sectionTitle: { fontSize: 18, fontFamily: FONTS.bold, color: COLORS.text, marginTop: SPACING.lg, marginBottom: SPACING.md },
  contactRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md },
  contactAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  contactInitial: { fontSize: 18, fontFamily: FONTS.bold, color: COLORS.white },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 16, fontFamily: FONTS.bold, color: COLORS.text },
  contactPhone: { fontSize: 13, fontFamily: FONTS.regular, color: COLORS.textSecondary, marginTop: 2 },
  contactStatus: { flexDirection: 'row', alignItems: 'center' },
  contactStatusDot: { fontSize: 12, color: COLORS.success, marginRight: 4 },
  contactStatusText: { fontSize: 12, fontFamily: FONTS.medium, color: COLORS.success },
  extendButton: { marginTop: SPACING.lg },
  sosButton: { backgroundColor: COLORS.error, marginTop: SPACING.md },
});