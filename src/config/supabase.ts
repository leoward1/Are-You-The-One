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
// SECURITY: No hardcoded fallback — app will fail visibly if keys are missing
const supabaseUrl: string =
  process.env.EXPO_PUBLIC_SUPABASE_URL || 
  Constants.expoConfig?.extra?.supabaseUrl || 
  '';

const supabaseAnonKey: string =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
  Constants.expoConfig?.extra?.supabaseAnonKey || 
  '';

if (__DEV__) {
  console.log('Supabase URL:', supabaseUrl ? '✅ loaded' : '❌ MISSING');
  console.log('Supabase Key:', supabaseAnonKey ? '✅ loaded' : '❌ MISSING');
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('[Security] Supabase credentials are missing from environment variables (.env).');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});