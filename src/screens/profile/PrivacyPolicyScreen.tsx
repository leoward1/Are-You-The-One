import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONTS } from '../../utils/constants';

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.appName}>Are You The One?</Text>
        <Text style={styles.lastUpdated}>Effective Date: March 2026</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.text}>
            We collect:{"\n\n"}
            <Text style={styles.subTitle}>Personal Information:</Text>{"\n"}
            • Name{"\n"}
            • Age{"\n"}
            • Email address{"\n"}
            • Phone number{"\n"}
            • Profile photos{"\n"}
            • Location data{"\n\n"}
            <Text style={styles.subTitle}>Verification Data:</Text>{"\n"}
            • Selfie verification data{"\n"}
            • Optional ID verification{"\n\n"}
            <Text style={styles.subTitle}>Usage Data:</Text>{"\n"}
            • App activity{"\n"}
            • Matches and interactions{"\n"}
            • Device and log information
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. How We Use Information</Text>
          <Text style={styles.text}>
            We use your data to:{"\n"}
            • Create and manage your account{"\n"}
            • Provide matching and compatibility services{"\n"}
            • Improve user experience{"\n"}
            • Ensure safety and prevent fraud{"\n"}
            • Communicate updates and notifications
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Data Sharing</Text>
          <Text style={styles.text}>
            We do NOT sell your personal data.{"\n\n"}
            We may share data with:{"\n"}
            • Verification service providers{"\n"}
            • Payment processors{"\n"}
            • Legal authorities when required
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Data Security</Text>
          <Text style={styles.text}>
            We implement:{"\n"}
            • Encryption{"\n"}
            • Secure storage{"\n"}
            • Access controls{"\n\n"}
            However, no system is 100% secure.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. User Control</Text>
          <Text style={styles.text}>
            You may:{"\n"}
            • Edit your profile{"\n"}
            • Delete your account{"\n"}
            • Request data deletion
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Location Data</Text>
          <Text style={styles.text}>
            We use location data to:{"\n"}
            • Show relevant matches{"\n"}
            • Improve experience{"\n\n"}
            You can control location permissions in your device settings.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Cookies & Tracking</Text>
          <Text style={styles.text}>
            We may use cookies and similar technologies for:{"\n"}
            • Analytics{"\n"}
            • Performance{"\n"}
            • User experience
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Third-Party Services</Text>
          <Text style={styles.text}>
            We may use third-party providers for:{"\n"}
            • Payments{"\n"}
            • Identity verification{"\n"}
            • Analytics
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Children’s Privacy</Text>
          <Text style={styles.text}>
            This app is not intended for users under 18.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Updates</Text>
          <Text style={styles.text}>
            We may update this policy. Continued use means acceptance.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  title: { fontSize: 28, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: 4 },
  appName: { fontSize: 18, fontFamily: FONTS.semiBold, color: COLORS.primary, marginBottom: 8 },
  lastUpdated: { fontSize: 14, fontFamily: FONTS.regular, color: COLORS.textSecondary, marginBottom: SPACING.xl },
  section: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: 18, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SPACING.sm },
  subTitle: { fontSize: 16, fontFamily: FONTS.semiBold, color: COLORS.text },
  text: { fontSize: 15, fontFamily: FONTS.regular, color: COLORS.textSecondary, lineHeight: 22 },
});
