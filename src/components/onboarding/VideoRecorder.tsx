import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../utils/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface VideoRecorderProps {
  onComplete: (uri: string) => void;
  onCancel: () => void;
}

export const VideoRecorder = ({ onComplete, onCancel }: VideoRecorderProps) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const cameraRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: audioStatus } = await Camera.requestMicrophonePermissionsAsync();
      setHasPermission(cameraStatus === 'granted' && audioStatus === 'granted');
    })();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = () => {
    setSeconds(0);
    timerRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev >= 29) {
          stopRecording();
          return 30;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const startRecording = async () => {
    if (cameraRef.current) {
      try {
        setIsRecording(true);
        startTimer();
        const video = await cameraRef.current.recordAsync({
          maxDuration: 30,
        });
        onComplete(video.uri);
      } catch (err) {
        console.error('Error recording video:', err);
        setIsRecording(false);
        stopTimer();
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
      stopTimer();
    }
  };

  if (hasPermission === null) return <View style={styles.container} />;
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Camera and Microphone permissions are required to record an intro.</Text>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={styles.camera} 
        facing="front"
        mode="video"
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.cancelText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.timer}>{30 - seconds}s remaining</Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity 
              style={[styles.recordButton, isRecording && styles.recordingButton]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <View style={[styles.innerRecord, isRecording && styles.innerRecording]} />
            </TouchableOpacity>
            <Text style={styles.instruction}>
              {isRecording ? 'Tap to stop' : 'Tap to record (up to 30s)'}
            </Text>
          </View>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  timer: {
    color: '#fff',
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  cancelText: {
    color: '#fff',
    fontSize: 24,
  },
  controls: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  recordButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  recordingButton: {
    borderColor: COLORS.error,
  },
  innerRecord: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
  },
  innerRecording: {
    backgroundColor: COLORS.error,
    borderRadius: 4,
    width: 30,
    height: 30,
  },
  instruction: {
    color: '#fff',
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
    padding: SPACING.xl,
    fontFamily: FONTS.regular,
  },
  cancelButton: {
    padding: SPACING.md,
    backgroundColor: '#333',
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'center',
  },
});
