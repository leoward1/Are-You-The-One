import { supabase } from '@/config/supabase';
import { AuthResponse, LoginCredentials, SignupData, User } from '@/types';
import { analyticsService } from './analytics.service';

import { rateLimiter } from '@/utils/rateLimiter';
import { sanitizeText } from '@/utils/sanitizer';

class AuthService {

  async signup(data: SignupData): Promise<AuthResponse> {
    await rateLimiter.checkLimit('AUTH_SIGNUP', data.email);

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: sanitizeText(data.first_name, 50),
          last_name: sanitizeText(data.last_name, 50),
          gender: data.gender,
          birthdate: data.birthdate,
          city: sanitizeText(data.city, 100),
        },
      },
    });

    if (error) throw new Error(error.message);
    if (!authData.user) throw new Error('Signup failed');

    // SECURITY: Handle email verification requirement
    if (!authData.session) {
      throw new Error('Please check your email to verify your account before logging in.');
    }

    // Wait briefly for the trigger to create the profile
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Fetch the created profile
    const profile = await this.getCurrentUser();

    return {
      user: profile,
      tokens: {
        access_token: authData.session?.access_token || '',
        refresh_token: authData.session?.refresh_token || '',
        expires_in: authData.session?.expires_in || 3600,
      },
    };
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await rateLimiter.checkLimit('AUTH_LOGIN', credentials.email);

    if (!__DEV__) {
      analyticsService.track('auth_attempt', { email: credentials.email });
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      if (!__DEV__) {
        analyticsService.track('auth_failed', { email: credentials.email, reason: error.message });
      }
      throw new Error(error.message);
    }
    if (!authData.user) throw new Error('Login failed');

    await rateLimiter.resetLimit('AUTH_LOGIN', credentials.email);
    await rateLimiter.resetLimit('AUTH_SIGNUP', credentials.email);

    if (!__DEV__) {
      analyticsService.track('auth_success', { email: credentials.email });
    }

    const profile = await this.getCurrentUser();

    return {
      user: profile,
      tokens: {
        access_token: authData.session?.access_token || '',
        refresh_token: authData.session?.refresh_token || '',
        expires_in: authData.session?.expires_in || 3600,
      },
    };
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Logout error:', error.message);
  }

  async getCurrentUser(): Promise<User> {
    // SECURITY: Verify session and token expiry
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      throw new Error('Not authenticated');
    }

    const expiresAt = sessionData.session.expires_at;
    if (expiresAt && Date.now() / 1000 > expiresAt) {
      await this.logout();
      throw new Error('Session expired. Please log in again.');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Not authenticated');

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw new Error(error.message);

    // Fetch user photos
    const { data: photos } = await supabase
      .from('photos')
      .select('*')
      .eq('user_id', user.id)
      .order('position');

    // Fetch user settings
    const { data: settings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Fetch user preferences
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return {
      ...profile,
      email: user.email || profile.email,
      photos: photos || [],
      settings: settings || null,
      preferences: preferences || null,
    } as User;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Not authenticated');

    // Separate profile fields from related data
    const { photos, settings, preferences, ...profileData } = data as any;

    const { data: updated, error } = await supabase
      .from('profiles')
      .update({ ...profileData, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Update settings if provided
    if (settings) {
      await supabase
        .from('user_settings')
        .upsert({ user_id: user.id, ...settings, updated_at: new Date().toISOString() });
    }

    // Update preferences if provided
    if (preferences) {
      await supabase
        .from('user_preferences')
        .upsert({ user_id: user.id, ...preferences, updated_at: new Date().toISOString() });
    }

    return this.getCurrentUser();
  }

  async deleteAccount(): Promise<void> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Not authenticated');

    // SECURITY: Cascade-delete ALL user data across every table (GDPR compliance)
    const tablesToPurge = [
      { table: 'messages', column: 'from_user_id' },
      { table: 'likes', column: 'from_user_id' },
      { table: 'likes', column: 'to_user_id' },
      { table: 'reviews', column: 'from_user_id' },
      { table: 'call_sessions', column: 'from_user_id' },
      { table: 'safety_checkins', column: 'user_id' },
      { table: 'user_settings', column: 'user_id' },
      { table: 'user_preferences', column: 'user_id' },
      { table: 'subscriptions', column: 'user_id' },
      { table: 'photos', column: 'user_id' },
      { table: 'credit_transactions', column: 'user_id' },
      { table: 'user_credits', column: 'user_id' },
      { table: 'blocked_users', column: 'blocker_id' },
      { table: 'blocked_users', column: 'blocked_id' },
    ];

    for (const { table, column } of tablesToPurge) {
      await supabase.from(table).delete().eq(column, user.id);
    }

    // Delete matches where user is either party
    await supabase.from('matches').delete().or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`);

    // Delete profile last (referenced by other tables)
    const { error } = await supabase.from('profiles').delete().eq('id', user.id);
    if (error) throw new Error(error.message);

    // Delete storage (photos bucket)
    const { data: files } = await supabase.storage.from('photos').list(user.id);
    if (files && files.length > 0) {
      const filePaths = files.map(f => `${user.id}/${f.name}`);
      await supabase.storage.from('photos').remove(filePaths);
    }
  }

  async signInWithOAuth(provider: 'google' | 'apple') {
    // Note: On native, use signInWithIdToken or AuthSession
    // This is the simplest OAuth redirect for Supabase + Expo
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: 'areyoutheone://auth-callback',
      },
    });

    if (error) throw error;
    return data;
  }

  async resetPassword(email: string): Promise<void> {
    await rateLimiter.checkLimit('AUTH_LOGIN', email); // Re-using rate limiter to prevent spamming generic emails
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'areyoutheone://reset-password',
    });
    if (error) {
      throw new Error(error.message);
    }
  }
}

export const authService = new AuthService();
