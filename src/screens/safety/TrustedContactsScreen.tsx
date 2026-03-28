import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONTS } from '../../utils/constants';
import { Button, Input, Card } from '../../components/ui';
import { useAuthStore } from '../../store';

export default function TrustedContactsScreen() {
  const { user, updateProfile } = useAuthStore();
  const [formData, setFormData] = useState({
    name: user?.settings?.emergency_contact_name || '',
    email: user?.settings?.emergency_contact_email || '',
    phone: user?.settings?.emergency_contact_phone || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        settings: {
          ...user?.settings,
          emergency_contact_name: formData.name,
          emergency_contact_email: formData.email,
          emergency_contact_phone: formData.phone,
        },
      } as any);
      Alert.alert('Success', 'Trusted contact updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update contact');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Trusted Contacts</Text>
        <Text style={styles.subtitle}>
          These details will be used to notify your loved ones in case of an emergency.
        </Text>

        <Card variant="elevated">
          <Input
            label="Contact Name"
            placeholder="John Doe"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
          <Input
            label="Contact Email"
            placeholder="john@example.com"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Contact Phone"
            placeholder="+1 234 567 890"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            keyboardType="phone-pad"
          />
        </Card>

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
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.lg },
  title: { fontSize: 24, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SPACING.xs },
  subtitle: { fontSize: 14, fontFamily: FONTS.regular, color: COLORS.textSecondary, marginBottom: SPACING.xl },
  saveButton: { marginTop: SPACING.xl },
});
