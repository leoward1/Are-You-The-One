import { supabase } from '../config/supabase';
import type { User, SignupData, LoginCredentials } from '../types';

export const supabaseService = {
  // Auth methods
  async signUp(data: SignupData) {
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

    if (error) throw error;
    return authData;
  },

  async signIn(credentials: LoginCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // User profile methods
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateUserProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Storage methods
  async uploadPhoto(userId: string, file: Blob, fileName: string) {
    const filePath = `${userId}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('photos')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  async deletePhoto(filePath: string) {
    const { error } = await supabase.storage
      .from('photos')
      .remove([filePath]);

    if (error) throw error;
  },

  // Real-time subscriptions
  subscribeToMatches(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('matches')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },

  subscribeToMessages(chatId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`messages:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        callback
      )
      .subscribe();
  },
};
