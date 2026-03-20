import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DailyMediaView, DailyCall, DailyEventObjectParticipant, DailyParticipant } from '@daily-co/react-native-daily-js';
import { MatchesStackParamList } from '../../navigation/MatchesNavigator';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../utils/constants';
import { callService } from '../../services';
import { useAuthStore } from '../../store';

type CallScreenProps = {
    route: RouteProp<MatchesStackParamList, 'Call'>;
    navigation: NativeStackNavigationProp<MatchesStackParamList, 'Call'>;
};

const { width } = Dimensions.get('window');

export default function CallScreen({ route, navigation }: CallScreenProps) {
    const { matchId, partnerName, callType, sessionId: initialSessionId } = route.params;
    const { user } = useAuthStore();

    const [callObject, setCallObject] = useState<DailyCall | null>(null);
    const [callState, setCallState] = useState<'connecting' | 'ringing' | 'connected' | 'ended'>('connecting');
    const [participants, setParticipants] = useState<Record<string, DailyParticipant>>({});
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(callType === 'voice');
    const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId);

    const localParticipant = Object.values(participants).find(p => p.local);
    const remoteParticipant = Object.values(participants).find(p => !p.local);

    useEffect(() => {
        const initCall = async () => {
            try {
                const co = callService.getCallObject();
                setCallObject(co);

                // Setup listeners
                co.on('joined-meeting', (event) => {
                    setCallState('connected');
                    setParticipants(co.participants());
                });

                co.on('participant-joined', (event) => {
                    setParticipants(co.participants());
                });

                co.on('participant-updated', (event) => {
                    setParticipants(co.participants());
                });

                co.on('participant-left', (event) => {
                    setParticipants(co.participants());
                });

                co.on('left-meeting', () => {
                    navigation.goBack();
                });

                co.on('error', (event) => {
                    console.error('Call Error:', event);
                    Alert.alert('Call Error', 'Something went wrong with the connection.');
                    navigation.goBack();
                });

                // 1. If we are initiating the call
                if (!initialSessionId) {
                    const response = await callService.initiateCall(matchId, callType);
                    if (response.success && response.data) {
                        setSessionId(response.data.id);
                        await co.join({
                            url: response.data.daily_url!,
                            userName: user?.first_name || 'User',
                            videoSource: callType === 'video',
                        });
                    } else {
                        throw new Error(response.message);
                    }
                }
                // 2. If we are joining an existing call (incoming)
                else {
                    // In a real app, we'd fetch the session to get the URL
                    const roomUrl = `https://your-domain.daily.co/match_${matchId.substring(0, 8)}`;
                    await co.join({
                        url: roomUrl,
                        userName: user?.first_name || 'User',
                        videoSource: callType === 'video',
                    });
                }

            } catch (error: any) {
                console.error('Failed to start call:', error);
                Alert.alert('Error', error.message || 'Failed to connect to call');
                navigation.goBack();
            }
        };

        initCall();

        return () => {
            if (callObject) {
                callObject.leave();
            }
        };
    }, []);

    const handleEndCall = async () => {
        if (sessionId) {
            await callService.endCall(sessionId);
        }
        await callObject?.leave();
        navigation.goBack();
    };

    const toggleMute = () => {
        const newState = !isMuted;
        callObject?.setLocalAudio(!newState);
        setIsMuted(newState);
    };

    const toggleVideo = () => {
        const newState = !isVideoOff;
        callObject?.setLocalVideo(!newState);
        setIsVideoOff(newState);
    };

    const renderVideo = (participant: DailyParticipant, isLocal: boolean) => {
        const videoTrack = participant?.tracks?.video;
        if (callType === 'voice' || (isLocal && isVideoOff) || (!isLocal && !videoTrack?.persistentTrack)) {
            return (
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{participant?.user_name?.charAt(0) || '?'}</Text>
                </View>
            );
        }

        return (
            <DailyMediaView
                videoTrack={videoTrack.persistentTrack}
                audioTrack={participant.tracks.audio.persistentTrack}
                style={isLocal ? styles.localVideo : styles.remoteVideo}
                objectFit="cover"
                mirror={isLocal}
            />
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.partnerName}>{partnerName}</Text>
                <Text style={styles.callStatus}>
                    {callState === 'connecting' ? 'Connecting...' : callType.toUpperCase() + ' CALL'}
                </Text>
            </View>

            <View style={styles.videoContainer}>
                {/* Remote Video (Main) */}
                <View style={styles.remoteVideoWrapper}>
                    {remoteParticipant ? renderVideo(remoteParticipant, false) : (
                        <View style={styles.waitingContainer}>
                            <ActivityIndicator color={COLORS.primary} size="large" />
                            <Text style={styles.waitingText}>Waiting for {partnerName}...</Text>
                        </View>
                    )}
                </View>

                {/* Local Video (Floating) */}
                {callType === 'video' && (
                    <View style={styles.localVideoWrapper}>
                        {localParticipant && renderVideo(localParticipant, true)}
                    </View>
                )}
            </View>

            <View style={styles.controls}>
                <TouchableOpacity
                    style={[styles.controlButton, isMuted && styles.activeControl]}
                    onPress={toggleMute}
                >
                    <Text style={styles.controlIcon}>{isMuted ? '🔇' : '🎤'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.controlButton, styles.endButton]}
                    onPress={handleEndCall}
                >
                    <Text style={styles.controlIcon}>📞</Text>
                </TouchableOpacity>

                {callType === 'video' && (
                    <TouchableOpacity
                        style={[styles.controlButton, isVideoOff && styles.activeControl]}
                        onPress={toggleVideo}
                    >
                        <Text style={styles.controlIcon}>{isVideoOff ? '📷' : '📹'}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
        zIndex: 10,
    },
    partnerName: {
        color: '#fff',
        fontSize: 24,
        fontFamily: FONTS.bold,
    },
    callStatus: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        marginTop: SPACING.xs,
        letterSpacing: 2,
    },
    videoContainer: {
        flex: 1,
        position: 'relative',
    },
    remoteVideoWrapper: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    remoteVideo: {
        width: '100%',
        height: '100%',
    },
    localVideoWrapper: {
        position: 'absolute',
        bottom: SPACING.xl,
        right: SPACING.xl,
        width: width * 0.3,
        height: (width * 0.3) * 1.5,
        borderRadius: BORDER_RADIUS.md,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        backgroundColor: '#333',
    },
    localVideo: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 48,
        fontFamily: FONTS.bold,
    },
    waitingContainer: {
        alignItems: 'center',
    },
    waitingText: {
        color: '#fff',
        marginTop: SPACING.md,
        fontFamily: FONTS.medium,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SPACING.xl * 2,
        gap: SPACING.xl,
    },
    controlButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeControl: {
        backgroundColor: '#fff',
    },
    endButton: {
        backgroundColor: COLORS.error,
        transform: [{ rotate: '135deg' }],
    },
    controlIcon: {
        fontSize: 24,
    },
});
