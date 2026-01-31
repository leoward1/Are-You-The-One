import { SubscriptionTier, FeatureFlags, UnlockedStage, Match } from '@/types';
import { SUBSCRIPTION_FEATURES, UNLOCK_REQUIREMENTS } from './constants';

export const getFeatureFlags = (tier: SubscriptionTier): FeatureFlags => {
  const features = SUBSCRIPTION_FEATURES[tier];
  
  return {
    canAccessVoice: tier === 'plus' || tier === 'pro',
    canAccessVideo: tier === 'pro',
    dailyRevealsLimit: features.dailyReveals === Infinity ? 'unlimited' : features.dailyReveals,
    canBoostProfile: tier === 'pro',
    canUseAdvancedFilters: tier === 'pro',
    dailyLikesLimit: features.dailyLikes === Infinity ? 'unlimited' : features.dailyLikes,
  };
};

export const canUnlockStage = (
  match: Match,
  currentStage: UnlockedStage,
  nextStage: 'voice' | 'video',
  userTier: SubscriptionTier
): { canUnlock: boolean; reason?: string } => {
  if (nextStage === 'voice') {
    const requirements = UNLOCK_REQUIREMENTS.voice;
    
    if ((requirements.tierOverride as readonly string[]).includes(userTier)) {
      return { canUnlock: true };
    }
    
    if ((match.message_count || 0) >= requirements.messageCount) {
      return { canUnlock: true };
    }
    
    return {
      canUnlock: false,
      reason: `Send ${requirements.messageCount - (match.message_count || 0)} more messages to unlock voice`,
    };
  }
  
  if (nextStage === 'video') {
    const requirements = UNLOCK_REQUIREMENTS.video;
    
    if ((requirements.tierOverride as readonly string[]).includes(userTier)) {
      return { canUnlock: true };
    }
    
    if ((match.voice_call_count || 0) >= requirements.voiceCallCount) {
      return { canUnlock: true };
    }
    
    return {
      canUnlock: false,
      reason: `Complete ${requirements.voiceCallCount} voice call to unlock video`,
    };
  }
  
  return { canUnlock: false, reason: 'Unknown stage' };
};

export const getNextUnlockStage = (currentStage: UnlockedStage): 'voice' | 'video' | null => {
  if (currentStage === 'text') return 'voice';
  if (currentStage === 'voice') return 'video';
  return null;
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 3959;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10;
};

const toRad = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const retry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await sleep(delay);
    return retry(fn, retries - 1, delay * 2);
  }
};

export const isWithinTimeWindow = (
  startTime: string,
  endTime: string,
  bufferMinutes: number = 0
): boolean => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  if (bufferMinutes > 0) {
    end.setMinutes(end.getMinutes() + bufferMinutes);
  }
  
  return now >= start && now <= end;
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

export const uniqueBy = <T>(array: T[], key: keyof T): T[] => {
  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};
