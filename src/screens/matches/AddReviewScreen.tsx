import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../utils/constants';
import { Button, Card } from '../../components/ui';
import { reviewService } from '../../services';

export default function AddReviewScreen({ navigation, route }: any) {
    const { matchId, partnerName } = route.params;
    const [rating, setRating] = useState(0);
    const [headline, setHeadline] = useState('');
    const [body, setBody] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRating = (value: number) => {
        setRating(value);
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert('Required', 'Please select a star rating.');
            return;
        }
        if (!headline.trim() || !body.trim()) {
            Alert.alert('Required', 'Please provide both a headline and a description.');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await reviewService.submitReview({
                about_match_id: matchId,
                from_user_id: 'CURRENT_USER_ID', // In real app, get from auth store
                rating,
                headline,
                body,
            });

            if (result.success) {
                Alert.alert('Success', result.message, [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert('Error', result.message);
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.title}>How was your experience with {partnerName}?</Text>
                    <Text style={styles.subtitle}>
                        Your review helps us keep the community safe and celebrate success stories!
                    </Text>

                    <View style={styles.ratingContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity
                                key={star}
                                onPress={() => handleRating(star)}
                                style={styles.starTouch}
                            >
                                <Text style={[styles.star, rating >= star && styles.starSelected]}>
                                    {rating >= star ? '⭐' : '☆'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Card style={styles.formCard}>
                        <Text style={styles.label}>Headline (e.g., "Amazing first date!")</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Give your story a title"
                            value={headline}
                            onChangeText={setHeadline}
                            maxLength={100}
                        />

                        <Text style={styles.label}>Detailed Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Tell us more about it..."
                            value={body}
                            onChangeText={setBody}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </Card>

                    <View style={styles.buttonContainer}>
                        <Button
                            title={isSubmitting ? "Submitting..." : "Submit Review"}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                            fullWidth
                            size="large"
                        />
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.cancelButton}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
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
    scrollContent: {
        padding: SPACING.lg,
    },
    title: {
        fontSize: 24,
        fontFamily: FONTS.bold,
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: SPACING.sm,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.xl,
        lineHeight: 22,
    },
    ratingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: SPACING.xl,
    },
    starTouch: {
        padding: SPACING.xs,
    },
    star: {
        fontSize: 40,
        color: COLORS.textSecondary,
    },
    starSelected: {
        color: '#FFD700',
    },
    formCard: {
        marginBottom: SPACING.xl,
        padding: SPACING.lg,
    },
    label: {
        fontSize: 14,
        fontFamily: FONTS.medium,
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    input: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        fontSize: 16,
        color: COLORS.text,
        marginBottom: SPACING.lg,
    },
    textArea: {
        height: 120,
        paddingTop: SPACING.md,
    },
    buttonContainer: {
        gap: SPACING.md,
    },
    cancelButton: {
        alignItems: 'center',
        padding: SPACING.md,
    },
    cancelText: {
        color: COLORS.textSecondary,
        fontSize: 16,
        fontFamily: FONTS.medium,
    },
});
