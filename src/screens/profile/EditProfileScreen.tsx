import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, INTERESTS } from '../../utils/constants';
import { Button, Input, Badge } from '../../components/ui';
import { useAuthStore } from '../../store';

export default function EditProfileScreen() {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    bio: user?.bio || '',
    city: user?.city || '',
    occupation: user?.occupation || '',
    height: user?.height || '',
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user?.interests || []);
  const [photos, setPhotos] = useState<string[]>(user?.photos?.map(p => p.url) || []);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddPhoto = () => {
    Alert.alert('Add Photo', 'Photo picker will be implemented here');
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
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
            <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
              <Text style={styles.addPhotoIcon}>+</Text>
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>
          )}
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
            <TouchableOpacity
              key={interest}
              onPress={() => toggleInterest(interest)}
            >
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  photoContainer: {
    width: 100,
    height: 140,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePhotoText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  addPhotoButton: {
    width: 100,
    height: 140,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  addPhotoIcon: {
    fontSize: 32,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  addPhotoText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfWidth: {
    flex: 1,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  saveButton: {
    marginTop: SPACING.lg,
  },
});
