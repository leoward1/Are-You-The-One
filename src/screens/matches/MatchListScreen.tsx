import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MatchesStackParamList } from '@/navigation/MatchesNavigator';
import { useMatchStore, useAuthStore } from '@/store';
import { SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '@/utils/constants';
import { useColors } from '@/hooks/useColors';
import { formatMessageTime, truncateText } from '@/utils/formatters';
import { Match } from '@/types';

type MatchListScreenProps = {
  navigation: NativeStackNavigationProp<MatchesStackParamList, 'MatchList'>;
};

export default function MatchListScreen({ navigation }: MatchListScreenProps) {
  const COLORS = useColors();
  const styles = useMemo(() => makeStyles(COLORS), [COLORS]);
  const { matches, loadMatches, subscribeToMatchUpdates, isLoading } = useMatchStore();
  const { user } = useAuthStore();
  const currentUserId = user?.id;
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMatches();
    const unsubscribe = subscribeToMatchUpdates();
    return () => unsubscribe();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMatches();
    setRefreshing(false);
  };

  const isOnline = (lastSeenAt?: string) => {
    if (!lastSeenAt) return false;
    const lastSeen = new Date(lastSeenAt);
    const now = new Date();
    const diffInMins = (now.getTime() - lastSeen.getTime()) / 60000;
    return diffInMins < 5;
  };

  // FIX: Added optional chaining on first_name to prevent null crash
  const filteredMatches = matches.filter(m =>
    m.matched_user?.first_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const newMatches = filteredMatches.filter(m => !m.last_message);
  const activeMatches = filteredMatches
    .filter(m => m.last_message)
    .sort((a, b) =>
      new Date(b.last_message?.created_at || 0).getTime() -
      new Date(a.last_message?.created_at || 0).getTime()
    );

  const renderNewMatch = ({ item }: { item: Match }) => {
    const online = isOnline(item.matched_user?.last_seen_at);
    return (
      <TouchableOpacity
        style={styles.newMatchItem}
        onPress={() => navigation.navigate('Chat', { matchId: item.id, matchName: item.matched_user?.first_name || 'Match' })}
      >
        <View style={styles.newMatchAvatarContainer}>
          <Image
            source={{ uri: item.matched_user?.primary_photo || 'https://via.placeholder.com/150' }}
            style={styles.newMatchAvatar}
          />
          {online && <View style={styles.onlineIndicator} />}
        </View>
        <Text style={styles.newMatchName} numberOfLines={1}>
          {item.matched_user?.first_name || 'Match'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderConversation = ({ item }: { item: Match }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => navigation.navigate('Chat', { matchId: item.id, matchName: item.matched_user?.first_name || 'Match' })}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.matched_user?.primary_photo || 'https://via.placeholder.com/150' }}
        style={styles.conversationAvatar}
      />
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationName}>
            {item.matched_user?.first_name || 'Match'}
          </Text>
          <Text style={styles.conversationTime}>
            {item.last_message ? formatMessageTime(item.last_message.created_at) : ''}
          </Text>
        </View>
        <View style={styles.conversationFooter}>
          <Text
            style={[
              styles.conversationSnippet,
              item.unread_count != null && item.unread_count > 0 ? styles.unreadSnippet : {},
            ]}
            numberOfLines={1}
          >
            {item.last_message?.from_user_id === currentUserId ? 'You: ' : ''}
            {truncateText(item.last_message?.content || '', 40)}
          </Text>
          {item.unread_count != null && item.unread_count > 0 ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unread_count}</Text>
            </View>
          ) : (
            <View style={styles.stageTag}>
              <Text style={styles.stageTagText}>{item.unlocked_stage}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity style={styles.searchBar} activeOpacity={0.9}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search matches"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {newMatches.length > 0 && (
          <View style={styles.newMatchesSection}>
            <Text style={styles.sectionTitle}>New Matches</Text>
            <FlatList
              horizontal
              data={newMatches}
              renderItem={renderNewMatch}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.newMatchesList}
            />
          </View>
        )}

        <View style={styles.conversationsSection}>
          {activeMatches.length > 0 && <Text style={styles.sectionTitle}>Messages</Text>}
          {activeMatches.length > 0 ? (
            activeMatches.map((item) => (
              <React.Fragment key={item.id}>
                {renderConversation({ item })}
              </React.Fragment>
            ))
          ) : !isLoading && searchQuery === '' ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Text style={styles.emptyEmoji}>💬</Text>
              </View>
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptySubtitle}>
                When you match with someone, they'll show up here!
              </Text>
            </View>
          ) : null}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  title: { fontSize: 32, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SPACING.md },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: SPACING.md, height: 48, marginBottom: SPACING.sm },
  searchIcon: { fontSize: 16, marginRight: SPACING.sm, opacity: 0.6 },
  searchInput: { flex: 1, fontSize: 16, fontFamily: FONTS.regular, color: COLORS.text },
  newMatchesSection: { marginTop: SPACING.sm, marginBottom: SPACING.lg },
  sectionTitle: { fontSize: 13, fontFamily: FONTS.bold, color: COLORS.primary, paddingHorizontal: SPACING.lg, marginBottom: SPACING.md, textTransform: 'uppercase', letterSpacing: 1.2, opacity: 0.8 },
  newMatchesList: { paddingLeft: SPACING.lg, paddingRight: SPACING.md },
  newMatchItem: { alignItems: 'center', marginRight: SPACING.lg, width: 72 },
  newMatchAvatarContainer: { position: 'relative', marginBottom: SPACING.xs },
  newMatchAvatar: { width: 68, height: 68, borderRadius: 34, borderWidth: 2, borderColor: COLORS.primary },
  onlineIndicator: { position: 'absolute', bottom: 2, right: 2, backgroundColor: COLORS.success, width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: COLORS.background },
  newMatchName: { fontSize: 12, fontFamily: FONTS.medium, color: COLORS.text, marginTop: 4 },
  conversationsSection: { flex: 1, paddingHorizontal: SPACING.lg },
  conversationItem: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg, paddingVertical: 2 },
  conversationAvatar: { width: 64, height: 64, borderRadius: 32, marginRight: SPACING.md },
  conversationContent: { flex: 1, paddingBottom: SPACING.md },
  conversationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  conversationName: { fontSize: 16, fontFamily: FONTS.bold, color: COLORS.text },
  conversationTime: { fontSize: 12, fontFamily: FONTS.regular, color: COLORS.textSecondary },
  conversationFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  conversationSnippet: { fontSize: 14, fontFamily: FONTS.regular, color: COLORS.textSecondary, flex: 1, marginRight: SPACING.md },
  unreadSnippet: { color: COLORS.text, fontFamily: FONTS.bold },
  unreadBadge: { backgroundColor: COLORS.primary, minWidth: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  unreadCount: { color: COLORS.white, fontSize: 11, fontFamily: FONTS.bold },
  stageTag: { backgroundColor: COLORS.surface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: COLORS.border + '50' },
  stageTagText: { fontSize: 10, fontFamily: FONTS.bold, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: SPACING.xxl * 2, paddingHorizontal: SPACING.xxl },
  emptyIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg },
  emptyEmoji: { fontSize: 44 },
  emptyTitle: { fontSize: 22, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SPACING.sm },
  emptySubtitle: { fontSize: 16, fontFamily: FONTS.regular, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 24, opacity: 0.8 },
});