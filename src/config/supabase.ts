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
  'sb_publishable_GH7GLZCvo9b99qrnsCNBUw_4S8gjI84';

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