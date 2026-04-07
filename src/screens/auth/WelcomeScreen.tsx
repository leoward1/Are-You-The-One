import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { SPACING, FONTS, BORDER_RADIUS } from '../../utils/constants';
import { useColors } from '../../hooks/useColors';
import { Button } from '../../components/ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;
};

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const COLORS = useColors();
  const styles = useMemo(() => makeStyles(COLORS), [COLORS]);
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/icon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
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
    </View>
  );
}

const makeStyles = (COLORS: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B1538',
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
  logoImage: {
    width: SCREEN_WIDTH * 0.55,
    height: SCREEN_WIDTH * 0.55,
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
