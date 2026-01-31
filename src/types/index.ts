// Core User Types
export type Gender = 'male' | 'female' | 'non-binary' | 'other';
export type SubscriptionTier = 'free' | 'plus' | 'pro';
export type LikeType = 'rose' | 'kiss';
export type MessageType = 'text' | 'image' | 'video' | 'voice' | 'date_suggestion';
export type UnlockedStage = 'text' | 'voice' | 'video';
export type MatchStatus = 'matched' | 'blocked' | 'ended';
export type CheckinStatus = 'active' | 'completed' | 'escalated';
export type CallKind = 'voice' | 'video';
export type DateCategory = 'coffee' | 'museum' | 'park' | 'dinner' | 'all';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  gender: Gender;
  birthdate: string;
  age?: number;
  city: string;
  bio?: string;
  interests: string[];
  looking_for?: string;
  distance_miles: number;
  min_age: number;
  max_age: number;
  tier: SubscriptionTier;
  verified_photo: boolean;
  verified_video: boolean;
  primary_photo?: string;
  photo_url?: string;
  photos?: Photo[];
  video_intro?: string;
  occupation?: string;
  height?: string;
  anim_enabled: boolean;
  reduce_motion: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  age: number;
  city: string;
  distance_miles?: number;
  bio?: string;
  interests: string[];
  headline?: string;
  lifestyle_tags: string[];
  height_in?: number;
  primary_photo?: string;
  photos: Photo[];
  compatibility_pct?: number;
  quiz_score?: number;
}

export interface Photo {
  id: string;
  user_id: string;
  url: string;
  is_primary: boolean;
  created_at: string;
}

export interface Like {
  id: string;
  from_user_id: string;
  to_user_id: string;
  type: LikeType;
  note?: string;
  media?: string;
  created_at: string;
  is_mutual_match?: boolean;
  match?: Match;
}

export interface Match {
  id: string;
  user_a_id: string;
  user_b_id: string;
  matched_user?: Profile;
  compatibility_pct: number;
  status: MatchStatus;
  unlocked_stage: UnlockedStage;
  message_count?: number;
  voice_call_count?: number;
  last_message?: Message;
  unread_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  match_id: string;
  from_user_id: string;
  type: MessageType;
  content?: string;
  media?: string;
  date_suggestion?: DateSuggestion;
  read: boolean;
  created_at: string;
}

export interface CallSession {
  id: string;
  match_id: string;
  kind: CallKind;
  started_at: string;
  ended_at?: string;
  duration_seconds?: number;
  status: 'active' | 'completed' | 'failed';
}

export interface SafetyCheckin {
  id: string;
  user_id: string;
  meeting_with: string;
  meeting_with_name?: string;
  start_time: string;
  expected_end: string;
  live_lat?: number;
  live_lng?: number;
  status: CheckinStatus;
  auto_alert_minutes: number;
  emergency_contact_email?: string;
  emergency_contact_phone?: string;
  sos_triggered_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DateSuggestion {
  id: string;
  city: string;
  category: DateCategory;
  name: string;
  address: string;
  avg_cost?: string;
  safety_rating?: number;
  google_maps_url?: string;
  image_url?: string;
  description?: string;
}

export interface Review {
  id: string;
  from_user_id: string;
  about_match_id: string;
  rating: number;
  headline: string;
  body: string;
  approved: boolean;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  price_id: string;
  interval: 'month' | 'year';
  features: {
    daily_reveals: number | 'unlimited';
    voice_unlock: 'immediate' | 'activity_based';
    video_unlock: 'immediate' | 'activity_based';
    daily_roses_kisses?: number | 'unlimited';
    profile_boost?: boolean;
    advanced_filters?: boolean;
  };
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  tier: SubscriptionTier;
  status: 'active' | 'canceled' | 'past_due' | 'expired';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
}

// Authentication Types
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  gender: Gender;
  birthdate: string;
  city: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, string>;
}

// Discovery Types
export interface DiscoveryResponse {
  profiles: Profile[];
  has_more: boolean;
  daily_reveals_remaining: number;
}

export interface SwipeAction {
  user_id: string;
  type: 'like' | 'pass';
  like_type?: LikeType;
  note?: string;
}

// Chat Types
export interface ChatConversation {
  match: Match;
  messages: Message[];
  has_more: boolean;
}

export interface SendMessageData {
  match_id: string;
  type: MessageType;
  content?: string;
  media?: File | Blob;
}

// Settings Types
export interface UserSettings {
  notifications_enabled: boolean;
  push_matches: boolean;
  push_messages: boolean;
  push_safety: boolean;
  email_notifications: boolean;
  anim_enabled: boolean;
  reduce_motion: boolean;
  sound_enabled: boolean;
}

export interface UserPreferences {
  min_age: number;
  max_age: number;
  distance_miles: number;
  looking_for: string;
  show_me: Gender[];
}

// Feature Flags
export interface FeatureFlags {
  canAccessVoice: boolean;
  canAccessVideo: boolean;
  dailyRevealsLimit: number | 'unlimited';
  canBoostProfile: boolean;
  canUseAdvancedFilters: boolean;
  dailyLikesLimit: number | 'unlimited';
}

// Location Types
export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

// Notification Types
export interface PushNotification {
  id: string;
  type: 'match' | 'message' | 'safety' | 'subscription';
  title: string;
  body: string;
  data?: Record<string, any>;
  created_at: string;
}

// Analytics Event Types
export type AnalyticsEvent =
  | { name: 'sign_up_completed'; properties: { method: string } }
  | { name: 'profile_completed'; properties: { has_video: boolean } }
  | { name: 'swipe_left'; properties: { user_id: string } }
  | { name: 'swipe_right_rose'; properties: { user_id: string } }
  | { name: 'swipe_right_kiss'; properties: { user_id: string } }
  | { name: 'mutual_match_created'; properties: { match_id: string } }
  | { name: 'message_sent'; properties: { type: MessageType; match_id: string } }
  | { name: 'voice_call_started'; properties: { match_id: string } }
  | { name: 'video_call_started'; properties: { match_id: string } }
  | { name: 'safety_checkin_started'; properties: { duration_minutes: number } }
  | { name: 'safety_auto_alert_sent'; properties: { checkin_id: string } }
  | { name: 'sos_triggered'; properties: { checkin_id: string } }
  | { name: 'date_suggestion_shared'; properties: { suggestion_id: string } }
  | { name: 'subscription_upgraded'; properties: { tier: SubscriptionTier } };

// Form Validation Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string;
}

// Upload Types
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileUpload {
  uri: string;
  type: string;
  name: string;
}
