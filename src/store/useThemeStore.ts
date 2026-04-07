import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { ThemeMode } from '../utils/theme';

const THEME_KEY = 'app_theme_mode';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
  loadMode: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'system',

  setMode: async (mode: ThemeMode) => {
    set({ mode });
    try {
      await SecureStore.setItemAsync(THEME_KEY, mode);
    } catch {}
  },

  loadMode: async () => {
    try {
      const saved = await SecureStore.getItemAsync(THEME_KEY);
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        set({ mode: saved });
      }
    } catch {}
  },
}));
