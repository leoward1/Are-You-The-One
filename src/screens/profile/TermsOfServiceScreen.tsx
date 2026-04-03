import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONTS } from '../../utils/constants';

export default function TermsOfServiceScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.appName}>Are You The One?</Text>
        <Text style={styles.lastUpdated}>Effective Date: March 2026</Text>

        <View style={styles.section}><Text style={styles.sectionTitle}>1. Acceptance of Terms</Text><Text style={styles.text}>By accessing or using Are You The One? (“the App”), you agree to be bound by these Terms of Service. If you do not agree, you may not use the App.</Text></View>

        <View style={styles.section}><Text style={styles.sectionTitle}>2. Eligibility</Text><Text style={styles.text}>You must:{"\n"}• Be at least 18 years old{"\n"}• Provide accurate and truthful information{"\n"}• Use the app for genuine relationship purposes{"\n\n"}This platform is intended for individuals seeking serious relationships only.</Text></View>

        <View style={styles.section}><Text style={styles.sectionTitle}>3. Account Registration</Text><Text style={styles.text}>You agree to:{"\n"}• Provide accurate information{"\n"}• Maintain the security of your account{"\n"}• Not share your login credentials{"\n\n"}We reserve the right to suspend or terminate accounts that provide false information.</Text></View>

        <View style={styles.section}><Text style={styles.sectionTitle}>4. Verification & Safety</Text><Text style={styles.text}>To maintain a safe environment, users may be required to:{"\n"}• Verify phone number{"\n"}• Verify email address{"\n"}• Complete selfie verification{"\n"}• Provide additional identity verification (optional){"\n\n"}Failure to comply may result in restricted access.</Text></View>

        <View style={styles.section}><Text style={styles.sectionTitle}>5. User Conduct</Text><Text style={styles.text}>You agree NOT to:{"\n"}• Harass, abuse, or harm other users{"\n"}• Send inappropriate or explicit content{"\n"}• Misrepresent your identity{"\n"}• Use the platform for scams or fraud{"\n"}• Promote casual hookups or non-serious intentions{"\n"}• Violate any applicable laws{"\n\n"}We enforce a zero-tolerance policy for unsafe or harmful behavior.</Text></View>

        <View style={styles.section}><Text style={styles.sectionTitle}>6. Content Ownership</Text><Text style={styles.text}>You retain ownership of your content, but grant Are You The One? a license to display and use it within the platform.</Text></View>

        <View style={styles.section}><Text style={styles.sectionTitle}>7. Subscription & Payments</Text><Text style={styles.text}>Certain features require payment.{"\n"}• Subscriptions are billed monthly or as selected{"\n"}• Payments are non-refundable unless required by law{"\n"}• Prices may change with notice</Text></View>

        <View style={styles.section}><Text style={styles.sectionTitle}>8. Termination</Text><Text style={styles.text}>We reserve the right to:{"\n"}• Suspend or delete accounts{"\n"}• Remove content{"\n"}• Restrict access{"\n\n"}At our sole discretion, especially for violations.</Text></View>

        <View style={styles.section}><Text style={styles.sectionTitle}>9. Disclaimer</Text><Text style={styles.text}>We do not guarantee:{"\n"}• Matches{"\n"}• Relationships{"\n"}• Compatibility outcomes{"\n\n"}Use of the app is at your own risk.</Text></View>

        <View style={styles.section}><Text style={styles.sectionTitle}>10. Limitation of Liability</Text><Text style={styles.text}>Are You The One? is not liable for:{"\n"}• User interactions{"\n"}• Emotional outcomes{"\n"}• Offline interactions between users</Text></View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Changes to Terms</Text>
          <Text style={styles.text}>
            We may update these terms at any time. Continued use means acceptance.
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
  text: { fontSize: 15, fontFamily: FONTS.regular, color: COLORS.textSecondary, lineHeight: 22 },
});
