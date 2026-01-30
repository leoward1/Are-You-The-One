import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MatchesStackParamList } from '../../navigation/MatchesNavigator';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../utils/constants';
import { MessageBubble, ChatInput } from '../../components/chat';
import { Avatar } from '../../components/ui';

type ChatScreenProps = {
  route: RouteProp<MatchesStackParamList, 'Chat'>;
  navigation: NativeStackNavigationProp<MatchesStackParamList, 'Chat'>;
};

const MOCK_MESSAGES = [
  { id: '1', content: 'Hey! How are you?', senderId: 'other', timestamp: new Date().toISOString() },
  { id: '2', content: 'I am doing great! Just got back from a hike.', senderId: 'me', timestamp: new Date().toISOString() },
  { id: '3', content: 'That sounds amazing! Where did you go?', senderId: 'other', timestamp: new Date().toISOString() },
  { id: '4', content: 'Went to the mountains nearby. The view was incredible!', senderId: 'me', timestamp: new Date().toISOString() },
];

export default function ChatScreen({ route, navigation }: ChatScreenProps) {
  const { matchId, matchName } = route.params;
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = (content: string) => {
    const newMessage = {
      id: Date.now().toString(),
      content,
      senderId: 'me',
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const renderMessage = ({ item }: { item: typeof MOCK_MESSAGES[0] }) => (
    <MessageBubble
      message={item}
      isOwn={item.senderId === 'me'}
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
          <Text style={styles.headerStatus}>Online</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerAction}>
            <Text style={styles.actionIcon}>📞</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerAction}>
            <Text style={styles.actionIcon}>📹</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      <ChatInput onSend={handleSend} />
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
});
