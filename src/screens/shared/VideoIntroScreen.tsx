import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SPACING, FONTS, BORDER_RADIUS } from '@/utils/constants';
import { useColors } from '@/hooks/useColors';
import { supabaseService } from '@/services/supabase.service';
import { supabase } from '@/config/supabase';
import Button from '@/components/ui/Button';

// Maximum recording time in seconds
const MAX_RECORDING_TIME = 30;

export default function VideoIntroScreen() {
  const COLORS = useColors();
  const styles = useMemo(() => makeStyles(COLORS), [COLORS]);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const userId = route.params?.userId; // Passed explicitly for uploading

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const cameraRef = useRef<CameraView>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      if (recordingTime >= MAX_RECORDING_TIME) {
        stopRecording();
      } else {
        timerRef.current = setTimeout(() => setRecordingTime(prev => prev + 1), 1000);
      }
    }
  }, [isRecording, recordingTime]);

  // Request Permissions
  if (!cameraPermission || !micPermission) {
    return <View style={styles.container} />;
  }
  if (!cameraPermission.granted || !micPermission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="videocam-outline" size={64} color={COLORS.primary} style={{ marginBottom: SPACING.md }} />
        <Text style={styles.permissionText}>We need your permission to show the camera and record audio to create your video intro.</Text>
        <Button 
          title={!cameraPermission.granted ? "Grant Camera Permission" : "Grant Microphone Permission"} 
          onPress={!cameraPermission.granted ? requestCameraPermission : requestMicPermission} 
        />
        <Button 
          title="Go Back" 
          variant="ghost" 
          onPress={() => navigation.goBack()} 
          style={{ marginTop: SPACING.md }} 
        />
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const startRecording = async () => {
    if (!cameraRef.current) return;
    try {
      setIsRecording(true);
      setRecordingTime(0);
      const videoRecordPromise = cameraRef.current.recordAsync({ maxDuration: MAX_RECORDING_TIME });
      if (videoRecordPromise) {
        const data = await videoRecordPromise;
        setIsRecording(false);
        setVideoUri(data?.uri || null);
      }
    } catch (e: any) {
      setIsRecording(false);
      Alert.alert('Recording Failed', e.message);
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleRetake = () => {
    setVideoUri(null);
    setRecordingTime(0);
  };

  const handleUpload = async () => {
    if (!videoUri || !userId) return;
    try {
      setIsUploading(true);
      const fileName = `intro_${Date.now()}.mp4`;
      
      // Pass URI directly — service reads via expo-file-system for reliable upload
      const publicUrl = await supabaseService.uploadVideo(userId, videoUri, fileName);
      
      // Update profile with video_intro URL
      await supabaseService.updateUserProfile(userId, { video_intro: publicUrl });
      
      // Also save record to videos table for proper linking
      await supabase.from('videos').upsert({
        user_id: userId,
        url: publicUrl,
        duration_seconds: recordingTime,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      
      Alert.alert('Success!', 'Your video intro has been saved.');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Upload Failed', e.message);
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Preview Mode
  if (videoUri) {
    return (
      <View style={styles.container}>
        <Video
          source={{ uri: videoUri }}
          style={styles.fullScreen}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
        />
        <SafeAreaView style={styles.overlay}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.iconButton} onPress={handleRetake} disabled={isUploading}>
              <Ionicons name="close" size={28} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.bottomBarPreview}>
            <Button 
              title="Retake" 
              variant="outline" 
              onPress={handleRetake} 
              disabled={isUploading} 
              style={{ flex: 1, marginRight: SPACING.sm, borderColor: COLORS.white }}
              textStyle={{ color: COLORS.white }}
            />
            <Button 
              title={isUploading ? "Saving..." : "Save Intro"} 
              onPress={handleUpload} 
              disabled={isUploading} 
              style={{ flex: 1, marginLeft: SPACING.sm }}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Camera Mode
  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.fullScreen} 
        facing={facing} 
        mode="video" 
        ref={cameraRef}
      >
        <SafeAreaView style={styles.overlay}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            {!isRecording && (
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                <Ionicons name="close" size={28} color={COLORS.white} />
              </TouchableOpacity>
            )}
            
            {isRecording && (
              <View style={styles.timerBadge}>
                <View style={styles.recordingDot} />
                <Text style={styles.timerText}>{formatTime(recordingTime)}</Text>
              </View>
            )}

            {!isRecording && (
              <TouchableOpacity style={styles.iconButton} onPress={toggleCameraFacing}>
                <Ionicons name="camera-reverse" size={28} color={COLORS.white} />
              </TouchableOpacity>
            )}
          </View>

          {/* Bottom Bar: Action */}
          <View style={styles.bottomBarCamera}>
            <TouchableOpacity 
              style={styles.recordOuterCircle} 
              onPress={isRecording ? stopRecording : startRecording}
            >
              <View style={[styles.recordInnerCenter, isRecording && styles.recordStopSquare]} />
            </TouchableOpacity>
            {!isRecording && (
              <Text style={styles.hintText}>Tap to record (up to 30s)</Text>
            )}
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const makeStyles = (COLORS: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  permissionText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  fullScreen: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
    marginRight: 6,
  },
  timerText: {
    color: '#fff',
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  bottomBarCamera: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  recordOuterCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  recordInnerCenter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.error, // Red for recording
  },
  recordStopSquare: {
    width: 32,
    height: 32,
    borderRadius: 6,
  },
  hintText: {
    color: COLORS.white,
    fontFamily: FONTS.medium,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottomBarPreview: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
});
