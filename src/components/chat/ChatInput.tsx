import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../utils/constants';

interface ChatInputProps {
  onSend: (message: string) => void;
  onVoicePress?: () => void;
  onAttachPress?: () => void;
  onDateSuggest?: () => void;
  onGamePress?: () => void;
  onReviewPress?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onVoicePress,
  onAttachPress,
  onDateSuggest,
  onGamePress,
  onReviewPress,
  placeholder = 'Type a message...',
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const [showActions, setShowActions] = useState(false);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {showActions && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => { setShowActions(false); onDateSuggest?.(); }}
          >
            <Text style={styles.actionEmoji}>📍</Text>
            <Text style={styles.actionLabel}>Date Idea</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => { setShowActions(false); onGamePress?.(); }}
          >
            <Text style={styles.actionEmoji}>🎮</Text>
            <Text style={styles.actionLabel}>Play Game</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => { setShowActions(false); onReviewPress?.(); }}
          >
            <Text style={styles.actionEmoji}>⭐</Text>
            <Text style={styles.actionLabel}>Review</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={onAttachPress}>
            <Text style={styles.actionEmoji}>📷</Text>
            <Text style={styles.actionLabel}>Photo</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setShowActions(!showActions)}
        >
          <View style={styles.iconPlaceholder}>
            <View style={[styles.plusIcon, showActions && styles.plusIconActive]} />
          </View>
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textSecondary}
            multiline
            maxLength={1000}
            editable={!disabled}
            onFocus={() => setShowActions(false)}
          />
        </View>

        {message.trim() ? (
          <TouchableOpacity
            style={[styles.sendButton, disabled && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={disabled}
          >
            <View style={styles.sendIcon} />
          </TouchableOpacity>
        ) : onVoicePress ? (
          <TouchableOpacity style={styles.iconButton} onPress={onVoicePress}>
            <View style={styles.micIcon} />
          </TouchableOpacity>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  iconPlaceholder: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.textSecondary,
  },
  plusIconActive: {
    backgroundColor: COLORS.primary,
    transform: [{ rotate: '45deg' }],
  },
  actionsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    justifyContent: 'space-around',
  },
  actionItem: {
    alignItems: 'center',
    gap: 4,
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionLabel: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    maxHeight: 120,
  },
  input: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: COLORS.white,
    transform: [{ rotate: '90deg' }],
  },
  micIcon: {
    width: 12,
    height: 16,
    borderRadius: 6,
    backgroundColor: COLORS.textSecondary,
  },
});

export default ChatInput;
