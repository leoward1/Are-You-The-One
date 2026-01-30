import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../utils/constants';
import { Button, Card } from '../../components/ui';

export default function ActiveCheckinScreen() {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [location, setLocation] = useState('Downtown Coffee Shop');
  const startTime = new Date(Date.now() - 15 * 60 * 1000);
  const scheduledEndTime = new Date(Date.now() + 45 * 60 * 1000);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleComplete = () => {
    Alert.alert(
      'Complete Check-in',
      'Are you sure you want to end this safety check-in?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Complete', onPress: () => {
          Alert.alert('Success', 'Check-in completed. Stay safe!');
        }},
      ]
    );
  };

  const handleSOS = () => {
    Alert.alert(
      'Emergency SOS',
      'This will immediately alert your emergency contacts and local authorities. Only use in a real emergency.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'TRIGGER SOS', style: 'destructive', onPress: () => {
          Alert.alert('SOS Triggered', 'Emergency services have been notified.');
        }},
      ]
    );
  };

  const handleExtendTime = () => {
    Alert.alert('Success', 'Check-in extended by 30 minutes');
  };

  const emergencyContacts = [
    { name: 'Mom', phone: '+1 (555) 123-4567' },
    { name: 'Best Friend', phone: '+1 (555) 987-6543' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
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
              Scheduled to end at {scheduledEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </Card>

        <Card variant="elevated">
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{location}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>⏰</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Started</Text>
              <Text style={styles.infoValue}>
                {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Emergency Contacts Notified</Text>
        <Card variant="elevated" padding="none">
          {emergencyContacts.map((contact, index) => (
            <React.Fragment key={index}>
              <View style={styles.contactRow}>
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
              {index < emergencyContacts.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </Card>

        <Button
          title="Extend Time (+30 min)"
          onPress={handleExtendTime}
          variant="secondary"
          size="large"
          fullWidth
          style={styles.extendButton}
        />

        <Button
          title="Complete Check-in"
          onPress={handleComplete}
          variant="primary"
          size="large"
          fullWidth
        />

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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  statusCard: {
    backgroundColor: COLORS.success + '10',
    borderColor: COLORS.success,
    marginBottom: SPACING.md,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseContainer: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    position: 'relative',
  },
  pulse: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.success,
    opacity: 0.2,
  },
  pulseInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.success,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.success,
  },
  statusSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  timerContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  timerLabel: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  timerValue: {
    fontSize: 48,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  timerSubtext: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  contactInitial: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
  },
  contactPhone: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  contactStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactStatusDot: {
    fontSize: 12,
    color: COLORS.success,
    marginRight: 4,
  },
  contactStatusText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.success,
  },
  extendButton: {
    marginTop: SPACING.lg,
  },
  sosButton: {
    backgroundColor: COLORS.error,
    marginTop: SPACING.md,
  },
});
