import { create } from 'zustand';
import { User, LoginCredentials, SignupData } from '@/types';
import { authService, apiService } from '@/services';
import { supabase } from '@/config/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePresence: () => Promise<void>;
  initAuthListener: () => () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  updatePresence: async () => {
    const { user } = get();
    if (!user) return;
    try {
      await supabase
        .from('profiles')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', user.id);
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(credentials);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });

      // Synchronize tokens with apiService
      if (response.tokens.access_token) {
        await apiService.setTokens(response.tokens.access_token, response.tokens.refresh_token);
      }
    } catch (error: any) {
      set({
        error: error.message || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  signup: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.signup(data);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });

      // Synchronize tokens with apiService
      if (response.tokens.access_token) {
        await apiService.setTokens(response.tokens.access_token, response.tokens.refresh_token);
      }
    } catch (error: any) {
      set({
        error: error.message || 'Signup failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({ isLoading: false });
    }
  },

  loadUser: async () => {
    set({ isLoading: true });
    try {
      const user = await authService.getCurrentUser();
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await authService.updateProfile(data);
      set({
        user: updatedUser,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Update failed',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteAccount: async () => {
    const { logout } = get();
    set({ isLoading: true, error: null });
    try {
      // Logic for deleting account in authService
      await authService.deleteAccount();
      await logout();
    } catch (error: any) {
      set({
        error: error.message || 'Delete account failed',
        isLoading: false,
      });
      throw error;
    }
  },

  signInWithApple: async () => {
    set({ isLoading: true, error: null });
    try {
      await authService.signInWithApple();
      await get().loadUser();
    } catch (error: any) {
      set({
        error: error.message || 'Apple Sign In failed',
        isLoading: false,
      });
      throw error;
    }
  },

  resetPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      await authService.resetPassword(email);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Password reset failed',
        isLoading: false,
      });
      throw error;
    }
  },

  // Listen for Supabase auth state changes (session restore, sign out, etc.)
  initAuthListener: () => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Only load user if not already loaded
          const { user } = get();
          if (!user) {
            get().loadUser();
          }
        } else if (event === 'SIGNED_OUT') {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          // Clear apiService tokens
          await apiService.clearTokens();
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Token refreshed automatically by Supabase, sync with apiService
          if (__DEV__) console.log('Auth token refreshed');
          await apiService.setTokens(session.access_token, session.refresh_token || '');
        }
      }
    );

    // Return unsubscribe function for cleanup
    return () => subscription.unsubscribe();
  },

  clearError: () => set({ error: null }),
}));
