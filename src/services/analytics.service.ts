// Lazy load Segment to prevent crash on module import
let createClient: any = null;
try {
  createClient = require('@segment/analytics-react-native').createClient;
} catch (e) {
  console.warn('Segment analytics not available:', e);
}

import { AnalyticsEvent } from '../types';
import Constants from 'expo-constants';

// SECURITY: Validate segment key is real before initializing
const segmentWriteKey = process.env.EXPO_PUBLIC_SEGMENT_WRITE_KEY || '';
const isValidKey = segmentWriteKey && segmentWriteKey !== 'SEGMENT_WRITE_KEY_HERE' && segmentWriteKey !== 'WRITE_KEY_HERE';

const segmentClient = (isValidKey && createClient)
  ? createClient({
      writeKey: segmentWriteKey,
      trackAppLifecycleEvents: true,
    })
  : null;

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
        this.client?.track(name, properties);
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
        this.client?.identify(userId, traits);
    } catch (err) {
        console.warn('Analytics identify failed:', err);
    }
  }

  /**
   * Reset user on logout.
   */
  reset() {
    this.client?.reset();
  }
}

export const analyticsService = new AnalyticsService();
