import { create } from 'zustand';
import { SubscriptionTier, SubscriptionPlan, FeatureFlags } from '@/types';
import { subscriptionService } from '@/services';
import { getFeatureFlags } from '@/utils/helpers';

interface SubscriptionState {
  currentTier: SubscriptionTier;
  features: FeatureFlags;
  plans: SubscriptionPlan[];
  isLoading: boolean;
  error: string | null;
  
  loadPlans: () => Promise<void>;
  subscribe: (priceId: string, paymentMethodId: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  updateTier: (tier: SubscriptionTier) => void;
  canAccessFeature: (feature: keyof FeatureFlags) => boolean;
  clearError: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  currentTier: 'free',
  features: getFeatureFlags('free'),
  plans: [],
  isLoading: false,
  error: null,

  loadPlans: async () => {
    set({ isLoading: true, error: null });
    try {
      const plans = await subscriptionService.getPlans();
      set({
        plans,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to load plans',
        isLoading: false,
      });
    }
  },

  subscribe: async (priceId, paymentMethodId) => {
    set({ isLoading: true, error: null });
    try {
      const subscription = await subscriptionService.subscribe(priceId, paymentMethodId);
      set({
        currentTier: subscription.tier,
        features: getFeatureFlags(subscription.tier),
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Subscription failed',
        isLoading: false,
      });
      throw error;
    }
  },

  cancelSubscription: async () => {
    set({ isLoading: true, error: null });
    try {
      await subscriptionService.cancelSubscription();
      set({
        currentTier: 'free',
        features: getFeatureFlags('free'),
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Cancellation failed',
        isLoading: false,
      });
      throw error;
    }
  },

  updateTier: (tier) => {
    set({
      currentTier: tier,
      features: getFeatureFlags(tier),
    });
  },

  canAccessFeature: (feature) => {
    const { features } = get();
    return features[feature] as boolean;
  },

  clearError: () => set({ error: null }),
}));
