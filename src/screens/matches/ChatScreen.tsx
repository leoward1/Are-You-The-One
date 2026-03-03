import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MatchesStackParamList } from '../../navigation/MatchesNavigator';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../utils/constants';
import { MessageBubble, ChatInput } from '../../components/chat';
import { Avatar, Button } from '../../components/ui';
import { chatService } from '../../services';
import { useAuthStore, useMatchStore } from '../../store';
import { Message, Match } from '../../types';

type ChatScreenProps = {
  route: RouteProp<MatchesStackParamList, 'Chat'>;
  navigation: NativeStackNavigationProp<MatchesStackParamList, 'Chat'>;
};

export default function ChatScreen({ route, navigation }: ChatScreenProps) {
  const { matchId, matchName } = route.params;
  const { user } = useAuthStore();
  const { matches, checkAndUpgradeUnlockStage } = useMatchStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const match = matches.find(m => m.id === matchId);
  const isVoiceUnlocked = match?.unlocked_stage !== 'text';
  const isVideoUnlocked = match?.unlocked_stage === 'video';

  useEffect(() => {
    if (match && user?.tier) {
      checkAndUpgradeUnlockStage(match, user.tier);
    }
  }, [messages.length, user?.tier]);

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
    fetchMessages();

    // Subscribe to new messages
    const unsubscribe = chatService.subscribeToMessages(matchId, (message) => {
      if (message) {
        setMessages((prev) => {
          // Avoid duplicates if we already added it optimistically
          if (prev.find(m => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    });

    // Subscribe to incoming calls
    const callUnsubscribe = callService.subscribeToCalls(matchId, (session) => {
      if (session.status === 'ringing' && session.user_a_id !== user?.id) {
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
      chatService.markAsRead(matchId).catch(console.error);
    };
  }, [matchId, fetchMessages, user?.id, matchName, navigation]);

  const handleSend = async (content: string) => {
    if (!content.trim()) return;
    try {
      await chatService.sendMessage({
        match_id: matchId,
        type: 'text',
        content,
      });
      // Real-time subscription will update the list
    } catch (error) {
      console.error('Error sending message:', error);
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
          is_finished: false,
        },
      } as any);
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const handleMove = async (messageId: string, newState: string[]) => {
    // Logic to determine winner and next turn
    const winner = checkWinner(newState);
    const isFinished = !!winner || newState.every(c => c !== null);

    try {
      await chatService.sendMessage({
        match_id: matchId,
        type: 'game',
        content: winner ? (winner === 'draw' ? "It's a draw!" : "I won!") : "It's your turn!",
        game_data: {
          type: 'tictactoe',
          state: newState,
          turn_id: 'OTHER_ID', // Swap logic would go here
          winner_id: winner,
          is_finished: isFinished,
        },
      } as any);
    } catch (error) {
      console.error('Error making move:', error);
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

  const renderMessage = ({ item }: { item: Message }) => (
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
      onMove={(newState) => handleMove(item.id, newState)}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Avatar name={matchName} size="small" />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{matchName}</Text>
          <Text style={styles.headerStatus}>Active</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerAction, !isVoiceUnlocked && styles.disabledAction]}
            disabled={!isVoiceUnlocked}
            onPress={() => isVoiceUnlocked ? navigation.navigate('Call', {
              matchId,
              partnerName: matchName || 'Match',
              callType: 'voice'
            }) : Alert.alert('Locked', 'Send 10 messages to unlock Voice calls!')}
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
            }) : Alert.alert('Locked', 'Complete 1 voice call to unlock Video calls!')}
          >
            <Text style={[styles.actionIcon, !isVideoUnlocked && styles.disabledText]}>📹</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.stageBadge}>
        <Text style={styles.stageText}>
          Level: {match?.unlocked_stage?.toUpperCase() || 'TEXT'}
        </Text>
      </View>

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
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet. Say hello!</Text>
            </View>
          }
        />
      )}

      <ChatInput
        onSend={handleSend}
        onDateSuggest={handleDateSuggest}
        onGamePress={handleGamePress}
        onReviewPress={() => navigation.navigate('AddReview', { matchId, partnerName: matchName || 'Your Match' })}
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
    color: COLORS.success,
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
});
