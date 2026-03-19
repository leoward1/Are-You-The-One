import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withSequence,
    withSpring,
    runOnJS,
    Easing,
    FadeIn,
    FadeOut,
} from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../utils/constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export type SwipeAnimationType = 'rose' | 'kiss' | 'pass' | 'match' | null;

interface SwipeAnimationOverlayProps {
    type: SwipeAnimationType;
    visible: boolean;
    onFinish: () => void;
    matchedUserName?: string;
    matchedUserPhoto?: string;
}

// Particle component for rose petals / kiss lips / confetti
const Particle = ({
    emoji,
    startX,
    startY,
    endY,
    delay,
    duration,
    rotation,
    scale,
}: {
    emoji: string;
    startX: number;
    startY: number;
    endY: number;
    delay: number;
    duration: number;
    rotation: number;
    scale: number;
}) => {
    const progress = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        opacity.value = withDelay(delay, withTiming(1, { duration: 200 }));
        progress.value = withDelay(
            delay,
            withTiming(1, {
                duration,
                easing: Easing.out(Easing.quad),
            })
        );
    }, []);

    const particleStyle = useAnimatedStyle(() => {
        const sway = Math.sin(progress.value * Math.PI * 3) * 30;
        return {
            position: 'absolute',
            left: startX + sway,
            top: startY + (endY - startY) * progress.value,
            opacity: opacity.value * (1 - progress.value * 0.6),
            transform: [
                { rotate: `${rotation * progress.value}deg` },
                { scale: scale * (1 - progress.value * 0.3) },
            ],
        };
    });

    return (
        <Animated.View style={particleStyle}>
            <Text style={{ fontSize: 28 }}>{emoji}</Text>
        </Animated.View>
    );
};

// Rose petals animation
const RoseAnimation = ({ onFinish }: { onFinish: () => void }) => {
    const particles = useMemo(() => {
        const items = [];
        for (let i = 0; i < 15; i++) {
            items.push({
                id: i,
                emoji: i % 3 === 0 ? '🌹' : '🌸',
                startX: Math.random() * SCREEN_WIDTH * 0.8 + SCREEN_WIDTH * 0.1,
                startY: -50,
                endY: SCREEN_HEIGHT * 0.8,
                delay: Math.random() * 600,
                duration: 1800 + Math.random() * 800,
                rotation: Math.random() * 360 - 180,
                scale: 0.7 + Math.random() * 0.8,
            });
        }
        return items;
    }, []);

    useEffect(() => {
        const timer = setTimeout(onFinish, 2500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <Animated.View
            style={styles.fullOverlay}
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(300)}
        >
            {particles.map((p) => (
                <Particle key={p.id} {...p} />
            ))}
            <View style={styles.centerBadge}>
                <Text style={styles.centerEmoji}>🌹</Text>
                <Text style={styles.centerLabel}>Rose Sent!</Text>
            </View>
        </Animated.View>
    );
};

// Kiss animation
const KissAnimation = ({ onFinish }: { onFinish: () => void }) => {
    const particles = useMemo(() => {
        const items = [];
        for (let i = 0; i < 12; i++) {
            items.push({
                id: i,
                emoji: i % 2 === 0 ? '💋' : '💗',
                startX: SCREEN_WIDTH / 2 - 20 + (Math.random() - 0.5) * 200,
                startY: SCREEN_HEIGHT / 2,
                endY: SCREEN_HEIGHT / 2 - 200 - Math.random() * 200,
                delay: Math.random() * 400,
                duration: 1200 + Math.random() * 600,
                rotation: Math.random() * 180 - 90,
                scale: 0.6 + Math.random() * 0.9,
            });
        }
        return items;
    }, []);

    useEffect(() => {
        const timer = setTimeout(onFinish, 2200);
        return () => clearTimeout(timer);
    }, []);

    return (
        <Animated.View
            style={styles.fullOverlay}
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(300)}
        >
            {particles.map((p) => (
                <Particle key={p.id} {...p} />
            ))}
            <View style={styles.centerBadge}>
                <Text style={styles.centerEmoji}>💋</Text>
                <Text style={styles.centerLabel}>Kiss Sent!</Text>
            </View>
        </Animated.View>
    );
};

// Pass / reject animation
const PassAnimation = ({ onFinish }: { onFinish: () => void }) => {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(1);

    useEffect(() => {
        scale.value = withSpring(1, { damping: 8, stiffness: 200 });
        opacity.value = withDelay(800, withTiming(0, { duration: 400 }));
        const timer = setTimeout(onFinish, 1300);
        return () => clearTimeout(timer);
    }, []);

    const xStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[styles.fullOverlay, { backgroundColor: 'rgba(255, 59, 48, 0.15)' }]}
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(200)}
        >
            <Animated.View style={[styles.passContainer, xStyle]}>
                <Text style={styles.passX}>✕</Text>
            </Animated.View>
        </Animated.View>
    );
};

// Match confetti animation
const MatchAnimation = ({
    onFinish,
    matchedUserName,
}: {
    onFinish: () => void;
    matchedUserName?: string;
}) => {
    const confettiItems = useMemo(() => {
        const confettiEmojis = ['🎉', '✨', '💕', '🌟', '🎊', '💖', '⭐'];
        const items = [];
        for (let i = 0; i < 20; i++) {
            items.push({
                id: i,
                emoji: confettiEmojis[i % confettiEmojis.length],
                startX: Math.random() * SCREEN_WIDTH,
                startY: -60,
                endY: SCREEN_HEIGHT + 60,
                delay: Math.random() * 1000,
                duration: 2000 + Math.random() * 1000,
                rotation: Math.random() * 720 - 360,
                scale: 0.5 + Math.random() * 1,
            });
        }
        return items;
    }, []);

    const titleScale = useSharedValue(0);

    useEffect(() => {
        titleScale.value = withDelay(300, withSpring(1, { damping: 6, stiffness: 120 }));
    }, []);

    const titleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: titleScale.value }],
    }));

    return (
        <Animated.View
            style={[styles.fullOverlay, styles.matchOverlay]}
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(400)}
        >
            {confettiItems.map((p) => (
                <Particle key={p.id} {...p} />
            ))}

            <Animated.View style={[styles.matchContent, titleStyle]}>
                <Text style={styles.matchEmoji}>💕</Text>
                <Text style={styles.matchTitle}>It's a Match!</Text>
                {matchedUserName && (
                    <Text style={styles.matchSubtitle}>
                        You and {matchedUserName} liked each other!
                    </Text>
                )}
                <TouchableOpacity style={styles.matchButton} onPress={onFinish}>
                    <Text style={styles.matchButtonText}>Keep Swiping</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.matchButton, styles.matchButtonSecondary]}
                    onPress={onFinish}
                >
                    <Text style={[styles.matchButtonText, styles.matchButtonTextSecondary]}>
                        Send a Message
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        </Animated.View>
    );
};

export default function SwipeAnimationOverlay({
    type,
    visible,
    onFinish,
    matchedUserName,
}: SwipeAnimationOverlayProps) {
    if (!visible || !type) return null;

    switch (type) {
        case 'rose':
            return <RoseAnimation onFinish={onFinish} />;
        case 'kiss':
            return <KissAnimation onFinish={onFinish} />;
        case 'pass':
            return <PassAnimation onFinish={onFinish} />;
        case 'match':
            return (
                <MatchAnimation onFinish={onFinish} matchedUserName={matchedUserName} />
            );
        default:
            return null;
    }
}

const styles = StyleSheet.create({
    fullOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
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
    },
    centerEmoji: {
        fontSize: 48,
        marginBottom: SPACING.sm,
    },
    centerLabel: {
        fontSize: 22,
        fontFamily: FONTS.bold,
        color: COLORS.primary,
    },
    passContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 59, 48, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.error,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    passX: {
        fontSize: 64,
        color: COLORS.white,
        fontFamily: FONTS.bold,
    },
    matchContent: {
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
    },
    matchEmoji: {
        fontSize: 72,
        marginBottom: SPACING.md,
    },
    matchTitle: {
        fontSize: 40,
        fontFamily: FONTS.bold,
        color: COLORS.white,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
        marginBottom: SPACING.sm,
    },
    matchSubtitle: {
        fontSize: 18,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },
    matchButton: {
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.xl * 1.5,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.full,
        marginBottom: SPACING.md,
        minWidth: 220,
        alignItems: 'center',
    },
    matchButtonText: {
        color: COLORS.primary,
        fontFamily: FONTS.bold,
        fontSize: 17,
    },
    matchButtonSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    matchButtonTextSecondary: {
        color: COLORS.white,
    },
});
