import { create } from 'zustand';
import { Profile, Match, LikeType } from '@/types';
import { matchService } from '@/services';

interface MatchState {
  discoveryProfiles: Profile[];
  currentProfileIndex: number;
  matches: Match[];
  dailyRevealsRemaining: number;
  isLoading: boolean;
  error: string | null;
  
  loadProfiles: () => Promise<void>;
  sendLike: (userId: string, type: LikeType, note?: string) => Promise<Match | null>;
  sendPass: (userId: string) => Promise<void>;
  nextProfile: () => void;
  loadMatches: () => Promise<void>;
  unlockStage: (matchId: string) => Promise<void>;
  clearError: () => void;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  discoveryProfiles: [],
  currentProfileIndex: 0,
  matches: [],
  dailyRevealsRemaining: 10,
  isLoading: false,
  error: null,

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

  clearError: () => set({ error: null }),
}));
