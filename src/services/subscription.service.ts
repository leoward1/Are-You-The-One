import { supabase } from '@/config/supabase';
import { SubscriptionPlan, Subscription } from '@/types';

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
          daily_reveals: 10,
          voice_unlock: 'activity_based',
          video_unlock: 'activity_based',
          daily_roses_kisses: 10,
        },
      },
      {
        id: 'plus',
        name: 'Plus',
        price: 9.99,
        price_id: 'price_plus_monthly',
        interval: 'month',
        features: {
          daily_reveals: 50,
          voice_unlock: 'immediate',
          video_unlock: 'activity_based',
          daily_roses_kisses: 50,
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

    // Determine tier from priceId
    const tier = priceId.includes('pro') ? 'pro' : priceId.includes('plus') ? 'plus' : 'free';

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        tier,
        status: 'active',
        stripe_subscription_id: paymentMethodId,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return subscription as Subscription;
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
}

export const subscriptionService = new SubscriptionService();
