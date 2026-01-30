import { create } from 'zustand';
import { SafetyCheckin, Coordinates } from '@/types';
import { safetyService } from '@/services';

interface SafetyState {
  activeCheckin: SafetyCheckin | null;
  isLoading: boolean;
  error: string | null;
  
  startCheckin: (data: {
    meeting_with: string;
    expected_end: string;
    auto_alert_minutes: number;
    emergency_contact_email?: string;
    emergency_contact_phone?: string;
  }) => Promise<void>;
  updateLocation: (coords: Coordinates) => Promise<void>;
  completeCheckin: () => Promise<void>;
  triggerSOS: () => Promise<void>;
  clearError: () => void;
}

export const useSafetyStore = create<SafetyState>((set, get) => ({
  activeCheckin: null,
  isLoading: false,
  error: null,

  startCheckin: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const checkin = await safetyService.startCheckin(data);
      set({
        activeCheckin: checkin,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to start check-in',
        isLoading: false,
      });
      throw error;
    }
  },

  updateLocation: async (coords) => {
    const { activeCheckin } = get();
    if (!activeCheckin) return;

    try {
      const updatedCheckin = await safetyService.updateLocation(activeCheckin.id, coords);
      set({ activeCheckin: updatedCheckin });
    } catch (error: any) {
      set({ error: error.message || 'Failed to update location' });
    }
  },

  completeCheckin: async () => {
    const { activeCheckin } = get();
    if (!activeCheckin) return;

    set({ isLoading: true, error: null });
    try {
      await safetyService.completeCheckin(activeCheckin.id);
      set({
        activeCheckin: null,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to complete check-in',
        isLoading: false,
      });
      throw error;
    }
  },

  triggerSOS: async () => {
    const { activeCheckin } = get();
    if (!activeCheckin) return;

    set({ isLoading: true, error: null });
    try {
      const updatedCheckin = await safetyService.triggerSOS(activeCheckin.id);
      set({
        activeCheckin: updatedCheckin,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to trigger SOS',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
