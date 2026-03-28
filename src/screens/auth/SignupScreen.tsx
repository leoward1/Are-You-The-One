import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuthStore } from '../../store';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../utils/constants';
import { Button, Input } from '../../components/ui';
import { analyticsService } from '../../services/analytics.service';

type SignupScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Signup'>;
};

// FIX: Proper age validation using today's date dynamically
const calculateAge = (birthdate: string): number => {
  const today = new Date();
  const birth = new Date(birthdate);
  if (isNaN(birth.getTime())) return 0;
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const isValidDate = (dateStr: string): boolean => {
  if (dateStr.length !== 10) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

export default function SignupScreen({ navigation }: SignupScreenProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    gender: '' as 'male' | 'female' | '',
    birthdate: '',
    city: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signup, isLoading } = useAuthStore();

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.gender) newErrors.gender = 'Please select your gender';

    // FIX: Full age validation
    if (!formData.birthdate) {
      newErrors.birthdate = 'Birthdate is required';
    } else if (!isValidDate(formData.birthdate)) {
      newErrors.birthdate = 'Please enter a valid date (YYYY-MM-DD)';
    } else {
      const age = calculateAge(formData.birthdate);
      if (age < 18) {
        newErrors.birthdate = `You must be 18 or older to join (you are ${age})`;
      } else if (age > 100) {
        newErrors.birthdate = 'Please enter a valid birthdate';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSignup = async () => {
    if (!validateStep2()) return;
    try {
      await signup({
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        gender: formData.gender as 'male' | 'female',
        birthdate: formData.birthdate,
        city: formData.city || '',
      });
      analyticsService.track('sign_up_completed', { method: 'email' });
      navigation.navigate('Onboarding');
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message || 'Please try again');
    }
  };

  const handleBirthdateChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 4) {
      formatted = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
    }
    if (cleaned.length > 6) {
      formatted = formatted.slice(0, 7) + '-' + cleaned.slice(6, 8);
    }
    setFormData({ ...formData, birthdate: formatted.slice(0, 10) });

    // FIX: Live age feedback as user types
    if (formatted.length === 10 && isValidDate(formatted)) {
      const age = calculateAge(formatted);
      if (age < 18 && age > 0) {
        setErrors(prev => ({
          ...prev,
          birthdate: `You must be 18 or older (you are ${age})`,
        }));
      } else {
        setErrors(prev => ({ ...prev, birthdate: '' }));
      }
    }
  };

  const renderGenderSelector = () => (
    <View style={styles.genderContainer}>
      <Text style={styles.label}>I am a</Text>
      <View style={styles.genderButtons}>
        <TouchableOpacity
          style={[
            styles.genderButton,
            formData.gender === 'male' && styles.genderButtonActive,
          ]}
          onPress={() => setFormData({ ...formData, gender: 'male' })}
        >
          <Text style={styles.genderEmoji}>👨</Text>
          <Text style={[
            styles.genderText,
            formData.gender === 'male' && styles.genderTextActive,
          ]}>Man</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.genderButton,
            formData.gender === 'female' && styles.genderButtonActive,
          ]}
          onPress={() => setFormData({ ...formData, gender: 'female' })}
        >
          <Text style={styles.genderEmoji}>👩</Text>
          <Text style={[
            styles.genderText,
            formData.gender === 'female' && styles.genderTextActive,
          ]}>Woman</Text>
        </TouchableOpacity>
      </View>
      {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => step === 1 ? navigation.goBack() : setStep(1)}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.emoji}>💕</Text>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              {step === 1 ? 'Tell us about yourself' : 'Almost there!'}
            </Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, step >= 1 && styles.progressDotActive]} />
            <View style={styles.progressLine} />
            <View style={[styles.progressDot, step >= 2 && styles.progressDotActive]} />
          </View>

          {step === 1 ? (
            <View style={styles.form}>
              <View style={styles.nameRow}>
                <View style={styles.nameInput}>
                  <Input
                    label="First Name"
                    placeholder="John"
                    value={formData.first_name}
                    onChangeText={(text) => setFormData({ ...formData, first_name: text })}
                    error={errors.first_name}
                  />
                </View>
                <View style={styles.nameInput}>
                  <Input
                    label="Last Name"
                    placeholder="Doe"
                    value={formData.last_name}
                    onChangeText={(text) => setFormData({ ...formData, last_name: text })}
                    error={errors.last_name}
                  />
                </View>
              </View>

              <Input
                label="Email"
                placeholder="john@example.com"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />

              <Button
                title="Continue"
                onPress={handleNext}
                size="large"
                fullWidth
              />
            </View>
          ) : (
            <View style={styles.form}>
              <Input
                label="Password"
                placeholder="Create a strong password"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                isPassword
                error={errors.password}
                hint="At least 8 characters"
              />

              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                isPassword
                error={errors.confirmPassword}
              />

              {renderGenderSelector()}

              <Input
                label="Birthdate"
                placeholder="YYYY-MM-DD"
                value={formData.birthdate}
                onChangeText={handleBirthdateChange}
                error={errors.birthdate}
                hint="You must be 18 or older"
                keyboardType="numeric"
              />

              <Button
                title={isLoading ? 'Creating account...' : 'Create Account'}
                onPress={handleSignup}
                loading={isLoading}
                disabled={isLoading}
                size="large"
                fullWidth
              />
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
  },
  backButton: {
    marginBottom: SPACING.md,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontFamily: FONTS.medium,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.border,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.xs,
  },
  form: {
    gap: SPACING.sm,
  },
  nameRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  nameInput: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  genderContainer: {
    marginBottom: SPACING.md,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  genderButton: {
    flex: 1,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  genderButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  genderEmoji: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  genderText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  genderTextActive: {
    color: COLORS.primary,
  },
  errorText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
});