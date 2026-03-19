import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONTS, DATE_CATEGORIES } from '../../utils/constants';
import { dateService, chatService } from '../../services';
import { DateSuggestion, DateCategory } from '../../types';
import { DateSuggestionCard } from '../../components/dates';
import { useAuthStore } from '../../store';
import { Button } from '../../components/ui';

export default function DateSuggestionsScreen({ navigation, route }: any) {
  const { user } = useAuthStore();
  const [suggestions, setSuggestions] = useState<DateSuggestion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<DateCategory>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const matchId = route.params?.matchId;

  const fetchSuggestions = useCallback(async (refresh = false) => {
    if (isLoading && !refresh) return;
    setIsLoading(true);
    try {
      const city = user?.city || '';
      const response = await dateService.getSuggestions(city, selectedCategory);
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.city, selectedCategory]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchSuggestions(true);
  };

  const handleShare = async (suggestion: DateSuggestion) => {
    if (!matchId) return;
    try {
      await chatService.shareDateSuggestion(matchId, suggestion.id);
      navigation.goBack();
    } catch (error) {
      console.error('Error sharing suggestion:', error);
    }
  };

  const renderCategoryItem = ({ item }: { item: typeof DATE_CATEGORIES[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.categoryButtonActive,
      ]}
      onPress={() => setSelectedCategory(item.id as DateCategory)}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={[
        styles.categoryLabel,
        selectedCategory === item.id && styles.categoryLabelActive,
      ]}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Date Ideas</Text>
        <Text style={styles.subtitle}>
          {user?.city ? `Showing ideas in ${user.city}` : 'Discover great places for your dates'}
        </Text>
      </View>

      <View style={styles.categoryContainer}>
        <FlatList
          data={DATE_CATEGORIES}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      <FlatList
        data={suggestions}
        renderItem={({ item }) => (
          <DateSuggestionCard
            suggestion={item}
            onShare={matchId ? () => handleShare(item) : undefined}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No suggestions found in your area yet.</Text>
              <Button title="Refresh" onPress={handleRefresh} variant="secondary" />
            </View>
          ) : null
        }
        ListFooterComponent={
          isLoading && !isRefreshing ? <ActivityIndicator color={COLORS.primary} style={styles.loader} /> : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  categoryContainer: {
    marginBottom: SPACING.sm,
  },
  categoryList: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  categoryLabelActive: {
    color: COLORS.white,
  },
  listContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  loader: {
    marginTop: SPACING.md,
  },
});
