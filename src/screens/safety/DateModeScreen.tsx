import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../utils/constants';
import { Button, Card } from '../../components/ui';
import { safetyService } from '../../services';

export default function DateModeScreen({ navigation, route }: any) {
    const { checkinId, partnerName } = route.params;
    const [timeLeft, setTimeLeft] = useState('02:00:00');
    const [isSOSActive, setIsSOSActive] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            // Mock countdown logic
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

    const handleEndMode = async () => {
        try {
            await safetyService.completeCheckin(checkinId);
            navigation.goBack();
            Alert.alert('Date Mode Ended', "We're glad you're safe!");
        } catch (error) {
            console.error(error);
        }
    };

    const handleTriggerSOS = async () => {
        setIsSOSActive(true);
        try {
            await safetyService.triggerSOS(checkinId);
            Alert.alert(
                'SOS Triggered',
                'Your emergency contacts and the authorities have been notified of your location.',
                [{ text: 'OK' }]
            );
        } catch (error) {
            console.error(error);
        }
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

            <Card style={styles.mapMock}>
                <Text style={styles.mapLabel}>Live Location Active 📍</Text>
                <Text style={styles.mapSub}>Sharing with 3 trusted contacts</Text>
            </Card>

            <View style={styles.buttonContainer}>
                <Button
                    title="I'm Safe - End Date Mode"
                    onPress={handleEndMode}
                    variant="secondary"
                    size="large"
                    fullWidth
                />

                <TouchableOpacity
                    style={[styles.sosButton, isSOSActive && styles.sosButtonActive]}
                    onPress={handleTriggerSOS}
                >
                    <Text style={styles.sosText}>{isSOSActive ? 'HELP IS COMING' : 'PANIC - TRIGGER SOS'}</Text>
                    <Text style={styles.sosSub}>Notifies emergency services immediately</Text>
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
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: SPACING.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    dateWith: {
        fontSize: 24,
        fontFamily: FONTS.bold,
        color: COLORS.text,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.success + '20',
        paddingHorizontal: SPACING.md,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.full,
        marginTop: SPACING.sm,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.success,
        marginRight: 6,
    },
    statusText: {
        fontSize: 14,
        color: COLORS.success,
        fontFamily: FONTS.medium,
    },
    timerContainer: {
        alignItems: 'center',
        marginVertical: SPACING.xl,
    },
    timerLabel: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
    },
    timerValue: {
        fontSize: 48,
        fontFamily: FONTS.bold,
        color: COLORS.primary,
        letterSpacing: 2,
    },
    mapMock: {
        height: 120,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.xl,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    mapLabel: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: COLORS.primary,
    },
    mapSub: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    buttonContainer: {
        gap: SPACING.md,
    },
    sosButton: {
        backgroundColor: COLORS.error,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        ...SHADOWS.large,
    },
    sosButtonActive: {
        backgroundColor: COLORS.text,
    },
    sosText: {
        fontSize: 20,
        fontFamily: FONTS.bold,
        color: COLORS.white,
    },
    sosSub: {
        fontSize: 12,
        color: COLORS.white,
        opacity: 0.8,
        marginTop: 4,
    },
    safetyTips: {
        marginTop: 'auto',
        paddingTop: SPACING.xl,
    },
    tipsTitle: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    tip: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
});
