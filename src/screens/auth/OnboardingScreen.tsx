import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  Animated,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, INTERESTS } from '../../utils/constants';
import { Button, Input, Badge } from '../../components/ui';
import { useAuthStore } from '../../store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const STEPS = [
  { title: 'The Basics', subtitle: 'Tell us a bit about who you are.' },
  { title: 'Interests', subtitle: 'What do you love to do?' },
  { title: 'Photos', subtitle: 'Show your best side! Add at least 3.' },
  { title: 'All Set!', subtitle: 'Ready to find your match?' },
];

export default function OnboardingScreen() {
  const { user, updateProfile } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Onboarding data
  const [bio, setBio] = useState('');
  const [occupation, setOccupation] = useState('');
  const [height, setHeight] = useState('');
  const [city, setCity] = useState(user?.city || '');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);

  // Animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleNext = async () => {
    if (currentStep === 0) {
      if (!bio || !occupation || !height) {
        Alert.alert('Missing Info', 'Please fill in your bio, occupation, and height.');
        return;
      }
    } else if (currentStep === 1) {
      if (selectedInterests.length < 3) {
        Alert.alert('Interests', 'Please select at least 3 interests.');
        return;
      }
    } else if (currentStep === 2) {
      if (photos.length < 3) {
        Alert.alert('Photos', 'Please add at least 3 photos to proceed.');
        return;
      }
    }

    if (currentStep < STEPS.length - 1) {
      animateTransition(() => setCurrentStep(currentStep + 1));
    } else {
      // Final submission
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      animateTransition(() => setCurrentStep(currentStep - 1));
    }
  };

  const animateTransition = (callback: () => void) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      callback();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else if (selectedInterests.length < 10) {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleAddPhoto = () => {
    // Mock photo addition
    const mockPhotos = [
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800',
        'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=800'
    ];
    if (photos.length < 6) {
        setPhotos([...photos, mockPhotos[photos.length % mockPhotos.length]]);
    }
  };

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        bio,
        occupation,
        height,
        city,
        interests: selectedInterests,
        is_onboarded: true,
      });
      // Navigation is handled by auth state change in RootNavigator
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <Input
              label="About Me (Bio)"
              placeholder="What makes you unique?"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              style={styles.bioInput}
            />
            <Input
              label="Occupation"
              placeholder="e.g. Designer, Engineer, Student"
              value={occupation}
              onChangeText={setOccupation}
            />
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: SPACING.md }}>
                <Input
                  label="Height (cm)"
                  placeholder="175"
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1.5 }}>
                <Input
                  label="City"
                  placeholder="New York"
                  value={city}
                  onChangeText={setCity}
                />
              </View>
            </View>
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.interestsGrid}>
              {INTERESTS.map((interest) => (
                <TouchableOpacity
                  key={interest}
                  onPress={() => toggleInterest(interest)}
                  activeOpacity={0.7}
                >
                  <Badge
                    label={interest}
                    variant={selectedInterests.includes(interest) ? 'primary' : 'secondary'}
                    size="medium"
                    style={styles.interestBadge}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.photoGrid}>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.photoBox}
                  onPress={handleAddPhoto}
                >
                  {photos[index] ? (
                    <Image source={{ uri: photos[index] }} style={styles.photoImage} />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Text style={styles.photoAddIcon}>+</Text>
                    </View>
                  )}
                  {photos[index] && (
                    <TouchableOpacity 
                      style={styles.removePhoto}
                      onPress={() => setPhotos(photos.filter((_, i) => i !== index))}
                    >
                      <Text style={styles.removePhotoText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      case 3:
        return (
          <View style={[styles.stepContainer, styles.centerStep]}>
            <View style={styles.congratsCircle}>
              <Text style={styles.congratsEmoji}>🎉</Text>
            </View>
            <Text style={styles.congratsTitle}>You're all set!</Text>
            <Text style={styles.congratsText}>
              Your profile looks amazing. Now let's find that "On" for you.
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={{ flex: 1 }}
        >
      <View style={styles.header}>
        <View style={styles.progressTrack}>
          <Animated.View 
            style={[
              styles.progressBar, 
              { width: `${((currentStep + 1) / STEPS.length) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.title}>{STEPS[currentStep].title}</Text>
        <Text style={styles.subtitle}>{STEPS[currentStep].subtitle}</Text>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {renderStep()}
        </ScrollView>
      </Animated.View>

      <View style={styles.footer}>
        {currentStep > 0 && (
          <Button
            title="Back"
            onPress={handleBack}
            variant="ghost"
            style={styles.backButton}
          />
        )}
        <Button
          title={currentStep === STEPS.length - 1 ? 'Start Matching' : 'Next'}
          onPress={handleNext}
          loading={isLoading}
          size="large"
          fullWidth={currentStep === 0 || currentStep === STEPS.length - 1}
          style={currentStep === 0 ? {} : { flex: 1 }}
        />
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    marginBottom: SPACING.xl,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  content: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  stepContainer: {
    flex: 1,
    gap: SPACING.md,
  },
  row: {
    flexDirection: 'row',
  },
  bioInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  interestBadge: {
    marginBottom: SPACING.xs,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    justifyContent: 'space-between',
  },
  photoBox: {
    width: (SCREEN_WIDTH - SPACING.xl * 2 - SPACING.md * 2) / 3,
    height: 140,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoAddIcon: {
    fontSize: 32,
    color: COLORS.textSecondary,
    fontFamily: FONTS.bold,
  },
  removePhoto: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  centerStep: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.xxl,
  },
  congratsCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: COLORS.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: SPACING.xl,
  },
  congratsEmoji: {
      fontSize: 50,
  },
  congratsTitle: {
      fontSize: 24,
      fontFamily: FONTS.bold,
      color: COLORS.text,
      marginBottom: SPACING.sm,
  },
  congratsText: {
      fontSize: 16,
      fontFamily: FONTS.regular,
      color: COLORS.textSecondary,
      textAlign: 'center',
      paddingHorizontal: SPACING.xl,
  },
  footer: {
    padding: SPACING.xl,
    flexDirection: 'row',
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  backButton: {
    flex: 0.5,
  },
});
