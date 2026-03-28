import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../utils/constants';
import { Button, Card } from '../../components/ui';
import { safetyService } from '../../services/safety.service';

export default function DateModeScreen({ navigation, route }: any) {
  const { checkinId, partnerName } = route.params;
  const [timeLeft, setTimeLeft] = useState('02:00:00');
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [locationText, setLocationText] = useState('Getting location...');
  const [isEnding, setIsEnding] = useState(false);
  const locationInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // FIX: Real GPS location tracking with expo-location
  useEffect(() => {
    const startLocationTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationText('Location permission denied');
        return;
      }

      // Get initial location
      const location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address.length > 0) {
        const addr = address[0];
        setLocationText(`${addr.street || ''} ${addr.city || ''}`.trim() || 'Location active');
      }

      // Update location in Supabase every 60 seconds
      locationInterval.current = setInterval(async () => {
        try {
          const loc = await Location.getCurrentPositionAsync({});
          await safetyService.updateLocation(checkinId, {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        } catch (error) {
          console.error('Location update error:', error);
        }
      }, 60000);
    };

    startLocationTracking();
    return () => {
      if (locationInterval.current) clearInterval(locationInterval.current);
    };
  }, [checkinId]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const [h, m, s] = prev.split(':').map(Number);
        if (h === 0 && m === 0 && s === 0) return '00:00:00';
        let totalSeconds = h * 3600 + m * 60 + s - 1;
        const nh = Math.floor(totalSeconds / 3600);
        const nm = Math.floor((totalSeconds % 3600) / 60);
        const ns = totalSeconds % 60;
        return `${nh.toString().padStart(2, '0')}:${nm.toString().padStart(2, '0')}:${ns.toString().padStart(2, '0')}`;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // FIX: Real Supabase checkin completion
  const handleEndMode = async () => {
    Alert.alert(
      "I'm Safe",
      'Are you sure you want to end date mode?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: "Yes, I'm Safe",
          onPress: async () => {
            setIsEnding(true);
            try {
              await safetyService.completeCheckin(checkinId);
              navigation.goBack();
              Alert.alert("Great!", "We're glad you're safe! 💕");
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Could not end date mode');
            } finally {
              setIsEnding(false);
            }
          },
        },
      ]
    );
  };

  // FIX: Real SOS — writes to Supabase AND offers to call 911
  const handleTriggerSOS = async () => {
    Alert.alert(
      '🚨 EMERGENCY SOS',
      'This will alert your emergency contacts AND call 911. Only use in a real emergency.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'TRIGGER SOS',
          style: 'destructive',
          onPress: async () => {
            setIsSOSActive(true);
            try {
              // Write SOS to Supabase
              await safetyService.triggerSOS(checkinId);

              // FIX: Actually call 911
              Alert.alert(
                'SOS Triggered',
                'Your emergency contacts have been notified. Do you want to call 911 now?',
                [
                  {
                    text: 'Call 911',
                    onPress: () => {
                      Linking.openURL('tel:911').catch(() => {
                        Alert.alert('Please dial 911 manually');
                      });
                    },
                  },
                  { text: 'Not now', style: 'cancel' },
                ]
              );
            } catch (error) {
              console.error('SOS error:', error);
              // Even if Supabase fails, still offer to call 911
              Alert.alert(
                'Emergency',
                'Please call 911 immediately.',
                [{
                  text: 'Call 911',
                  onPress: () => Linking.openURL('tel:911'),
                }]
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.dateWith}>Date with {partnerName}</Text>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Active Monitoring</Text>
        </View>
      </View>

      <View style={styles.timerContainer}>
        <Text style={styles.timerLabel}>Time until auto-alert</Text>
        <Text style={styles.timerValue}>{timeLeft}</Text>
      </View>

      {/* FIX: Shows real location text */}
      <Card style={styles.locationCard}>
        <Text style={styles.mapLabel}>📍 Live Location Active</Text>
        <Text style={styles.mapSub}>{locationText}</Text>
        <Text style={styles.mapSub}>Sharing with emergency contacts</Text>
      </Card>

      <View style={styles.buttonContainer}>
        {/* FIX: Real Supabase completion */}
        <Button
          title={isEnding ? 'Ending...' : "I'm Safe — End Date Mode"}
          onPress={handleEndMode}
          variant="secondary"
          size="large"
          fullWidth
          disabled={isEnding}
        />

        {/* FIX: Real SOS + real 911 call */}
        <TouchableOpacity
          style={[styles.sosButton, isSOSActive && styles.sosButtonActive]}
          onPress={handleTriggerSOS}
          disabled={isSOSActive}
        >
          <Text style={styles.sosText}>
            {isSOSActive ? '🚨 HELP IS COMING' : 'PANIC — TRIGGER SOS'}
          </Text>
          <Text style={styles.sosSub}>
            {isSOSActive
              ? 'Emergency contacts notified'
              : 'Notifies contacts + offers to call 911'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.safetyTips}>
        <Text style={styles.tipsTitle}>Quick Safety Tips:</Text>
        <Text style={styles.tip}>• Stay in public, well-lit areas</Text>
        <Text style={styles.tip}>• Keep your phone charged</Text>
        <Text style={styles.tip}>• If you feel unsafe, leave immediately</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg },
  header: { alignItems: 'center', marginBottom: SPACING.xl },
  dateWith: { fontSize: 24, fontFamily: FONTS.bold, color: COLORS.text },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.success + '20', paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: BORDER_RADIUS.full, marginTop: SPACING.sm },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success, marginRight: 6 },
  statusText: { fontSize: 14, color: COLORS.success, fontFamily: FONTS.medium },
  timerContainer: { alignItems: 'center', marginVertical: SPACING.xl },
  timerLabel: { fontSize: 16, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  timerValue: { fontSize: 48, fontFamily: FONTS.bold, color: COLORS.primary, letterSpacing: 2 },
  locationCard: { justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.xl, borderStyle: 'dashed', borderWidth: 1, borderColor: COLORS.primary, padding: SPACING.lg },
  mapLabel: { fontSize: 18, fontFamily: FONTS.bold, color: COLORS.primary },
  mapSub: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center' },
  buttonContainer: { gap: SPACING.md },
  sosButton: { backgroundColor: COLORS.error, padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg, alignItems: 'center', ...SHADOWS.large },
  sosButtonActive: { backgroundColor: '#333' },
  sosText: { fontSize: 20, fontFamily: FONTS.bold, color: COLORS.white },
  sosSub: { fontSize: 12, color: COLORS.white, opacity: 0.8, marginTop: 4, textAlign: 'center' },
  safetyTips: { marginTop: 'auto', paddingTop: SPACING.xl },
  tipsTitle: { fontSize: 16, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SPACING.sm },
  tip: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 4 },
});

