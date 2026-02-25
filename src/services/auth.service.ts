import { supabase } from '@/config/supabase';
import { AuthResponse, LoginCredentials, SignupData, User } from '@/types';

class AuthService {
  async signup(data: SignupData): Promise<AuthResponse> {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          age: data.age,
          gender: data.gender,
          city: data.city,
        },
      },
    });

    if (error) throw new Error(error.message);
    if (!authData.user) throw new Error('Signup failed');

    // Wait briefly for the trigger to create the profile
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Fetch the created profile
    const profile = await this.getCurrentUser();

    return {
      user: profile,
      tokens: {
        access_token: authData.session?.access_token || '',
        refresh_token: authData.session?.refresh_token || '',
      },
    };
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw new Error(error.message);
    if (!authData.user) throw new Error('Login failed');

    const profile = await this.getCurrentUser();

    return {
      user: profile,
      tokens: {
        access_token: authData.session?.access_token || '',
        refresh_token: authData.session?.refresh_token || '',
      },
    };
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Logout error:', error.message);
  }

  async getCurrentUser(): Promise<User> {
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
}

export const authService = new AuthService();
