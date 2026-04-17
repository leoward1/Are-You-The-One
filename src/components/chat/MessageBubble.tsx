import React, { useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { SPACING, FONTS, BORDER_RADIUS } from '../../utils/constants';
import { useColors } from '../../hooks/useColors';
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
  onReply?: (message: { id: string; content: string; senderId: string }) => void;
}

const SWIPE_THRESHOLD = 60;

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  currentUserId,
  showTimestamp = true,
  onMove,
  onReply,
}) => {
  const COLORS = useColors();
  const styles = useMemo(() => makeStyles(COLORS), [COLORS]);
  const translateX = useRef(new Animated.Value(0)).current;
  const replyOpacity = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dy) < 20,
      onPanResponderMove: (_, g) => {
        if (g.dx > 0 && g.dx <= SWIPE_THRESHOLD + 20) {
          translateX.setValue(g.dx);
          replyOpacity.setValue(Math.min(g.dx / SWIPE_THRESHOLD, 1));
        }
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx >= SWIPE_THRESHOLD) {
          onReply?.({ id: message.id, content: message.content, senderId: message.senderId });
        }
        Animated.parallel([
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true, friction: 6 }),
          Animated.timing(replyOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
        ]).start();
      },
      onPanResponderTerminate: () => {
        Animated.parallel([
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
          Animated.timing(replyOpacity, { toValue: 0, duration: 100, useNativeDriver: true }),
        ]).start();
      },
    })
  ).current;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.container, isOwn ? styles.ownContainer : styles.otherContainer]}>
      <Animated.View style={[styles.replyIcon, { opacity: replyOpacity }]}>
        <Text style={styles.replyIconText}>↩️</Text>
      </Animated.View>
      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
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
            currentUserId={currentUserId}
            onMove={(newState: string[]) => {
              onMove?.(newState);
            }}
          />
        ) : (() => {
          const lines = message.content.split('\n');
          const quoteLines = lines.filter(l => l.startsWith('> '));
          const bodyLines = lines.filter(l => !l.startsWith('> '));
          const rawQuote = quoteLines.map(l => l.replace(/^> /, '')).join(' ');
          const bodyText = bodyLines.join('\n').trim();
          // Parse "Name|quoted text" format
          const pipIdx = rawQuote.indexOf('|');
          const quoteSender = pipIdx !== -1 ? rawQuote.substring(0, pipIdx) : '';
          const quoteText = pipIdx !== -1 ? rawQuote.substring(pipIdx + 1) : rawQuote;
          return (
            <>
              {quoteText.length > 0 && (
                <View style={[styles.quoteBlock, isOwn ? styles.quoteBlockOwn : styles.quoteBlockOther]}>
                  {quoteSender.length > 0 && (
                    <Text style={[styles.quoteSender, isOwn ? styles.quoteSenderOwn : styles.quoteSenderOther]}>
                      {quoteSender}
                    </Text>
                  )}
                  <Text style={[styles.quoteText, isOwn ? styles.quoteTextOwn : styles.quoteTextOther]} numberOfLines={2}>
                    {quoteText}
                  </Text>
                </View>
              )}
              <Text style={[styles.messageText, isOwn ? styles.ownText : styles.otherText]}>
                {bodyText}
              </Text>
            </>
          );
        })()}
      </View>
      {showTimestamp && (
        <Text style={[styles.timestamp, isOwn ? styles.ownTimestamp : styles.otherTimestamp]}>
          {formatTime(message.timestamp)}
        </Text>
      )}
      </Animated.View>
    </View>
  );
};

const makeStyles = (COLORS: any) => StyleSheet.create({
  container: {
    marginVertical: SPACING.xs,
    maxWidth: '80%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownContainer: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row-reverse',
  },
  otherContainer: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
  },
  replyIcon: {
    position: 'absolute',
    left: -28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyIconText: {
    fontSize: 18,
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
  quoteBlock: {
    borderLeftWidth: 3,
    paddingLeft: SPACING.sm,
    paddingVertical: 2,
    marginBottom: SPACING.xs,
    borderRadius: 2,
  },
  quoteBlockOwn: {
    borderLeftColor: 'rgba(255,255,255,0.6)',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  quoteBlockOther: {
    borderLeftColor: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
  },
  quoteText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  quoteTextOwn: {
    color: 'rgba(255,255,255,0.8)',
  },
  quoteTextOther: {
    color: COLORS.textSecondary,
  },
  quoteSender: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    marginBottom: 2,
  },
  quoteSenderOwn: {
    color: 'rgba(255,255,255,0.9)',
  },
  quoteSenderOther: {
    color: COLORS.primary,
  },
});

export default MessageBubble;
