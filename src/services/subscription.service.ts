import { supabase } from '@/config/supabase';
import { SubscriptionPlan, Subscription } from '@/types';
import { apiService } from './api';

class SubscriptionService {
  async getPlans(): Promise<SubscriptionPlan[]> {
    // Subscription plans are typically static; return hardcoded plans
    // In production, these could come from a Supabase table or Stripe
    return [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        price_id: 'price_free',
        interval: 'month',
        features: {
          daily_reveals: 5,
          voice_unlock: 'activity_based',
          video_unlock: 'activity_based',
          daily_roses_kisses: 5,
        },
      },
      {
        id: 'plus',
        name: 'Plus',
        price: 9.99,
        price_id: 'price_plus_monthly',
        interval: 'month',
        features: {
          daily_reveals: 25,
          voice_unlock: 'immediate',
          video_unlock: 'activity_based',
          daily_roses_kisses: 25,
        },
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 19.99,
        price_id: 'price_pro_monthly',
        interval: 'month',
        features: {
          daily_reveals: 'unlimited',
          voice_unlock: 'immediate',
          video_unlock: 'immediate',
          daily_roses_kisses: 'unlimited',
          profile_boost: true,
          advanced_filters: true,
        },
      },
    ] as SubscriptionPlan[];
  }

  async subscribe(priceId: string, paymentMethodId: string): Promise<Subscription> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // SECURITY: Tier assignment and active subscription status MUST be securely
    // finalized on the backend by verifying the Stripe/StoreKit receipt.
    // NEVER allow the client to mutate the 'subscriptions' table directly.
    try {
      const subscription = await apiService.post<Subscription>('/stripe/subscribe', {
        priceId,
        paymentMethodId,
      });
      return subscription;
    } catch (error: any) {
      console.error('[Subscription] Backend verification failed:', error);
      throw new Error('Failed to process and verify the subscription securely.');
    }
  }

  async cancelSubscription(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (error) throw new Error(error.message);
  }

  async getCurrentSubscription(): Promise<Subscription | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    return subscription as Subscription | null;
  }

  async initializePaymentSheet(priceId: string): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // SECURITY: Rely on authenticated API service wrapper to reach Stripe Edge Function
    try {
      const response = await apiService.post<any>('/stripe/payment-sheet', {
        priceId,
        userId: user.id,
      });

      return {
        paymentIntent: response.paymentIntent,
        ephemeralKey: response.ephemeralKey,
        customer: response.customer,
      };
    } catch (error: any) {
      console.error('[Subscription] Failed to init payment sheet:', error);
      throw new Error('Could not establish secure payment connection.');
    }
  }
}

export const subscriptionService = new SubscriptionService();
