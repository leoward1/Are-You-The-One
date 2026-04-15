import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SPACING, FONTS, BORDER_RADIUS } from '../../utils/constants';
import { useColors } from '../../hooks/useColors';
import { Avatar, Button } from '../../components/ui';
import { supabase } from '../../config/supabase';

interface BlockedUser {
  id: string;
  blocked_user_id: string;
  blocked_profile: {
    id: string;
    first_name: string;
    primary_photo: string;
  };
}

export default function BlockedUsersScreen() {
  const COLORS = useColors();
  const styles = useMemo(() => makeStyles(COLORS), [COLORS]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const fetchBlockedUsers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('blocks')
        .select(`
          id,
          blocked_user_id,
          blocked_profile:profiles!blocked_user_id(id, first_name, primary_photo)
        `)
        .eq('blocker_id', user.id);

      if (error) throw error;
      setBlockedUsers(data as any);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not fetch blocked users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnblock = async (blockedUserId: string) => {
    Alert.alert(
      'Unblock User',
      'Are you sure you want to unblock this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          style: 'destructive',
          onPress: async () => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) return;

              const { error } = await supabase
                .from('blocks')
                .delete()
                .eq('blocker_id', user.id)
                .eq('blocked_user_id', blockedUserId);

              if (error) throw error;

              setBlockedUsers(prev => prev.filter(b => b.blocked_user_id !== blockedUserId));
              Alert.alert('Success', 'User unblocked');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Could not unblock user');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: BlockedUser }) => (
    <View style={styles.userRow}>
      <View style={styles.avatarWrapper}>
        <Avatar
          name={item.blocked_profile?.first_name || 'User'}
          source={item.blocked_profile?.primary_photo}
          size="medium"
        />
        <View style={styles.blockedBadge}>
          <Text style={styles.blockedBadgeIcon}>🚫</Text>
        </View>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.blocked_profile?.first_name || 'Unknown User'}</Text>
        <Text style={styles.blockedLabel}>Blocked</Text>
      </View>
      <Button
        title="Unblock"
        onPress={() => handleUnblock(item.blocked_user_id)}
        variant="secondary"
        size="small"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : blockedUsers.length > 0 ? (
        <FlatList
          data={blockedUsers}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
        />
      ) : (
        <View style={styles.centered}>
          <Text style={styles.emptyEmoji}>🚫</Text>
          <Text style={styles.emptyTitle}>No Blocked Users</Text>
          <Text style={styles.emptySubtitle}>Users you block will appear here.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  listContent: { padding: SPACING.md },
  userRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md },
  avatarWrapper: { position: 'relative' },
  blockedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockedBadgeIcon: { fontSize: 13 },
  userInfo: { flex: 1, marginLeft: SPACING.md },
  userName: { fontSize: 16, fontFamily: FONTS.semiBold, color: COLORS.text },
  blockedLabel: { fontSize: 12, fontFamily: FONTS.regular, color: COLORS.error, marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.border },
  emptyEmoji: { fontSize: 48, marginBottom: SPACING.md },
  emptyTitle: { fontSize: 20, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SPACING.sm },
  emptySubtitle: { fontSize: 14, fontFamily: FONTS.regular, color: COLORS.textSecondary, textAlign: 'center' },
});
