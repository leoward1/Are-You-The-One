import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../utils/constants';
import { Button } from '../../components/ui';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;
};

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#8B1538', '#FF6B9D', '#FFB3C6']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>💕</Text>
              <Text style={styles.title}>Are You</Text>
              <Text style={styles.titleAccent}>The One?</Text>
            </View>
            
            <Text style={styles.tagline}>
              Where real connections begin
            </Text>
            
            <View style={styles.features}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🌹</Text>
                <Text style={styles.featureText}>Send Roses to show interest</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>💋</Text>
                <Text style={styles.featureText}>Kiss to make it official</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🛡️</Text>
                <Text style={styles.featureText}>Safety check-ins for dates</Text>
              </View>
            </View>
          </View>

          <View style={styles.buttons}>
            <Button
              title="Create Account"
              onPress={() => navigation.navigate('Signup')}
              variant="secondary"
              size="large"
              fullWidth
              style={styles.createButton}
            />
            
            <Button
              title="Sign In"
              onPress={() => navigation.navigate('Login')}
              variant="ghost"
              size="large"
              fullWidth
              textStyle={styles.signInText}
            />
            
            <Text style={styles.termsText}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoEmoji: {
    fontSize: 80,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 42,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    textAlign: 'center',
  },
  titleAccent: {
    fontSize: 48,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 18,
    fontFamily: FONTS.regular,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  features: {
    gap: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.white,
    opacity: 0.95,
  },
  buttons: {
    gap: SPACING.md,
  },
  createButton: {
    backgroundColor: COLORS.white,
  },
  signInText: {
    color: COLORS.white,
  },
  termsText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.white,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});
