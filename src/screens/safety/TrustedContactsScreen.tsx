import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONTS } from '../../utils/constants';
import { Button, Input, Card } from '../../components/ui';
import { useAuthStore } from '../../store';
import { supabase } from '../../config/supabase';

export default function TrustedContactsScreen() {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContact();
  }, []);

  const loadContact = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('user_settings')
        .select('emergency_contact_name, emergency_contact_email, emergency_contact_phone')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setFormData({
          name: data.emergency_contact_name || '',
          email: data.emergency_contact_email || '',
          phone: data.emergency_contact_phone || '',
        });
      }
    } catch (e) {
      // No existing contact yet — start with empty fields
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    if (!formData.name.trim()) {
      Alert.alert('Required', 'Please enter a contact name.');
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          emergency_contact_name: formData.name.trim(),
          emergency_contact_email: formData.email.trim(),
          emergency_contact_phone: formData.phone.trim(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      if (error) throw new Error(error.message);
      Alert.alert('Saved', 'Your trusted contact has been saved successfully.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save contact');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

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
