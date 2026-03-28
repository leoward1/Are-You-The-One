import { createClient } from '@segment/analytics-react-native';
import { AnalyticsEvent } from '../types';
import Constants from 'expo-constants';

// Real Segment client initialization
const segmentClient = createClient({
  writeKey: Constants.expoConfig?.extra?.segmentWriteKey || 'WRITE_KEY_HERE',
  trackAppLifecycleEvents: true,
});

class AnalyticsService {
  private client = segmentClient;

  /**
   * Track an event in the application using Segment.
   */
  track<T extends AnalyticsEvent['name']>(
    name: T,
    properties?: Extract<AnalyticsEvent, { name: T }>['properties']
  ) {
    if (__DEV__) {
        console.log(`[Segment] Track: ${name}`, properties);
    }

    try {
        this.client.track(name, properties);
    } catch (err) {
        console.warn('Analytics track failed:', err);
    }
  }

  /**
   * Identify a user in Segment.
   */
  identify(userId: string, traits?: Record<string, any>) {
    if (__DEV__) {
      console.log(`[Segment] Identify: ${userId}`, traits);
    }
    
    try {
        this.client.identify(userId, traits);
    } catch (err) {
        console.warn('Analytics identify failed:', err);
    }
  }

  /**
   * Reset user on logout.
   */
  reset() {
    this.client.reset();
  }
}

export const analyticsService = new AnalyticsService();
