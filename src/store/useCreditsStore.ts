/**
 * Credits Store (Zustand)
 * Manages the user's credit balance, purchase state, and spending.
 */
import { create } from 'zustand';
import { iapService, CreditPack, CreditAction, CREDIT_COSTS } from '@/services/iap.service';

interface CreditsState {
  // State
  balance: number;
  packs: CreditPack[];
  isLoading: boolean;
  isPurchasing: boolean;
  purchasingProductId: string | null;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  cleanup: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  loadPacks: () => Promise<void>;
  purchasePack: (productId: string) => Promise<void>;
  spendCredits: (action: CreditAction) => Promise<boolean>;
  restorePurchases: () => Promise<void>;
  addCredits: (amount: number) => void;
  clearError: () => void;
}

export const useCreditsStore = create<CreditsState>((set, get) => ({
  balance: 0,
  packs: [],
  isLoading: false,
  isPurchasing: false,
  purchasingProductId: null,
  isInitialized: false,
  error: null,

  initialize: async () => {
    if (get().isInitialized) return;

    try {
      await iapService.initialize((credits: number) => {
        // Callback when credits are purchased via the listener
        set((state) => ({
          balance: state.balance + credits,
          isPurchasing: false,
          purchasingProductId: null,
        }));
      });
      set({ isInitialized: true });

      // Load balance and packs in parallel
      await Promise.all([
        get().refreshBalance(),
        get().loadPacks(),
      ]);
    } catch (err: any) {
      console.warn('[CreditsStore] Initialization error:', err);
      set({ error: err.message, isInitialized: true });
    }
  },

  cleanup: async () => {
    await iapService.cleanup();
    set({ isInitialized: false });
  },

  refreshBalance: async () => {
    try {
      const balance = await iapService.getBalance();
      set({ balance });
    } catch (err: any) {
      console.warn('[CreditsStore] Failed to refresh balance:', err);
    }
  },

  loadPacks: async () => {
    set({ isLoading: true, error: null });
    try {
      const packs = await iapService.fetchProducts();
      set({ packs, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  purchasePack: async (productId: string) => {
    set({ isPurchasing: true, purchasingProductId: productId, error: null });
    try {
      await iapService.purchaseCredits(productId);
      // Note: balance update happens via the purchaseUpdatedListener callback above
      // We set a timeout fallback in case the listener fires before we can catch it
      setTimeout(() => {
        const state = get();
        if (state.isPurchasing) {
          // If still purchasing after 30s, reset state
          set({ isPurchasing: false, purchasingProductId: null });
        }
      }, 30000);
    } catch (err: any) {
      set({
        isPurchasing: false,
        purchasingProductId: null,
        error: err.message || 'Purchase failed',
      });
    }
  },

  spendCredits: async (action: CreditAction) => {
    const cost = CREDIT_COSTS[action];
    const { balance } = get();

    if (balance < cost) {
      set({ error: 'Insufficient credits' });
      return false;
    }

    try {
      const success = await iapService.spendCredits(action);
      if (success) {
        set((state) => ({ balance: state.balance - cost }));
      }
      return success;
    } catch (err: any) {
      set({ error: err.message });
      return false;
    }
  },

  restorePurchases: async () => {
    set({ isLoading: true, error: null });
    try {
      await iapService.restorePurchases();
      await get().refreshBalance();
      set({ isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
    }
  },

  addCredits: (amount: number) => {
    set((state) => ({ balance: state.balance + amount }));
  },

  clearError: () => set({ error: null }),
}));
