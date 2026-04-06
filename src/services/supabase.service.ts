import { supabase } from '../config/supabase';
import type { User, SignupData, LoginCredentials } from '../types';
import { sanitizeFileName, sanitizeText } from '../utils/sanitizer';
import { validateFile, FILE_LIMITS } from '../utils/validators';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

export const supabaseService = {
  // Auth methods
  async signUp(data: SignupData) {
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== userId) throw new Error('Not authorized to update this profile');
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

  // Helper: read a local file URI as an ArrayBuffer using expo-file-system
  async readFileAsArrayBuffer(uri: string): Promise<ArrayBuffer> {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return decode(base64);
  },

  async uploadPhoto(userId: string, fileUri: string, fileName: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== userId) throw new Error('Not authorized to upload for this user');

    // Get file info for size validation
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) throw new Error('File not found');
    const fileSize = (fileInfo as any).size || 0;

    // SECURITY: Validate file size (type checked by extension)
    if (fileSize > FILE_LIMITS.PHOTO.maxSizeBytes) {
      const mb = (FILE_LIMITS.PHOTO.maxSizeBytes / (1024 * 1024)).toFixed(0);
      throw new Error(`Photo is too large (max ${mb}MB)`);
    }

    const safeFileName = sanitizeFileName(fileName);
    const filePath = `${userId}/${safeFileName}`;

    // Read file as ArrayBuffer (reliable on React Native)
    const arrayBuffer = await this.readFileAsArrayBuffer(fileUri);

    const { data, error } = await supabase.storage
      .from('photos')
      .upload(filePath, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  async uploadVideo(userId: string, fileUri: string, fileName: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== userId) throw new Error('Not authorized to upload for this user');

    // Get file info for size validation
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) throw new Error('Video file not found');
    const fileSize = (fileInfo as any).size || 0;

    // SECURITY: Validate file size
    if (fileSize > FILE_LIMITS.VIDEO.maxSizeBytes) {
      const mb = (FILE_LIMITS.VIDEO.maxSizeBytes / (1024 * 1024)).toFixed(0);
      throw new Error(`Video is too large (max ${mb}MB)`);
    }

    const safeFileName = sanitizeFileName(fileName);
    const filePath = `${userId}/${safeFileName}`;

    // Read file as ArrayBuffer (reliable on React Native)
    const arrayBuffer = await this.readFileAsArrayBuffer(fileUri);

    // Upload to dedicated 'videos' bucket
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(filePath, arrayBuffer, {
        contentType: 'video/mp4',
        upsert: true,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  async deletePhoto(filePath: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // SECURITY: Ensure the user can only delete their own photos
    if (!filePath.startsWith(`${user.id}/`)) {
      throw new Error('Not authorized to delete this photo');
    }

    const { error } = await supabase.storage
      .from('photos')
      .remove([filePath]);

    if (error) throw error;
  },

  // Real-time subscriptions
  subscribeToMatches(userId: string, callback: (payload: any) => void) {
    // matches table uses user_a_id / user_b_id — subscribe to both columns
    const channelA = supabase
      .channel(`matches:user_a:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `user_a_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    const channelB = supabase
      .channel(`matches:user_b:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `user_b_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    // Return channelA for backwards compat; callers needing full cleanup
    // should unsubscribe from both channels
    return channelA;
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
