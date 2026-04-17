import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MatchesStackParamList } from '../../navigation/MatchesNavigator';
import { SPACING, FONTS, BORDER_RADIUS } from '../../utils/constants';
import { useColors } from '../../hooks/useColors';
import { MessageBubble, ChatInput } from '../../components/chat';
import { Avatar, Button } from '../../components/ui';
import { chatService, callService } from '../../services';
import { useAuthStore, useMatchStore } from '../../store';
import { Message, Match, CallSession } from '../../types';
import { supabase } from '../../config/supabase';

type ChatScreenProps = {
  route: RouteProp<MatchesStackParamList, 'Chat'>;
  navigation: NativeStackNavigationProp<MatchesStackParamList, 'Chat'>;
};

export default function ChatScreen({ route, navigation }: ChatScreenProps) {
  const COLORS = useColors();
  const styles = useMemo(() => makeStyles(COLORS), [COLORS]);
  const { matchId, matchName } = route.params;
  const { user } = useAuthStore();
  const { matches, checkAndUpgradeUnlockStage, clearUnreadCount, setActiveMatch } = useMatchStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [partnerStatus, setPartnerStatus] = useState<string>('Offline');
  const [replyTo, setReplyTo] = useState<{ id: string; content: string; senderId: string } | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const upgradeCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const match = matches.find(m => m.id === matchId);
  const isVoiceUnlocked = match?.unlocked_stage !== 'text';
  const isVideoUnlocked = match?.unlocked_stage === 'video';

  useEffect(() => {
    if (match && user?.tier) {
      if (upgradeCheckTimer.current) clearTimeout(upgradeCheckTimer.current);
      upgradeCheckTimer.current = setTimeout(() => {
        checkAndUpgradeUnlockStage(match, user.tier);
      }, 2000);
    }
    return () => {
      if (upgradeCheckTimer.current) clearTimeout(upgradeCheckTimer.current);
    };
  }, [messages.length]);

  const fetchMessages = useCallback(async () => {
    try {
      const history = await chatService.getMessageHistory(matchId);
      setMessages(history);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    // Register this chat as active so realtime subscription won't increment unread
    setActiveMatch(matchId);
    fetchMessages();
    // Mark messages as read immediately when chat opens
    chatService.markAsRead(matchId).catch(console.error);
    clearUnreadCount(matchId);

    // Clear active match when leaving chat
    return () => { setActiveMatch(null); };
  }, [matchId]);

  useEffect(() => {
    // Subscribe to new messages
    const unsubscribe = chatService.subscribeToMessages(matchId, (message) => {
      if (message) {
        setMessages((prev) => {
          // Avoid duplicates: skip if already in the list (by real ID)
          // Also replace any optimistic messages that now have a real ID
          const exists = prev.find(
            (m) => m.id === message.id || 
            // Match optimistic messages from our own user sent around the same time
            (m.id.startsWith('optimistic-') &&
              m.from_user_id === message.from_user_id &&
              m.content === message.content)
          );
          if (exists) {
            // Replace optimistic with real message
            return prev.map((m) => (m.id === exists.id ? message : m));
          }
          return [...prev, message];
        });
      }
    });

    // Subscribe to incoming calls
    const callUnsubscribe = callService.subscribeToCalls(matchId, (session: CallSession) => {
      if (session.status === 'ringing' && session.from_user_id !== user?.id) {
        Alert.alert(
          'Incoming Call',
          `${matchName} is calling you!`,
          [
            { text: 'Decline', style: 'cancel', onPress: () => callService.endCall(session.id) },
            {
              text: 'Answer',
              onPress: () => navigation.navigate('Call', {
                matchId,
                partnerName: matchName || 'Match',
                callType: session.kind as any,
                sessionId: session.id
              })
            },
          ]
        );
      }
    });

    return () => {
      unsubscribe();
      callUnsubscribe.unsubscribe();
    };
  }, [matchId, fetchMessages, user?.id, matchName, navigation]);

  const fetchPartnerStatus = useCallback(async () => {
    try {
      const otherUserId = match?.user_a_id === user?.id ? match?.user_b_id : match?.user_a_id;
      if (!otherUserId) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('last_seen_at')
        .eq('id', otherUserId)
        .single();

      if (error) throw error;

      if (data?.last_seen_at) {
        setPartnerStatus(formatStatus(data.last_seen_at));
      }
    } catch (error) {
      console.error('Error fetching partner status:', error);
    }
  }, [match, user?.id]);

  useEffect(() => {
    fetchPartnerStatus();
    // Refresh status every minute
    const interval = setInterval(fetchPartnerStatus, 60000);
    return () => clearInterval(interval);
  }, [fetchPartnerStatus]);

  const formatStatus = (lastSeenAt: string) => {
    const lastSeen = new Date(lastSeenAt);
    const now = new Date();
    const diffInMins = Math.floor((now.getTime() - lastSeen.getTime()) / 60000);

    if (diffInMins < 2) return 'Active';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInMins < 1440) return `${Math.floor(diffInMins / 60)}h ago`;
    return 'Offline';
  };

  // Helper to strip existing quote markers and get clean text
  const getCleanReplyText = (rawContent: string): string => {
    // Remove all lines starting with > (existing quotes)
    return rawContent
      .split('\n')
      .filter(line => !line.startsWith('>'))
      .join('\n')
      .substring(0, 60);
  };

  const handleSend = async (content: string) => {
    if (!content.trim() || isSending) return;
    setIsSending(true);

    const replyPrefix = replyTo
      ? `> ${getCleanReplyText(replyTo.content)}${replyTo.content.length > 60 ? '...' : ''}\n`
      : '';
    const fullContent = replyPrefix + content;
    setReplyTo(null);

    // Optimistic update
    const optimisticMessage: Message = {
      id: `optimistic-${Date.now()}`,
      match_id: matchId,
      from_user_id: user?.id || '',
      type: 'text',
      content: fullContent,
      read: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const sent = await chatService.sendMessage({
        match_id: matchId,
        type: 'text',
        content: fullContent,
      });
      // Replace the optimistic message with the real one from the server
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMessage.id ? sent : m))
      );
    } catch (error: any) {
      console.error('Error sending message:', error);
      // Remove the optimistic message on failure and notify the user
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
      Alert.alert('Message Failed', `Your message could not be sent. ${error.message || 'Please try again.'}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleDateSuggest = () => {
    navigation.navigate('DateSuggestions', { matchId });
  };

  const handleGamePress = async () => {
    try {
      await chatService.sendMessage({
        match_id: matchId,
        type: 'game',
        content: 'I started a game of Tic-Tac-Toe!',
        game_data: {
          type: 'tictactoe',
          state: Array(9).fill(null),
          turn_id: user?.id || '',
          player_x: user?.id || '',
          player_o: match?.user_a_id === user?.id ? match?.user_b_id : match?.user_a_id,
          is_finished: false,
        },
      } as any);
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const handleMove = async (messageId: string, newState: string[], oldGameData?: any) => {
    // Logic to determine winner and next turn
    const winner = checkWinner(newState);
    const isFinished = !!winner || newState.every(c => c !== null);

    try {
      const otherUserId = match?.user_a_id === user?.id ? match?.user_b_id : match?.user_a_id;

      // Update the existing game message instead of inserting a new row
      const { data, error } = await supabase
        .from('messages')
        .update({
          content: winner ? (winner === 'draw' ? "It's a draw!" : "I won!") : "It's your turn!",
          game_data: {
            ...oldGameData,
            state: newState,
            turn_id: otherUserId || '',
            winner_id: winner,
            is_finished: isFinished,
          },
        })
        .eq('id', messageId)
        .select()
        .single();

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      // Optimistically update the message in local state
      if (data) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? (data as any) : m))
        );
      }
    } catch (error) {
      console.error('Error making move:', error);
      Alert.alert('Move Failed', 'Could not make your move. Please try again.');
    }
  };

  const checkWinner = (board: string[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return board.every(c => c !== null) ? 'draw' : null;
  };

  const handleReport = () => {
    const otherUserId = match?.user_a_id === user?.id ? match?.user_b_id : match?.user_a_id;
    Alert.alert(
      'Report or Block',
      `What would you like to do with ${matchName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block User',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!user?.id || !otherUserId) return;
              await supabase.from('blocks').upsert(
                { blocker_id: user.id, blocked_user_id: otherUserId },
                { onConflict: 'blocker_id,blocked_user_id' }
              );
              Alert.alert('Blocked', `${matchName} has been blocked.`, [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch {
              Alert.alert('Error', 'Could not block user. Please try again.');
            }
          },
        },
        {
          text: 'Report Profile',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!user?.id || !otherUserId) return;
              await supabase.from('reports').insert({
                reporter_id: user.id,
                reported_user_id: otherUserId,
                match_id: matchId,
                reason: 'Reported from chat screen',
              });
              Alert.alert('Reported', 'Our moderation team will review this within 24 hours.', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch {
              Alert.alert('Error', 'Could not submit report. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderMessage = useCallback(({ item }: { item: Message }) => (
    <MessageBubble
      message={{
        id: item.id,
        content: item.content || '',
        senderId: item.from_user_id,
        timestamp: item.created_at,
        type: item.type as any,
        date_suggestion: item.date_suggestion,
        game_data: item.game_data,
        match_id: item.match_id,
      }}
      isOwn={item.from_user_id === user?.id}
      currentUserId={user?.id || ''}
      onMove={(newState) => handleMove(item.id, newState, item.game_data)}
      onReply={setReplyTo}
    />
  ), [user?.id, handleMove]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Avatar name={matchName} size="small" />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{matchName}</Text>
          <Text style={[
            styles.headerStatus,
            partnerStatus === 'Active' && styles.activeStatus
          ]}>
            {partnerStatus}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerAction, !isVoiceUnlocked && styles.disabledAction]}
            disabled={!isVoiceUnlocked}
            onPress={() => isVoiceUnlocked ? navigation.navigate('Call', {
              matchId,
              partnerName: matchName || 'Match',
              callType: 'voice'
            }) : Alert.alert('Locked', 'Send 1 message to unlock Voice calls!')}
          >
            <Text style={[styles.actionIcon, !isVoiceUnlocked && styles.disabledText]}>📞</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerAction, !isVideoUnlocked && styles.disabledAction]}
            disabled={!isVideoUnlocked}
            onPress={() => isVideoUnlocked ? navigation.navigate('Call', {
              matchId,
              partnerName: matchName || 'Match',
              callType: 'video'
            }) : Alert.alert('Locked', 'Send 3 messages to unlock Video calls!')}
          >
            <Text style={[styles.actionIcon, !isVideoUnlocked && styles.disabledText]}>📹</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerAction} onPress={handleReport}>
            <Text style={styles.actionIcon}>⋮</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.stageBadge}>
        <Text style={styles.stageText}>
          Level: {match?.unlocked_stage?.toUpperCase() || 'TEXT'}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color={COLORS.primary} size="large" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews
            maxToRenderPerBatch={15}
            windowSize={10}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No messages yet. Say hello!</Text>
              </View>
            }
          />
        )}

        {replyTo && (
          <View style={styles.replyBanner}>
            <View style={styles.replyBannerContent}>
              <Text style={styles.replyBannerLabel}>Replying to</Text>
              <Text style={styles.replyBannerText} numberOfLines={1}>
                {replyTo.content.split('\n').filter(l => !l.startsWith('>')).join(' ')}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setReplyTo(null)} style={styles.replyBannerClose}>
              <Text style={styles.replyBannerCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        <ChatInput
          onSend={handleSend}
          onDateSuggest={handleDateSuggest}
          onGamePress={handleGamePress}
          onReviewPress={() => navigation.navigate('AddReview', { matchId, partnerName: matchName || 'Your Match' })}
          disabled={isSending}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: SPACING.sm,
    marginRight: SPACING.sm,
  },
  backText: {
    fontSize: 24,
    color: COLORS.primary,
  },
  headerInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  headerName: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
  },
  headerStatus: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  activeStatus: {
    color: COLORS.success,
    fontFamily: FONTS.medium,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerAction: {
    padding: SPACING.sm,
  },
  actionIcon: {
    fontSize: 20,
  },
  messagesList: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageBadge: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  stageText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    letterSpacing: 1,
  },
  disabledAction: {
    opacity: 0.3,
  },
  disabledText: {
    // No-op for now
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  replyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  replyBannerContent: {
    flex: 1,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    paddingLeft: SPACING.sm,
  },
  replyBannerLabel: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: 2,
  },
  replyBannerText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  replyBannerClose: {
    padding: SPACING.sm,
    marginLeft: SPACING.sm,
  },
  replyBannerCloseText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
