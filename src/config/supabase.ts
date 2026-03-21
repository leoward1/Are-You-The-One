import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Direct hardcoding to resolve TestFlight environment issues
const supabaseUrl = 'https://jaspfotwnmjqqwoujnfm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imphc3Bmb3R3bm1qcXF3b3VqbmZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MDM3NjMsImV4cCI6MjA1NjA3OTc2M30.JVwCGHVDdGTUKgZMqYCVlXwwzJjXWkMWbPQGQXLTMpg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
