import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';

interface LottieAnimationProps {
    source: any;
    autoPlay?: boolean;
    loop?: boolean;
    style?: ViewStyle;
    onAnimationFinish?: () => void;
    speed?: number;
}

export default function LottieAnimation({
    source,
    autoPlay = true,
    loop = false,
    style,
    onAnimationFinish,
    speed = 1,
}: LottieAnimationProps) {
    const animation = useRef<LottieView>(null);

    useEffect(() => {
        if (autoPlay) {
            animation.current?.play();
        }
    }, [autoPlay]);

    return (
        <View style={[styles.container, style]}>
            <LottieView
                ref={animation}
                source={source}
                autoPlay={autoPlay}
                loop={loop}
                style={styles.animation}
                onAnimationFinish={onAnimationFinish}
                speed={speed}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    animation: {
        width: '100%',
        height: '100%',
    },
});
