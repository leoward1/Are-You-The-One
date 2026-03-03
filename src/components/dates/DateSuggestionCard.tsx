import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { DateSuggestion } from '../../types';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../utils/constants';
import { Card } from '../ui/Card';

interface DateSuggestionCardProps {
    suggestion: DateSuggestion;
    onPress?: () => void;
    onShare?: () => void;
}

export const DateSuggestionCard: React.FC<DateSuggestionCardProps> = ({
    suggestion,
    onPress,
    onShare,
}) => {
    return (
        <Card style={styles.card} onPress={onPress} padding="none">
            <Image
                source={{ uri: suggestion.image_url || 'https://via.placeholder.com/300x200?text=Venue' }}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.name} numberOfLines={1}>{suggestion.name}</Text>
                    <View style={styles.ratingContainer}>
                        <Text style={styles.star}>⭐</Text>
                        <Text style={styles.rating}>{suggestion.safety_rating || 5.0}</Text>
                    </View>
                </View>

                <Text style={styles.address} numberOfLines={1}>📍 {suggestion.address}</Text>
                <Text style={styles.description} numberOfLines={2}>{suggestion.description}</Text>

                <View style={styles.footer}>
                    <Text style={styles.cost}>{suggestion.avg_cost || '$$'}</Text>
                    {onShare && (
                        <TouchableOpacity style={styles.shareButton} onPress={onShare}>
                            <Text style={styles.shareText}>Suggest</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: SPACING.md,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 150,
    },
    content: {
        padding: SPACING.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    name: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: COLORS.text,
        flex: 1,
        marginRight: SPACING.sm,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        paddingHorizontal: SPACING.xs,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.sm,
    },
    star: {
        fontSize: 12,
        marginRight: 2,
    },
    rating: {
        fontSize: 12,
        fontFamily: FONTS.medium,
        color: COLORS.text,
    },
    address: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
    },
    description: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
        marginBottom: SPACING.md,
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cost: {
        fontSize: 14,
        fontFamily: FONTS.semiBold,
        color: COLORS.primary,
    },
    shareButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.full,
    },
    shareText: {
        fontSize: 14,
        fontFamily: FONTS.bold,
        color: COLORS.white,
    },
});
