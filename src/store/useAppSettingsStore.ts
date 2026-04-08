import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const SOUND_KEY = 'app_sound_enabled';

interface AppSettingsState {
  soundEnabled: boolean;
  settingsLoaded: boolean;
  loadAppSettings: () => Promise<void>;
  setSoundEnabled: (enabled: boolean) => Promise<void>;
}

export const useAppSettingsStore = create<AppSettingsState>((set) => ({
  soundEnabled: true,
  settingsLoaded: false,

  loadAppSettings: async () => {
    try {
      const val = await SecureStore.getItemAsync(SOUND_KEY);
      set({
        soundEnabled: val === null ? true : val === 'true',
        settingsLoaded: true,
      });
    } catch {
      set({ settingsLoaded: true });
    }
  },

  setSoundEnabled: async (enabled: boolean) => {
    set({ soundEnabled: enabled });
    try {
      await SecureStore.setItemAsync(SOUND_KEY, String(enabled));
    } catch {}
  },
}));
