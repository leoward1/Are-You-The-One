import { create } from 'zustand';
import { Message, SendMessageData } from '@/types';
import { chatService } from '@/services';

interface ChatState {
  conversations: Record<string, Message[]>;
  unreadCounts: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  
  loadMessages: (matchId: string) => Promise<void>;
  sendMessage: (data: SendMessageData) => Promise<void>;
  addOptimisticMessage: (matchId: string, message: Message) => void;
  updateMessage: (matchId: string, tempId: string, message: Message) => void;
  markAsRead: (matchId: string) => void;
  clearError: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: {},
  unreadCounts: {},
  isLoading: false,
  error: null,

  loadMessages: async (matchId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await chatService.getMessages(matchId);
      const { conversations } = get();
      set({
        conversations: {
          ...conversations,
          [matchId]: response.data,
        },
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to load messages',
        isLoading: false,
      });
    }
  },

  sendMessage: async (data) => {
    try {
      const message = await chatService.sendMessage(data);
      const { conversations } = get();
      const matchMessages = conversations[data.match_id] || [];
      
      set({
        conversations: {
          ...conversations,
          [data.match_id]: [...matchMessages, message],
        },
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to send message' });
      throw error;
    }
  },

  addOptimisticMessage: (matchId, message) => {
    const { conversations } = get();
    const matchMessages = conversations[matchId] || [];
    set({
      conversations: {
        ...conversations,
        [matchId]: [...matchMessages, message],
      },
    });
  },

  updateMessage: (matchId, tempId, message) => {
    const { conversations } = get();
    const matchMessages = conversations[matchId] || [];
    set({
      conversations: {
        ...conversations,
        [matchId]: matchMessages.map((m) => (m.id === tempId ? message : m)),
      },
    });
  },

  markAsRead: (matchId) => {
    const { unreadCounts } = get();
    set({
      unreadCounts: {
        ...unreadCounts,
        [matchId]: 0,
      },
    });
  },

  clearError: () => set({ error: null }),
}));
