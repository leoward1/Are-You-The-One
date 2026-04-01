import * as SecureStore from 'expo-secure-store';

type LimitType = 'AUTH_LOGIN' | 'AUTH_SIGNUP' | 'API_GLOBAL' | 'AI_GENERATE';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // The rolling window in milliseconds
}

const LIMITS: Record<LimitType, RateLimitConfig> = {
  AUTH_LOGIN: { maxRequests: 5, windowMs: 5 * 60 * 1000 }, // 5 attempts per 5 minutes
  AUTH_SIGNUP: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  API_GLOBAL: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per 1 minute
  AI_GENERATE: { maxRequests: 5, windowMs: 60 * 1000 }, // 5 AI requests per minute
};

class RateLimiter {
  // In-memory tracker for high-velocity API traffic
  private memoryLogs: Map<string, number[]> = new Map();

  /**
   * Checks if an action is within allowed rate limits.
   * Uses SecureStore for auth routes to persist across restarts,
   * Uses fast in-memory mapping for API/Bot throttles.
   */
  async checkLimit(type: LimitType, identifier: string = 'global'): Promise<void> {
    const config = LIMITS[type];
    const now = Date.now();
    const key = `ratelimit_${type}_${identifier}`;

    let timestamps: number[] = [];

    // 1. Fetch Request History (Persisted vs Memory)
    if (type === 'AUTH_LOGIN' || type === 'AUTH_SIGNUP') {
      try {
        const stored = await SecureStore.getItemAsync(key);
        if (stored) {
          timestamps = JSON.parse(stored);
        }
      } catch (e) {
        // Fallback to empty if SecureStore fails
      }
    } else {
      timestamps = this.memoryLogs.get(key) || [];
    }

    // 2. Sliding Window Filter (remove older timestamps outside window)
    timestamps = timestamps.filter(timestamp => now - timestamp < config.windowMs);

    // 3. Evaluate Threshold
    if (timestamps.length >= config.maxRequests) {
      const remainingMs = config.windowMs - (now - timestamps[0]);
      const minutes = Math.ceil(remainingMs / 60000);
      
      throw new Error(`Rate limit exceeded. Too many requests for ${type}. Try again in ${minutes} minutes.`);
    }

    // 4. Record New Event
    timestamps.push(now);

    // 5. Save State back
    if (type === 'AUTH_LOGIN' || type === 'AUTH_SIGNUP') {
      try {
        await SecureStore.setItemAsync(key, JSON.stringify(timestamps));
      } catch (e) {
        // Ignore Storage write errors gracefully
      }
    } else {
      this.memoryLogs.set(key, timestamps);
    }
  }

  /**
   * Call this upon a successful login/signup to clear the penalty box.
   */
  async resetLimit(type: 'AUTH_LOGIN' | 'AUTH_SIGNUP', identifier: string = 'global'): Promise<void> {
    const key = `ratelimit_${type}_${identifier}`;
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      // Ignore
    }
  }
}

export const rateLimiter = new RateLimiter();
