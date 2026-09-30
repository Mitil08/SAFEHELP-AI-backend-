import { createClient } from '@supabase/supabase-js';
import { ENV } from './env.js';

let supabaseClient = null;
let isConfigured = false;

if (ENV.SUPABASE_URL && (ENV.SUPABASE_SERVICE_ROLE_KEY || ENV.SUPABASE_ANON_KEY)) {
  try {
    const key = ENV.SUPABASE_SERVICE_ROLE_KEY || ENV.SUPABASE_ANON_KEY;
    supabaseClient = createClient(ENV.SUPABASE_URL, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    isConfigured = true;
    console.log('✅ Supabase client initialized successfully.');
  } catch (err) {
    console.warn('⚠️ Supabase initialization failed:', err.message);
  }
} else {
  console.log('ℹ️ Supabase credentials not set or incomplete in .env. Running with local persistent data engine fallback.');
}

export const supabase = supabaseClient;
export const isSupabaseReady = () => isConfigured && !!supabaseClient;
