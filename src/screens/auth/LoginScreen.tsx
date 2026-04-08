import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuthStore } from '../../store';
import { SPACING, FONTS, BORDER_RADIUS } from '../../utils/constants';
import { useColors } from '../../hooks/useColors';
import { Button, Input } from '../../components/ui';
import { analyticsService } from '../../services/analytics.service';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const COLORS = useColors();
  const styles = useMemo(() => makeStyles(COLORS), [COLORS]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { login, signInWithApple, resetPassword, isLoading, error } = useAuthStore();

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    try {
      await login({ email, password });
      analyticsService.track('sign_up_completed', { method: 'email' }); // Logins use same goal for now
    } catch (err) {
      Alert.alert('Login Failed', error || 'Please check your credentials');
    }
  };

  const handleAppleSignIn = async () => {
    try {
      await signInWithApple();
      analyticsService.track('sign_up_completed', { method: 'apple' });
    } catch (err: any) {
      if ((err as any).code === 'ERR_REQUEST_CANCELED') return;
      Alert.alert('Apple Sign In Failed', err.message || 'Please try again');
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      setEmailError('Please enter your email to reset password');
      return;
    }
    Alert.alert(
      'Reset Password',
      `Send a password reset link to ${email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send Link', 
          onPress: async () => {
            try {
              await resetPassword(email);
              Alert.alert('Check Your Email', 'If an account exists, a password reset link has been sent to your email address.');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Could not send reset link');
            }
          }
        }
      ]
    );
  };

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
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.emoji}>👋</Text>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to find your perfect match</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
            />
            
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              isPassword
              error={passwordError}
            />

            <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title={isLoading ? 'Signing in...' : 'Sign In'}
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              size="large"
              fullWidth
            />
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {Platform.OS === 'ios' && (
            <View style={styles.socialButtons}>
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={BORDER_RADIUS.lg}
                style={styles.appleButton}
                onPress={handleAppleSignIn}
              />
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.linkText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: any) => StyleSheet.create({
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
    marginBottom: SPACING.xl,
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
  form: {
    gap: SPACING.sm,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.md,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  socialButtons: {
    gap: SPACING.md,
  },
  appleButton: {
    width: '100%',
    height: 50,
  },
  socialButton: {
    width: '100%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  socialButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
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
