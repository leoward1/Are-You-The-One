import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../utils/constants';
import { TicTacToe } from './games/TicTacToe';

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    senderId: string;
    timestamp: string;
    type?: 'text' | 'image' | 'voice' | 'video' | 'date_suggestion' | 'game';
    date_suggestion?: any;
    game_data?: any;
    match_id: string;
  };
  isOwn: boolean;
  currentUserId: string;
  showTimestamp?: boolean;
  onMove?: (newState: string[]) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  currentUserId,
  showTimestamp = true,
  onMove,
}) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.container, isOwn ? styles.ownContainer : styles.otherContainer]}>
      <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
        {message.type === 'date_suggestion' ? (
          <View style={styles.suggestionContainer}>
            <Text style={styles.suggestionTitle}>📍 Suggested Date</Text>
            <View style={styles.suggestionDivider} />
            <Text style={[styles.messageText, isOwn ? styles.ownText : styles.otherText]}>
              {message.content}
            </Text>
            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.viewButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        ) : message.type === 'game' && message.game_data?.type === 'tictactoe' ? (
          <TicTacToe
            matchId={message.match_id}
            gameData={message.game_data}
            isOwnTurn={message.game_data.turn_id === currentUserId}
            onMove={(newState: string[]) => {
              onMove?.(newState);
            }}
          />
        ) : (
          <Text style={[styles.messageText, isOwn ? styles.ownText : styles.otherText]}>
            {message.content}
          </Text>
        )}
      </View>
      {showTimestamp && (
        <Text style={[styles.timestamp, isOwn ? styles.ownTimestamp : styles.otherTimestamp]}>
          {formatTime(message.timestamp)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.xs,
    maxWidth: '80%',
  },
  ownContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  ownBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: SPACING.xs,
  },
  otherBubble: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: SPACING.xs,
  },
  messageText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    lineHeight: 22,
  },
  ownText: {
    color: COLORS.white,
  },
  otherText: {
    color: COLORS.text,
  },
  timestamp: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  ownTimestamp: {
    color: COLORS.textSecondary,
  },
  otherTimestamp: {
    color: COLORS.textSecondary,
  },
  suggestionContainer: {
    padding: SPACING.xs,
    minWidth: 200,
  },
  suggestionTitle: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  suggestionDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: SPACING.sm,
  },
  viewButton: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
});

export default MessageBubble;
