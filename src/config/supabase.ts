import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Custom storage adapter for Supabase using SecureStore
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

// Read from expo-constants (set via app.json extra block)
// Fallback to hardcoded values to guarantee the build always has credentials
const supabaseUrl: string =
  Constants.expoConfig?.extra?.supabaseUrl ??
  'https://jaspfotwnmjqqwoujnfm.supabase.co';

const supabaseAnonKey: string =
  Constants.expoConfig?.extra?.supabaseAnonKey ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imphc3Bmb3R3bm1qcXF3b3VqbmZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MDM3NjMsImV4cCI6MjA1NjA3OTc2M30.JVwCGHVDdGTUKgZMqYCVlXwwzJjXWkMWbPQGQXLTMpg';

if (__DEV__) {
  console.log('Supabase URL:', supabaseUrl ? 'loaded' : 'MISSING');
  console.log('Supabase Key:', supabaseAnonKey ? 'loaded' : 'MISSING');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});