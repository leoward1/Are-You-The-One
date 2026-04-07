import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import { SPACING, FONTS, BORDER_RADIUS, INTERESTS } from '../../utils/constants';
import { useColors } from '../../hooks/useColors';
import { Button, Input, Badge } from '../../components/ui';
import { useAuthStore } from '../../store';
import { supabaseService } from '../../services/supabase.service';
import { supabase } from '../../config/supabase';
import { validateName, validateBio } from '../../utils/validators';
import { sanitizeText } from '../../utils/sanitizer';

export default function EditProfileScreen() {
  const COLORS = useColors();
  const styles = useMemo(() => makeStyles(COLORS), [COLORS]);
  const navigation = useNavigation<any>();
  const { user, updateProfile } = useAuthStore();
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    bio: user?.bio || '',
    city: user?.city || '',
    occupation: user?.occupation || '',
    height: user?.height || '',
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user?.interests || []);
  const [photos, setPhotos] = useState<string[]>(
    user?.photos?.map((p: any) => typeof p === 'string' ? p : p.url).filter(Boolean) || []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // FIX: Real device photo picker + upload to Supabase storage
  const handleAddPhoto = async () => {
    if (photos.length >= 6) {
      Alert.alert('Limit reached', 'You can add a maximum of 6 photos.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Please allow access to your photo library in Settings.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setIsUploadingPhoto(true);

      try {
        const fileName = `photo_${Date.now()}.jpg`;

        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) throw new Error('Not authenticated');

        // Upload to Supabase storage (passes URI — service reads via FileSystem)
        const publicUrl = await supabaseService.uploadPhoto(authUser.id, asset.uri, fileName);

        // Save photo record to photos table
        await supabase.from('photos').insert({
          user_id: authUser.id,
          url: publicUrl,
          is_primary: photos.length === 0,
        });

        // Update primary_photo on profile if this is the first photo
        if (photos.length === 0) {
          await supabase.from('profiles')
            .update({ primary_photo: publicUrl, photo_url: publicUrl })
            .eq('id', authUser.id);
        }

        setPhotos(prev => [...prev, publicUrl]);
        Alert.alert('Success', 'Photo uploaded successfully!');
      } catch (error: any) {
        Alert.alert('Upload failed', error.message || 'Could not upload photo');
      } finally {
        setIsUploadingPhoto(false);
      }
    }
  };

  const handleRemovePhoto = async (index: number) => {
    const photoUrl = photos[index];
    try {
      setPhotos(photos.filter((_, i) => i !== index));
      // Remove from Supabase photos table
      await supabase.from('photos').delete().eq('url', photoUrl);
    } catch (error) {
      console.error('Error removing photo:', error);
    }
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else if (selectedInterests.length < 10) {
      setSelectedInterests([...selectedInterests, interest]);
    } else {
      Alert.alert('Limit Reached', 'You can select up to 10 interests');
    }
  };

  // FIX: Real Supabase profile update
  const handleSave = async () => {
    // SECURITY: Validate before saving
    const firstNameError = validateName(formData.first_name, 'First Name');
    if (firstNameError) {
      Alert.alert('Validation Error', firstNameError);
      return;
    }

    const lastNameError = validateName(formData.last_name, 'Last Name');
    if (lastNameError) {
      Alert.alert('Validation Error', lastNameError);
      return;
    }

    const bioError = validateBio(formData.bio);
    if (bioError) {
      Alert.alert('Validation Error', bioError);
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        first_name: sanitizeText(formData.first_name, 50),
        last_name: sanitizeText(formData.last_name, 50),
        bio: sanitizeText(formData.bio, 500),
        city: sanitizeText(formData.city, 100),
        occupation: sanitizeText(formData.occupation, 100),
        height: formData.height,
        interests: selectedInterests,
      });
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Photos</Text>
        <Text style={styles.sectionSubtitle}>Add at least 3 photos to get more matches</Text>

        <View style={styles.photosGrid}>
          {photos.map((photo, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image source={{ uri: photo }} style={styles.photo} />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => handleRemovePhoto(index)}
              >
                <Text style={styles.removePhotoText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
          {photos.length < 6 && (
            <TouchableOpacity
              style={styles.addPhotoButton}
              onPress={handleAddPhoto}
              disabled={isUploadingPhoto}
            >
              <Text style={styles.addPhotoIcon}>{isUploadingPhoto ? '⏳' : '+'}</Text>
              <Text style={styles.addPhotoText}>
                {isUploadingPhoto ? 'Uploading...' : 'Add Photo'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.sectionTitle}>Video Intro</Text>
        <Text style={styles.sectionSubtitle}>Record a 30s video to stand out!</Text>
        {user?.video_intro ? (
          <View style={styles.videoPreviewContainer}>
            <Video
              source={{ uri: user.video_intro }}
              style={styles.videoPreview}
              resizeMode={ResizeMode.COVER}
              shouldPlay={false}
              isMuted
            />
            <View style={styles.videoOverlay}>
              <Text style={styles.videoPlayIcon}>▶</Text>
            </View>
            <TouchableOpacity
              style={styles.videoUpdateButton}
              onPress={() => navigation.navigate('VideoIntroCamera', { userId: user?.id })}
            >
              <Text style={styles.videoUpdateText}>Update Video Intro</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.addPhotoButton, { width: '100%', marginBottom: SPACING.md }]}
            onPress={() => navigation.navigate('VideoIntroCamera', { userId: user?.id })}
          >
            <Text style={styles.addPhotoIcon}>🎥</Text>
            <Text style={styles.addPhotoText}>Record Video Intro</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>Basic Info</Text>
        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Input
              label="First Name"
              placeholder="First Name"
              value={formData.first_name}
              onChangeText={(text) => setFormData({ ...formData, first_name: text })}
            />
          </View>
          <View style={styles.halfWidth}>
            <Input
              label="Last Name"
              placeholder="Last Name"
              value={formData.last_name}
              onChangeText={(text) => setFormData({ ...formData, last_name: text })}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>About You</Text>

        <Input
          label="Bio"
          placeholder="Tell us about yourself..."
          value={formData.bio}
          onChangeText={(text) => setFormData({ ...formData, bio: text })}
          multiline
          numberOfLines={4}
          hint="Max 500 characters"
        />

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Input
              label="City"
              placeholder="New York"
              value={formData.city}
              onChangeText={(text) => setFormData({ ...formData, city: text })}
            />
          </View>
          <View style={styles.halfWidth}>
            <Input
              label="Height (cm)"
              placeholder="170"
              value={formData.height}
              onChangeText={(text) => setFormData({ ...formData, height: text })}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Input
          label="Occupation"
          placeholder="Software Engineer"
          value={formData.occupation}
          onChangeText={(text) => setFormData({ ...formData, occupation: text })}
        />

        <Text style={styles.sectionTitle}>Interests</Text>
        <Text style={styles.sectionSubtitle}>
          Select up to 10 interests ({selectedInterests.length}/10)
        </Text>

        <View style={styles.interestsContainer}>
          {INTERESTS.map((interest) => (
            <TouchableOpacity key={interest} onPress={() => toggleInterest(interest)}>
              <Badge
                label={interest}
                variant={selectedInterests.includes(interest) ? 'primary' : 'secondary'}
                size="medium"
              />
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title={isSaving ? 'Saving...' : 'Save Changes'}
          onPress={handleSave}
          loading={isSaving}
          disabled={isSaving}
          size="large"
          fullWidth
          style={styles.saveButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  sectionTitle: { fontSize: 20, fontFamily: FONTS.bold, color: COLORS.text, marginTop: SPACING.lg, marginBottom: SPACING.xs },
  sectionSubtitle: { fontSize: 14, fontFamily: FONTS.regular, color: COLORS.textSecondary, marginBottom: SPACING.md },
  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginBottom: SPACING.lg },
  photoContainer: { width: 100, height: 140, position: 'relative' },
  photo: { width: '100%', height: '100%', borderRadius: BORDER_RADIUS.lg, backgroundColor: COLORS.surface },
  removePhotoButton: { position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.error, alignItems: 'center', justifyContent: 'center' },
  removePhotoText: { color: COLORS.white, fontSize: 14, fontFamily: FONTS.bold },
  addPhotoButton: { width: 100, height: 140, borderRadius: BORDER_RADIUS.lg, borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface },
  addPhotoIcon: { fontSize: 32, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  addPhotoText: { fontSize: 12, fontFamily: FONTS.medium, color: COLORS.textSecondary },
  row: { flexDirection: 'row', gap: SPACING.md },
  halfWidth: { flex: 1 },
  interestsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  saveButton: { marginTop: SPACING.lg },
  videoPreviewContainer: { width: '100%', height: 200, borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', marginBottom: SPACING.md, position: 'relative' },
  videoPreview: { width: '100%', height: '100%' },
  videoOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' },
  videoPlayIcon: { fontSize: 48, color: COLORS.white },
  videoUpdateButton: { position: 'absolute', bottom: SPACING.sm, right: SPACING.sm, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.full },
  videoUpdateText: { color: COLORS.white, fontSize: 12, fontFamily: FONTS.medium },
});