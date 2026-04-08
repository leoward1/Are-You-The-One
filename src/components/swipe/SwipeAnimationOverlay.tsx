import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Audio } from 'expo-av';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../utils/constants';
import LottieAnimation from '../ui/LottieAnimation';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export type SwipeAnimationType = 'rose' | 'kiss' | 'pass' | 'match' | null;

interface SwipeAnimationOverlayProps {
    type: SwipeAnimationType;
    visible: boolean;
    onFinish: () => void;
    matchedUserName?: string;
    matchedUserPhoto?: string;
    soundEnabled?: boolean;
}

// --- PLACEHOLDER ASSETS ---
// TODO: Replace these URIs with local requires once you drop your custom files into src/assets/!
// Example: const ASSETS = { rose: require('../../assets/animations/rose.json'), ... }
const ASSETS = {
    animations: {
        rose: { uri: 'https://raw.githubusercontent.com/LottieFiles/lottie-react-native/master/example/js/animations/Watermelon.json' }, // placeholder
        kiss: { uri: 'https://raw.githubusercontent.com/LottieFiles/lottie-react-native/master/example/js/animations/Watermelon.json' }, // placeholder
        match: { uri: 'https://raw.githubusercontent.com/LottieFiles/lottie-react-native/master/example/js/animations/Watermelon.json' }, // placeholder
        pass: { uri: 'https://raw.githubusercontent.com/LottieFiles/lottie-react-native/master/example/js/animations/Watermelon.json' }, // placeholder
    },
    sounds: {
        pop: { uri: 'https://s3.amazonaws.com/freecodecamp/drums/Heater-1.mp3' }, // Generic pop
        success: { uri: 'https://s3.amazonaws.com/freecodecamp/drums/Chord_1.mp3' }, // Generic success
        error: { uri: 'https://s3.amazonaws.com/freecodecamp/drums/Kick_n_Hat.mp3' } // Generic pass sound
    }
};

// Hook to play sounds easily
function usePlaySound(source: any, soundEnabled: boolean = true) {
    useEffect(() => {
        if (!soundEnabled) return;
        let soundObject: Audio.Sound | null = null;
        async function play() {
            try {
                const { sound } = await Audio.Sound.createAsync(source);
                soundObject = sound;
                await sound.playAsync();
            } catch (error) {
                console.log('Failed to play sound', error);
            }
        }
        play();
        return () => {
            if (soundObject) soundObject.unloadAsync();
        };
    }, [soundEnabled]);
}

const RoseAnimation = ({ onFinish, soundEnabled }: { onFinish: () => void; soundEnabled: boolean }) => {
    usePlaySound(ASSETS.sounds.pop, soundEnabled);
    useEffect(() => {
        const timer = setTimeout(onFinish, 2500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <Animated.View style={styles.fullOverlay} entering={FadeIn.duration(200)} exiting={FadeOut.duration(300)}>
            <LottieAnimation source={ASSETS.animations.rose} style={styles.fullscreenLottie} loop={false} />
            <View style={styles.centerBadge}>
                <Text style={styles.centerEmoji}>🌹</Text>
                <Text style={styles.centerLabel}>Rose Sent!</Text>
            </View>
        </Animated.View>
    );
};

const KissAnimation = ({ onFinish, soundEnabled }: { onFinish: () => void; soundEnabled: boolean }) => {
    usePlaySound(ASSETS.sounds.pop, soundEnabled);
    useEffect(() => {
        const timer = setTimeout(onFinish, 2200);
        return () => clearTimeout(timer);
    }, []);

    return (
        <Animated.View style={styles.fullOverlay} entering={FadeIn.duration(200)} exiting={FadeOut.duration(300)}>
            <LottieAnimation source={ASSETS.animations.kiss} style={styles.fullscreenLottie} loop={false} />
            <View style={styles.centerBadge}>
                <Text style={styles.centerEmoji}>💋</Text>
                <Text style={styles.centerLabel}>Kiss Sent!</Text>
            </View>
        </Animated.View>
    );
};

const PassAnimation = ({ onFinish, soundEnabled }: { onFinish: () => void; soundEnabled: boolean }) => {
    usePlaySound(ASSETS.sounds.error, soundEnabled);
    useEffect(() => {
        const timer = setTimeout(onFinish, 1300);
        return () => clearTimeout(timer);
    }, []);

    return (
        <Animated.View style={[styles.fullOverlay, { backgroundColor: 'rgba(255, 59, 48, 0.15)' }]} entering={FadeIn.duration(150)} exiting={FadeOut.duration(200)}>
             <LottieAnimation source={ASSETS.animations.pass} style={styles.fullscreenLottie} loop={false} />
        </Animated.View>
    );
};

const MatchAnimation = ({ onFinish, matchedUserName, soundEnabled }: { onFinish: () => void; matchedUserName?: string; soundEnabled: boolean }) => {
    usePlaySound(ASSETS.sounds.success, soundEnabled);
    
    return (
        <Animated.View style={[styles.fullOverlay, styles.matchOverlay]} entering={FadeIn.duration(300)} exiting={FadeOut.duration(400)}>
            <LottieAnimation source={ASSETS.animations.match} style={styles.fullscreenLottie} loop={true} />
            
            <View style={styles.matchContent}>
                <Text style={styles.matchEmoji}>💕</Text>
                <Text style={styles.matchTitle}>It's a Match!</Text>
                {matchedUserName && (
                    <Text style={styles.matchSubtitle}>You and {matchedUserName} liked each other!</Text>
                )}
                <TouchableOpacity style={styles.matchButton} onPress={onFinish}>
                    <Text style={styles.matchButtonText}>Keep Swiping</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.matchButton, styles.matchButtonSecondary]} onPress={onFinish}>
                    <Text style={[styles.matchButtonText, styles.matchButtonTextSecondary]}>Send a Message</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

export default function SwipeAnimationOverlay({ type, visible, onFinish, matchedUserName, soundEnabled = true }: SwipeAnimationOverlayProps) {
    if (!visible || !type) return null;

    switch (type) {
        case 'rose': return <RoseAnimation onFinish={onFinish} soundEnabled={soundEnabled} />;
        case 'kiss': return <KissAnimation onFinish={onFinish} soundEnabled={soundEnabled} />;
        case 'pass': return <PassAnimation onFinish={onFinish} soundEnabled={soundEnabled} />;
        case 'match': return <MatchAnimation onFinish={onFinish} matchedUserName={matchedUserName} soundEnabled={soundEnabled} />;
        default: return null;
    }
}

const styles = StyleSheet.create({
    fullOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    fullscreenLottie: {
        ...StyleSheet.absoluteFillObject,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        position: 'absolute',
        zIndex: 1
    },
    matchOverlay: {
        backgroundColor: 'rgba(139, 21, 56, 0.85)',
    },
    centerBadge: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: BORDER_RADIUS.xl,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.lg,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
        zIndex: 10,
    },
    centerEmoji: { fontSize: 48, marginBottom: SPACING.sm },
    centerLabel: { fontSize: 22, fontFamily: FONTS.bold, color: COLORS.primary },
    matchContent: { alignItems: 'center', paddingHorizontal: SPACING.xl, zIndex: 10 },
    matchEmoji: { fontSize: 72, marginBottom: SPACING.md },
    matchTitle: {
        fontSize: 40, fontFamily: FONTS.bold, color: COLORS.white,
        textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8, marginBottom: SPACING.sm,
    },
    matchSubtitle: {
        fontSize: 18, fontFamily: FONTS.regular, color: 'rgba(255,255,255,0.9)',
        textAlign: 'center', marginBottom: SPACING.xl,
    },
    matchButton: {
        backgroundColor: COLORS.white, paddingHorizontal: SPACING.xl * 1.5,
        paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.full,
        marginBottom: SPACING.md, minWidth: 220, alignItems: 'center',
    },
    matchButtonText: { color: COLORS.primary, fontFamily: FONTS.bold, fontSize: 17 },
    matchButtonSecondary: { backgroundColor: 'transparent', borderWidth: 2, borderColor: COLORS.white },
    matchButtonTextSecondary: { color: COLORS.white },
});
