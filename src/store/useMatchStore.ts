import { create } from 'zustand';
import { Profile, Match, LikeType } from '@/types';
import { matchService } from '@/services';
import { supabase } from '@/config/supabase';

interface MatchState {
  discoveryProfiles: Profile[];
  currentProfileIndex: number;
  matches: Match[];
  dailyRevealsRemaining: number;
  isLoading: boolean;
  error: string | null;
  activeMatchId: string | null;

  loadProfiles: () => Promise<void>;
  sendLike: (userId: string, type: LikeType, note?: string) => Promise<Match | null>;
  sendPass: (userId: string) => Promise<void>;
  nextProfile: () => void;
  loadMatches: () => Promise<void>;
  unlockStage: (matchId: string) => Promise<void>;
  checkAndUpgradeUnlockStage: (match: Match, tier: string) => Promise<void>;
  subscribeToMatchUpdates: () => () => void;
  clearUnreadCount: (matchId: string) => void;
  setActiveMatch: (matchId: string | null) => void;
  clearError: () => void;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  discoveryProfiles: [],
  currentProfileIndex: 0,
  matches: [],
  dailyRevealsRemaining: 10,
  isLoading: false,
  error: null,
  activeMatchId: null,

  loadProfiles: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await matchService.getDiscoveryProfiles();
      set({
        discoveryProfiles: response.profiles,
        dailyRevealsRemaining: response.daily_reveals_remaining,
        currentProfileIndex: 0,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to load profiles',
        isLoading: false,
      });
    }
  },

  sendLike: async (userId, type, note) => {
    try {
      const response = await matchService.sendLike(userId, type, note);

      if (response.is_mutual_match && response.match) {
        const { matches } = get();
        set({ matches: [response.match, ...matches] });
        return response.match;
      }

      return null;
    } catch (error: any) {
      set({ error: error.message || 'Failed to send like' });
      throw error;
    }
  },

  sendPass: async (userId) => {
    try {
      await matchService.sendPass(userId);
    } catch (error: any) {
      set({ error: error.message || 'Failed to pass' });
    }
  },

  nextProfile: () => {
    const { currentProfileIndex, discoveryProfiles } = get();
    if (currentProfileIndex < discoveryProfiles.length - 1) {
      set({ currentProfileIndex: currentProfileIndex + 1 });
    } else {
      get().loadProfiles();
    }
  },

  loadMatches: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await matchService.getMatches();
      set({
        matches: response.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to load matches',
        isLoading: false,
      });
    }
  },

  unlockStage: async (matchId) => {
    set({ isLoading: true, error: null });
    try {
      const updatedMatch = await matchService.unlockStage(matchId);
      const { matches } = get();
      set({
        matches: matches.map((m) => (m.id === matchId ? updatedMatch : m)),
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to unlock stage',
        isLoading: false,
      });
      throw error;
    }
  },

  checkAndUpgradeUnlockStage: async (match, tier) => {
    try {
      const updatedMatch = await matchService.checkAndUpgradeUnlockStage(match, tier);
      if (updatedMatch.unlocked_stage !== match.unlocked_stage) {
        const { matches } = get();
        set({
          matches: matches.map((m) => (m.id === match.id ? updatedMatch : m)),
        });
      }
    } catch (error: any) {
      console.error('Failed to auto-upgrade stage:', error);
    }
  },

  subscribeToMatchUpdates: () => {
    const channel = supabase
      .channel('match_list_updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new as any;
          const { matches } = get();
          
          // Check if this message belongs to one of our matches
          const matchIndex = matches.findIndex(m => m.id === newMessage.match_id);
          if (matchIndex !== -1) {
            const updatedMatches = [...matches];
            const targetMatch = { ...updatedMatches[matchIndex] };
            
            // Update last message and unread count
            targetMatch.last_message = newMessage;
            
            // Only increment unread if the chat for this match is NOT currently open
            supabase.auth.getUser().then(({ data }) => {
              const { activeMatchId } = get();
              if (newMessage.from_user_id !== data.user?.id && activeMatchId !== newMessage.match_id) {
                targetMatch.unread_count = (targetMatch.unread_count || 0) + 1;
              }
              targetMatch.updated_at = newMessage.created_at;

              // Remove from old position and move to top
              updatedMatches.splice(matchIndex, 1);
              set({ matches: [targetMatch, ...updatedMatches] });
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  clearUnreadCount: (matchId: string) => {
    const { matches } = get();
    set({
      matches: matches.map((m) =>
        m.id === matchId ? { ...m, unread_count: 0 } : m
      ),
    });
  },

  setActiveMatch: (matchId: string | null) => {
    set({ activeMatchId: matchId });
    // Also clear unread immediately when entering a chat
    if (matchId) {
      const { matches } = get();
      set({
        matches: matches.map((m) =>
          m.id === matchId ? { ...m, unread_count: 0 } : m
        ),
      });
    }
  },

  clearError: () => set({ error: null }),
}));
