import { apiService } from './api';
import { API_ENDPOINTS } from '@/utils/constants';
import { SubscriptionPlan, Subscription } from '@/types';

class SubscriptionService {
  async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await apiService.get<{ plans: SubscriptionPlan[] }>(
      API_ENDPOINTS.SUBSCRIPTIONS.PLANS
    );
    return response.plans;
  }

  async subscribe(priceId: string, paymentMethodId: string): Promise<Subscription> {
    return apiService.post<Subscription>(API_ENDPOINTS.SUBSCRIPTIONS.SUBSCRIBE, {
      price_id: priceId,
      payment_method_id: paymentMethodId,
    });
  }

  async cancelSubscription(): Promise<void> {
    await apiService.post(API_ENDPOINTS.SUBSCRIPTIONS.CANCEL);
  }
}

export const subscriptionService = new SubscriptionService();
