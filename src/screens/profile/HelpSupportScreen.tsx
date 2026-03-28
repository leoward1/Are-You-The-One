import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../utils/constants';
import { Card, Button } from '../../components/ui';

export default function HelpSupportScreen() {
  const faqs = [
    {
      question: 'How do I change my photos?',
      answer: 'Go to your Profile, tap "Edit Profile", and you can add or remove photos from there.',
    },
    {
      question: 'What is a "Rose"?',
      answer: 'Roses are special likes that show extra interest. They are limited and help you stand out!',
    },
    {
      question: 'How do I unmatch someone?',
      answer: 'Open your chat with them, tap the three dots in the corner, and select "Unmatch or Block".',
    },
    {
      question: 'How does verification work?',
      answer: "Tap 'Verify Account' in your profile to take a live photo/video. This earns you a verification badge!",
    },
  ];

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@areyoutheone.com').catch(() => {
      Alert.alert('Error', 'Unable to open mail app. Please email us at support@areyoutheone.com');
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>❓</Text>
          <Text style={styles.title}>How can we help?</Text>
          <Text style={styles.subtitle}>Find answers to common questions or reach out to us.</Text>
        </View>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {faqs.map((faq, index) => (
          <Card key={index} variant="elevated" style={styles.faqCard}>
            <Text style={styles.question}>{faq.question}</Text>
            <Text style={styles.answer}>{faq.answer}</Text>
          </Card>
        ))}

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Still have questions?</Text>
          <Text style={styles.contactText}>Our team is here to help you 24/7.</Text>
          <Button
            title="Contact Support"
            onPress={handleContactSupport}
            variant="primary"
            size="large"
            fullWidth
            style={styles.contactButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  header: { alignItems: 'center', marginBottom: SPACING.xl },
  headerEmoji: { fontSize: 64, marginBottom: SPACING.md },
  title: { fontSize: 24, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SPACING.sm },
  subtitle: { fontSize: 15, fontFamily: FONTS.regular, color: COLORS.textSecondary, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SPACING.md, marginTop: SPACING.sm },
  faqCard: { marginBottom: SPACING.md, padding: SPACING.md },
  question: { fontSize: 16, fontFamily: FONTS.semiBold, color: COLORS.text, marginBottom: SPACING.xs },
  answer: { fontSize: 14, fontFamily: FONTS.regular, color: COLORS.textSecondary, lineHeight: 20 },
  contactSection: { marginTop: SPACING.xl, alignItems: 'center', padding: SPACING.xl, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.xl },
  contactTitle: { fontSize: 18, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SPACING.xs },
  contactText: { fontSize: 14, fontFamily: FONTS.regular, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  contactButton: { marginTop: SPACING.sm },
});
