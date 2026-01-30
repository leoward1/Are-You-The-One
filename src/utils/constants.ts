export const COLORS = {
  primary: '#FF6B9D',
  secondary: '#FF8FAB',
  accent: '#FFB3C6',
  white: '#FFFFFF',
  background: '#FFFFFF',
  backgroundDark: '#1A1A1A',
  surface: '#F8F8F8',
  surfaceDark: '#2A2A2A',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textLight: '#FFFFFF',
  border: '#E0E0E0',
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
  info: '#007AFF',
  rose: '#FF1744',
  kiss: '#E91E63',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const SIZES = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const SCREEN_WIDTH = 375;
export const SCREEN_HEIGHT = 812;

export const CARD_WIDTH = SCREEN_WIDTH * 0.9;
export const CARD_HEIGHT = SCREEN_HEIGHT * 0.65;

export const SWIPE_THRESHOLD = 120;
export const SWIPE_VELOCITY_THRESHOLD = 0.5;

export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
};

export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  USER: {
    ME: '/users/me',
    UPDATE: '/users/me',
    PHOTOS: '/users/me/photos',
    DELETE_PHOTO: (photoId: string) => `/users/me/photos/${photoId}`,
  },
  DISCOVERY: {
    PROFILES: '/discovery/profiles',
  },
  LIKES: {
    CREATE: '/likes',
  },
  PASSES: {
    CREATE: '/passes',
  },
  MATCHES: {
    LIST: '/matches',
    MESSAGES: (matchId: string) => `/matches/${matchId}/messages`,
    SEND_MESSAGE: (matchId: string) => `/matches/${matchId}/messages`,
    UNLOCK: (matchId: string) => `/matches/${matchId}/unlock`,
    SHARE_DATE: (matchId: string) => `/matches/${matchId}/share-date`,
  },
  SAFETY: {
    CHECKINS: '/safety/checkins',
    UPDATE_LOCATION: (checkinId: string) => `/safety/checkins/${checkinId}/location`,
    COMPLETE: (checkinId: string) => `/safety/checkins/${checkinId}/complete`,
    SOS: (checkinId: string) => `/safety/checkins/${checkinId}/sos`,
  },
  DATES: {
    SUGGESTIONS: '/dates/suggestions',
  },
  REVIEWS: {
    CREATE: '/reviews',
    LIST: '/reviews',
  },
  SUBSCRIPTIONS: {
    PLANS: '/subscriptions/plans',
    SUBSCRIBE: '/subscriptions/subscribe',
    CANCEL: '/subscriptions/cancel',
  },
};

export const SUBSCRIPTION_FEATURES = {
  free: {
    dailyReveals: 10,
    voiceUnlock: 'activity_based',
    videoUnlock: 'activity_based',
    dailyLikes: 10,
  },
  plus: {
    dailyReveals: 50,
    voiceUnlock: 'immediate',
    videoUnlock: 'activity_based',
    dailyLikes: 50,
  },
  pro: {
    dailyReveals: Infinity,
    voiceUnlock: 'immediate',
    videoUnlock: 'immediate',
    dailyLikes: Infinity,
    profileBoost: true,
  },
} as const;

export const UNLOCK_REQUIREMENTS = {
  voice: {
    messageCount: 10,
    tierOverride: ['plus', 'pro'],
  },
  video: {
    voiceCallCount: 1,
    tierOverride: ['pro'],
  },
} as const;

export const LOCATION_UPDATE_INTERVAL = 5 * 60 * 1000;

export const INTERESTS = [
  'Hiking',
  'Photography',
  'Cooking',
  'Travel',
  'Yoga',
  'Art',
  'Music',
  'Reading',
  'Fitness',
  'Dancing',
  'Gaming',
  'Movies',
  'Coffee',
  'Wine',
  'Pets',
  'Sports',
  'Fashion',
  'Technology',
  'Volunteering',
  'Meditation',
];

export const LIFESTYLE_TAGS = [
  'Active',
  'Adventurous',
  'Ambitious',
  'Artistic',
  'Chill',
  'Creative',
  'Eco-conscious',
  'Foodie',
  'Health-conscious',
  'Homebody',
  'Night owl',
  'Early bird',
  'Outdoorsy',
  'Social butterfly',
  'Spiritual',
  'Spontaneous',
];

export const DATE_CATEGORIES = [
  { id: 'all', label: 'All', icon: '🎯' },
  { id: 'coffee', label: 'Coffee', icon: '☕' },
  { id: 'dinner', label: 'Dinner', icon: '🍽️' },
  { id: 'museum', label: 'Museum', icon: '🎨' },
  { id: 'park', label: 'Park', icon: '🌳' },
];

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Session expired. Please login again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
};

export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully!',
  PHOTO_UPLOADED: 'Photo uploaded successfully!',
  MESSAGE_SENT: 'Message sent!',
  CHECKIN_STARTED: 'Safety check-in started.',
  CHECKIN_COMPLETED: 'Check-in completed. Stay safe!',
  SUBSCRIPTION_UPDATED: 'Subscription updated successfully!',
};

export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  BIO_MAX_LENGTH: 500,
  MESSAGE_MAX_LENGTH: 1000,
  MIN_AGE: 18,
  MAX_AGE: 100,
  MIN_DISTANCE: 1,
  MAX_DISTANCE: 100,
};
